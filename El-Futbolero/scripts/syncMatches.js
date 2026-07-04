/**
 * Script de sincronización CONTINUA — El-Futbolero
 *
 * Estrategia de intervalos inteligentes:
 *   - Hay partidos EN VIVO → cada 60s
 *   - Hay partido en las próximas 2h  → cada 5 min
 *   - Sin nada inminente              → cada 15 min
 *
 * Uso:
 *   node scripts/syncMatches.js
 *
 * Requiere en scripts/.env:
 *   FOOTBALL_DATA_TOKEN, SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY
 */

import { createClient } from "@supabase/supabase-js";
import "dotenv/config";

// ─── Validación de entorno ───────────────────────────────────────────────────

const { FOOTBALL_DATA_TOKEN, SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY } =
  process.env;

if (!FOOTBALL_DATA_TOKEN || !SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
  console.error("❌ Faltan variables de entorno.");
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

// ─── Constantes ──────────────────────────────────────────────────────────────

const API_URL = "https://api.football-data.org/v4/competitions/WC/matches";
const INTERVAL_LIVE = 60_000; // 60s  — partido en vivo
const INTERVAL_SOON = 5 * 60_000; // 5min — partido en < 2h
const INTERVAL_IDLE = 15 * 60_000; // 15min — sin partidos inminentes
const WINDOW_SOON_MS = 2 * 60 * 60_000;

// ─── Helpers ─────────────────────────────────────────────────────────────────

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

const ts = () =>
  new Date().toLocaleString("es-CO", { timeZone: "America/Bogota" });

function mapStatus(s) {
  if (s === "FINISHED" || s === "AWARDED") return "finished";
  if (s === "IN_PLAY" || s === "PAUSED") return "live";
  return "scheduled";
}

/**
 * Estructura real de `score` en football-data.org v4 (confirmada en la
 * documentación oficial, docs.football-data.org/general/v4/overtime.html
 * y /general/v4/index.html — "Breaking changes v4"):
 *
 *   score.winner       "HOME_TEAM" | "AWAY_TEAM" | "DRAW" | null
 *                      Campo oficial que la propia API ya calcula: quién
 *                      ganó el partido en su totalidad (90' + alargue +
 *                      penales si los hubo). Es la fuente de verdad para
 *                      saber quién avanza — no hay que inferirlo
 *                      comparando marcadores.
 *   score.duration     "REGULAR" | "EXTRA_TIME" | "PENALTY_SHOOTOUT"
 *   score.regularTime  marcador de los 90 minutos (tiempo reglamentario).
 *                      Presente siempre que duration !== "REGULAR".
 *   score.fullTime     marcador FINAL ACUMULADO de todo el partido (90'
 *                      + alargue + penales sumados). NO es el marcador
 *                      de 90 minutos cuando hubo alargue o penales — por
 *                      eso antes se veía "2-1" en vez de "1-1": el
 *                      código caía a fullTime cuando regularTime no se
 *                      leía bien, y fullTime ya trae los goles extra
 *                      sumados.
 *   score.extraTime    SOLO los goles anotados durante el alargue (no es
 *                      el marcador acumulado a los 120').
 *   score.penalties    marcador de la tanda de penales tal cual la
 *                      entrega la API (no hay que restarle nada a
 *                      fullTime; esa resta era el bug del comentario
 *                      anterior, que además sumaba de más si hubo goles
 *                      en el alargue antes de ir a penales).
 *
 * Lo que se MUESTRA en la app (score_home/score_away) es SIEMPRE
 * regularTime (90 minutos), y lo que decide quién avanza es SIEMPRE
 * score.winner — dos cosas totalmente independientes.
 */
function extractScore(m) {
  const score = m.score || {};

  const duration = score.duration;
  const regularTime = score.regularTime;
  const fullTime = score.fullTime;
  const penalties = score.penalties;
  const winner = score.winner;

  const wentToPenalties = duration === "PENALTY_SHOOTOUT";
  const wentToExtraTime = duration === "EXTRA_TIME" || wentToPenalties;

  // Marcador que se muestra: 90 minutos. Si el partido es de temporada
  // regular (duration === "REGULAR"), regularTime no viene en la API y
  // fullTime ya ES el marcador de 90 minutos, así que sirve de respaldo.
  const matchScore = regularTime?.home != null ? regularTime : fullTime;

  // Marcador de penales tal cual lo entrega la API.
  const penalty_home = wentToPenalties ? (penalties?.home ?? null) : null;
  const penalty_away = wentToPenalties ? (penalties?.away ?? null) : null;

  // Quién avanza: se usa el campo oficial score.winner, no se infiere.
  let winner_team = null;
  if (winner === "HOME_TEAM") winner_team = m.homeTeam.name;
  else if (winner === "AWAY_TEAM") winner_team = m.awayTeam.name;

  return {
    score_home: matchScore?.home ?? null,
    score_away: matchScore?.away ?? null,
    penalty_home,
    penalty_away,
    went_to_penalties: wentToPenalties,
    went_to_extra_time: wentToExtraTime,
    winner_team,
  };
}

function calcularIntervalo(rows) {
  if (rows.some((r) => r.status === "live")) return INTERVAL_LIVE;
  const now = Date.now();
  if (
    rows.some((r) => {
      if (r.status !== "scheduled") return false;
      const diff = new Date(r.match_date).getTime() - now;
      return diff >= 0 && diff <= WINDOW_SOON_MS;
    })
  )
    return INTERVAL_SOON;
  return INTERVAL_IDLE;
}

// ─── Fetch de la API ─────────────────────────────────────────────────────────

async function fetchMatches() {
  const res = await fetch(API_URL, {
    headers: { "X-Auth-Token": FOOTBALL_DATA_TOKEN },
  });
  if (!res.ok) {
    const txt = await res.text();
    throw new Error(`football-data.org ${res.status}: ${txt}`);
  }
  const data = await res.json();
  return data.matches || [];
}

// ─── Upsert inteligente ───────────────────────────────────────────────────────
//
// El trigger fn_recalcular_puntos_partido falla en algunos entornos cuando
// se hace un INSERT (upsert con nueva fila). Solución:
//   1. Consultar qué ids ya existen en la tabla.
//   2. Los que YA EXISTEN  → UPDATE solo (score_home, score_away, penales, stage, status, updated_at).
//   3. Los que NO EXISTEN  → INSERT limpio con todos los campos.
// Así evitamos que el trigger rompa el INSERT de partidos nuevos, y los
// UPDATEs solo tocan los campos que realmente cambian.

async function syncRows(rows) {
  if (rows.length === 0) return 0;

  const ids = rows.map((r) => r.id);

  // Qué ids ya están en la BD
  const { data: existing, error: fetchErr } = await supabase
    .from("matches")
    .select("id")
    .in("id", ids);

  if (fetchErr) {
    console.error("  ❌ Error consultando ids existentes:", fetchErr.message);
    return 0;
  }

  const existingIds = new Set((existing || []).map((e) => e.id));
  const toInsert = rows.filter((r) => !existingIds.has(r.id));
  const toUpdate = rows.filter((r) => existingIds.has(r.id));

  let saved = 0;
  const BATCH = 50;

  // ── INSERTs (partidos nuevos) ─────────────────────────────────────────────
  for (let i = 0; i < toInsert.length; i += BATCH) {
    const batch = toInsert.slice(i, i + BATCH);
    const { error } = await supabase.from("matches").insert(batch);
    if (error) {
      console.error(
        `  ❌ INSERT lote ${Math.floor(i / BATCH) + 1}:`,
        error.message,
      );
    } else {
      saved += batch.length;
    }
  }

  // ── UPDATEs (partidos existentes — solo campos que cambian) ───────────────
  // Hacemos los updates en paralelo de a BATCH para no saturar la conexión
  for (let i = 0; i < toUpdate.length; i += BATCH) {
    const batch = toUpdate.slice(i, i + BATCH);
    const results = await Promise.all(
      batch.map((r) =>
        supabase
          .from("matches")
          .update({
            score_home: r.score_home,
            score_away: r.score_away,
            penalty_home: r.penalty_home,
            penalty_away: r.penalty_away,
            went_to_penalties: r.went_to_penalties,
            went_to_extra_time: r.went_to_extra_time,
            winner_team: r.winner_team,
            stage: r.stage,
            status: r.status,
            home_crest: r.home_crest,
            away_crest: r.away_crest,
            updated_at: r.updated_at,
          })
          .eq("id", r.id),
      ),
    );
    const errors = results.filter((r) => r.error).map((r) => r.error.message);
    if (errors.length) {
      console.error("  ❌ UPDATE errores:", [...new Set(errors)].join(" | "));
    }
    saved += batch.length - errors.length;
  }

  if (toInsert.length)
    console.log(`  ➕ ${toInsert.length} partidos nuevos insertados.`);
  if (toUpdate.length)
    console.log(`  🔁 ${toUpdate.length} partidos actualizados.`);

  return saved;
}

// ─── Cálculo de puntos ───────────────────────────────────────────────────────
// Importante: los puntos de la predicción SIEMPRE se calculan contra el
// marcador de 90' (score_home/score_away), nunca contra los penales.

async function calcularPuntosPartidosFinalizados(rows) {
  const { calcularPuntos } = await import("../src/lib/scoring.js");

  const finished = rows.filter((r) => r.status === "finished");
  if (finished.length === 0) return;

  console.log(
    `  🧮 Recalculando puntos para ${finished.length} partido(s) finalizado(s)...`,
  );

  for (const match of finished) {
    if (match.score_home === null || match.score_away === null) continue;

    const { data: predictions, error } = await supabase
      .from("predictions")
      .select("*")
      .eq("match_id", match.id);

    if (error) {
      console.error(`  ❌ Predicciones de ${match.id}:`, error.message);
      continue;
    }

    let cambios = 0;
    for (const pred of predictions || []) {
      const points = calcularPuntos(
        pred.pred_home,
        pred.pred_away,
        match.score_home,
        match.score_away,
      );

      if (pred.points === points) continue;
      cambios++;

      const diff = points - (pred.points || 0);

      await supabase.from("predictions").update({ points }).eq("id", pred.id);

      const { data: profile } = await supabase
        .from("profiles")
        .select("total_points")
        .eq("id", pred.user_id)
        .single();

      if (profile) {
        await supabase
          .from("profiles")
          .update({ total_points: (profile.total_points || 0) + diff })
          .eq("id", pred.user_id);
      }
    }

    const icon =
      match.score_home !== null
        ? `${match.score_home}-${match.score_away}`
        : "?-?";
    const pen = match.went_to_penalties
      ? ` (pen. ${match.penalty_home}-${match.penalty_away})`
      : "";
    const ganador = match.winner_team ? ` → avanza ${match.winner_team}` : "";
    console.log(
      `  ✅ ${match.team_home} ${icon}${pen} ${match.team_away}${ganador}` +
        (cambios > 0
          ? ` → ${cambios} predicción(es) actualizada(s)`
          : " → sin cambios"),
    );
  }
}

// ─── Log de partidos cercanos ─────────────────────────────────────────────────

function logPartidosCercanos(rows) {
  const now = Date.now();
  const W = 6 * 60 * 60_000;
  const cercanos = rows.filter((r) => {
    const t = new Date(r.match_date).getTime();
    return t >= now - W && t <= now + W;
  });
  if (cercanos.length === 0) return;

  console.log("  📅 Partidos en ventana ±6h:");
  cercanos.forEach((r) => {
    const hora = new Date(r.match_date).toLocaleString("es-CO", {
      timeZone: "America/Bogota",
      hour: "2-digit",
      minute: "2-digit",
    });
    const marc =
      r.score_home !== null ? `${r.score_home}-${r.score_away}` : "vs";
    const pen = r.went_to_penalties
      ? ` (pen. ${r.penalty_home}-${r.penalty_away})`
      : "";
    const est =
      r.status === "live"
        ? "🔴 EN VIVO"
        : r.status === "finished"
          ? "✅ FIN"
          : "🕐 PROG";
    console.log(
      `    ${est} ${hora} | ${r.team_home} ${marc}${pen} ${r.team_away}`,
    );
  });
}

// ─── Ciclo único ─────────────────────────────────────────────────────────────

async function syncOnce() {
  const t0 = Date.now();
  console.log(`\n🔄 [${ts()}] Sincronizando...`);

  const apiMatches = await fetchMatches();

  // Filtrar partidos con equipos TBD (name = null) — la BD tiene NOT NULL
  const valid = apiMatches.filter((m) => m.homeTeam?.name && m.awayTeam?.name);
  const skipped = apiMatches.length - valid.length;

  console.log(
    `  📦 ${apiMatches.length} recibidos, ${valid.length} válidos` +
      (skipped > 0 ? `, ${skipped} omitidos (equipos TBD).` : "."),
  );

  const rows = valid.map((m) => {
    const {
      score_home,
      score_away,
      penalty_home,
      penalty_away,
      went_to_penalties,
      went_to_extra_time,
      winner_team,
    } = extractScore(m);

    return {
      id: String(m.id),
      team_home: m.homeTeam.name,
      team_away: m.awayTeam.name,
      home_crest: m.homeTeam.crest || null,
      away_crest: m.awayTeam.crest || null,
      match_date: m.utcDate,
      score_home,
      score_away,
      penalty_home,
      penalty_away,
      went_to_penalties,
      went_to_extra_time,
      winner_team,
      stage: m.stage || null,
      status: mapStatus(m.status),
      updated_at: new Date().toISOString(),
    };
  });

  const live = rows.filter((r) => r.status === "live").length;
  const finished = rows.filter((r) => r.status === "finished").length;
  const sched = rows.filter((r) => r.status === "scheduled").length;
  console.log(
    `  📊 ${live} en vivo | ${finished} finalizados | ${sched} programados`,
  );

  if (live > 0) {
    const names = rows
      .filter((r) => r.status === "live")
      .map(
        (r) => `${r.team_home} ${r.score_home}-${r.score_away} ${r.team_away}`,
      )
      .join("  |  ");
    console.log(`  🔴 EN VIVO: ${names}`);
  }

  const saved = await syncRows(rows);
  console.log(`  💾 ${saved}/${valid.length} partidos procesados en Supabase.`);

  logPartidosCercanos(rows);
  await calcularPuntosPartidosFinalizados(rows);

  console.log(`  ⏱  ${Date.now() - t0}ms`);
  return rows;
}

// ─── Loop principal ───────────────────────────────────────────────────────────

async function runLoop() {
  console.log(
    "🚀 El-Futbolero — Sincronización continua iniciada. (Ctrl+C para detener)",
  );

  let rows = [];
  try {
    rows = await syncOnce();
  } catch (err) {
    console.error("  ❌ Error en primer ciclo:", err.message);
  }

  while (true) {
    const next = calcularIntervalo(rows);
    console.log(`\n⏳ Próxima sync en ${(next / 60_000).toFixed(1)} min...`);
    await sleep(next);

    try {
      rows = await syncOnce();
    } catch (err) {
      console.error("  ❌ Error:", err.message);
      console.log("  ↩️  Reintentando en 2 min...");
      await sleep(2 * 60_000);
    }
  }
}

runLoop();
