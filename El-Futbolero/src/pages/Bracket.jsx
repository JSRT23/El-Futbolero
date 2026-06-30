import { useEffect, useRef, useState } from "react";
import { supabase } from "../lib/supabaseClient";

const IconShieldGray = () => (
  <svg
    width="20"
    height="20"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.5"
    strokeLinecap="round"
    strokeLinejoin="round"
    aria-hidden="true"
  >
    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
  </svg>
);

const IconBracketBig = () => (
  <svg
    width="22"
    height="22"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.8"
    strokeLinecap="round"
    strokeLinejoin="round"
    aria-hidden="true"
  >
    <path d="M4 5h4v4H4z" />
    <path d="M4 15h4v4H4z" />
    <path d="M8 7h3a2 2 0 0 1 2 2v0" />
    <path d="M8 17h3a2 2 0 0 1 2-2v0" />
    <path d="M13 9v6" />
    <path d="M13 12h4" />
    <path d="M17 9h3v6h-3z" />
  </svg>
);

const IconSwitch = () => (
  <svg
    width="20"
    height="20"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    aria-hidden="true"
  >
    <path d="M16 3h5v5" />
    <path d="M21 3l-7 7" />
    <path d="M8 21H3v-5" />
    <path d="M3 21l7-7" />
  </svg>
);

const IconChevronRight = () => (
  <svg
    width="18"
    height="18"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2.5"
    strokeLinecap="round"
    strokeLinejoin="round"
    aria-hidden="true"
  >
    <polyline points="9 6 15 12 9 18" />
  </svg>
);

// Copa del Mundo: silueta más fiel a la real (cuerpo en espiral ensanchado
// hacia arriba, base ancha, tallo corto).
const IconWorldCup = () => (
  <svg
    width="58"
    height="70"
    viewBox="0 0 58 70"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    aria-hidden="true"
  >
    <defs>
      <linearGradient id="wcGold" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stopColor="#FEF3C7" />
        <stop offset="35%" stopColor="#FBBF24" />
        <stop offset="70%" stopColor="#D97706" />
        <stop offset="100%" stopColor="#92400E" />
      </linearGradient>
    </defs>
    <ellipse cx="29" cy="65" rx="16" ry="4" fill="url(#wcGold)" />
    <rect x="20" y="58" width="18" height="8" rx="2" fill="url(#wcGold)" />
    <path d="M25 44h8l-1.5 14h-5z" fill="url(#wcGold)" />
    <path
      d="M29 4c-6 0-10 4-10 9 0 4 2 7 5 9-4 1-7 4-7 8 0 5 5 9 12 9s12-4 12-9c0-4-3-7-7-8 3-2 5-5 5-9 0-5-4-9-10-9z"
      fill="url(#wcGold)"
    />
    <path
      d="M22 13c0 4 2 7 5 9M36 13c0 4-2 7-5 9M21 30c0 3 2 5 4 6M37 30c0 3-2 5-4 6"
      stroke="#92400E"
      strokeWidth="1"
      strokeLinecap="round"
      opacity="0.5"
      fill="none"
    />
    <circle
      cx="29"
      cy="6"
      r="4.5"
      fill="#FEF3C7"
      stroke="#92400E"
      strokeWidth="0.6"
    />
  </svg>
);

// Rondas principales del cuadro de eliminación directa, en orden, con la
// cantidad FIJA de cupos que tiene cada una (independiente de cuántos
// partidos haya cargado football-data.org todavía).
const MAIN_ROUNDS = [
  { key: "LAST_32", label: "Eliminatoria de 32", slots: 16 },
  { key: "LAST_16", label: "Octavos de final", slots: 8 },
  { key: "QUARTER_FINALS", label: "Cuartos de final", slots: 4 },
  { key: "SEMI_FINALS", label: "Semifinal", slots: 2 },
  { key: "FINAL", label: "Final", slots: 1 },
];

const CARD_WIDTH = 280;
const CARD_HEIGHT = 102;
const CARD_GAP = 18;
const CONNECTOR_WIDTH = 26;

function getMatchState(match) {
  if (!match) return "tbd";
  if (!match.match_date) return "tbd";
  if (match.status === "finished") return "finished";
  if (match.status === "live") return "live";
  const now = new Date();
  const matchDate = new Date(match.match_date);
  if (matchDate <= now) return "live";
  return "scheduled";
}

function getDateLabel(match) {
  if (!match.match_date) return "Por confirmar";

  const date = new Date(match.match_date);
  const now = new Date();

  const startOfDay = (d) =>
    new Date(d.getFullYear(), d.getMonth(), d.getDate());
  const diffDays = Math.round(
    (startOfDay(date) - startOfDay(now)) / (1000 * 60 * 60 * 24),
  );

  const timeStr = date.toLocaleTimeString("es-CO", {
    hour: "numeric",
    minute: "2-digit",
  });

  if (diffDays === 0) return `Hoy, ${timeStr}`;
  if (diffDays === -1) return "Ayer";
  if (diffDays === 1) return `Mañana, ${timeStr}`;
  const wd = date.toLocaleDateString("es-CO", { weekday: "short" });
  const wdCap = wd.charAt(0).toUpperCase() + wd.slice(1).replace(".", "");
  if (diffDays < -1) return wdCap;
  const dm = date.toLocaleDateString("es-CO", {
    day: "numeric",
    month: "numeric",
  });
  return `${wdCap}, ${dm}, ${timeStr}`;
}

/** Determina el nombre del equipo ganador de un partido finalizado,
 * considerando penales si el resultado regular quedó empatado. */
function getWinnerName(match) {
  if (!match || match.status !== "finished") return null;
  if (match.score_home == null || match.score_away == null) return null;

  if (match.score_home > match.score_away) return match.team_home;
  if (match.score_away > match.score_home) return match.team_away;

  if (match.went_to_penalties && match.penalty_home != null) {
    return match.penalty_home > match.penalty_away
      ? match.team_home
      : match.team_away;
  }
  return null;
}

function getWinnerCrest(match) {
  if (!match) return null;
  const winnerName = getWinnerName(match);
  if (!winnerName) return null;
  return winnerName === match.team_home ? match.home_crest : match.away_crest;
}

function makeVirtualSlot(
  stageKey,
  idx,
  teamHome,
  teamAway,
  crestHome,
  crestAway,
) {
  return {
    match: {
      id: `${stageKey}-virtual-${idx}`,
      team_home: teamHome,
      team_away: teamAway,
      home_crest: crestHome,
      away_crest: crestAway,
      score_home: null,
      score_away: null,
      penalty_home: null,
      penalty_away: null,
      went_to_penalties: false,
      status: "scheduled",
      match_date: null,
      isVirtual: true,
    },
  };
}

/**
 * Construye el árbol completo del bracket (todas las rondas, todos los
 * cupos), usando los partidos REALES como fuente de verdad para determinar
 * qué dos equipos de la ronda anterior se enfrentan entre sí — en vez de
 * asumir que el orden de "id" de la API refleja la posición oficial del
 * cruce (no es confiable, los ids son solo cronológicos).
 *
 * Para cada ronda > 0:
 *   1. Por cada partido real de esa ronda, se buscan —entre los ganadores
 *      de la ronda anterior, en cualquier posición— los dos que coincidan
 *      con sus equipos. Se "consumen" esos dos ganadores.
 *   2. Los ganadores que sobran (sin partido real todavía) se emparejan
 *      en el orden en que aparecían, para los cupos virtuales restantes.
 *   3. La ronda ANTERIOR se reordena para que cada pareja consumida quede
 *      adyacente, en el mismo orden en que se construyeron los cupos de
 *      esta ronda — así los conectores visuales siempre cuadran y nunca
 *      se duplica un equipo en dos cupos distintos.
 */
function buildBracketTree(matchesByStage) {
  const tree = [];
  let prevSlots = null;

  MAIN_ROUNDS.forEach((round, roundIdx) => {
    if (roundIdx === 0) {
      const realMatches = (matchesByStage[round.key] || [])
        .slice()
        .sort((a, b) => Number(a.id) - Number(b.id));

      const slots = [];
      for (let i = 0; i < round.slots; i++) {
        slots.push(
          realMatches[i]
            ? { match: realMatches[i] }
            : makeVirtualSlot(round.key, i, null, null, null, null),
        );
      }
      tree.push({ ...round, slots });
      prevSlots = slots;
      return;
    }

    const realMatchesPool = (matchesByStage[round.key] || []).slice();
    const prevWinners = prevSlots.map((s) => ({
      name: getWinnerName(s.match),
      crest: getWinnerCrest(s.match),
    }));

    const usedPrevIdx = new Set();
    const pairsOrdered = [];

    // Paso 1: cada partido real "reclama" sus dos ganadores alimentadores,
    // sin importar en qué posición estaban.
    for (const m of realMatchesPool) {
      let foundA = -1;
      let foundB = -1;
      for (let i = 0; i < prevWinners.length; i++) {
        if (usedPrevIdx.has(i) || !prevWinners[i].name) continue;
        if (prevWinners[i].name === m.team_home) foundA = i;
        else if (prevWinners[i].name === m.team_away) foundB = i;
      }
      if (foundA !== -1 && foundB !== -1) {
        usedPrevIdx.add(foundA);
        usedPrevIdx.add(foundB);
        pairsOrdered.push({ idxs: [foundA, foundB], realMatch: m });
      }
    }

    // Paso 2: ganadores sobrantes (sin partido real aún) se emparejan en
    // orden, para los cupos virtuales que falten.
    const leftover = [];
    for (let i = 0; i < prevWinners.length; i++) {
      if (!usedPrevIdx.has(i)) leftover.push(i);
    }
    for (let k = 0; k < leftover.length; k += 2) {
      const a = leftover[k];
      const b = leftover[k + 1];
      if (b === undefined) {
        pairsOrdered.push({ idxs: [a], realMatch: null });
      } else {
        pairsOrdered.push({ idxs: [a, b], realMatch: null });
      }
    }

    // Mantener el flujo visual top-to-bottom según la posición original
    pairsOrdered.sort((p1, p2) => Math.min(...p1.idxs) - Math.min(...p2.idxs));

    const newPrevSlots = [];
    const slots = [];

    pairsOrdered.forEach((pair, i) => {
      const [a, b] = pair.idxs;
      newPrevSlots.push(prevSlots[a]);
      if (b !== undefined) newPrevSlots.push(prevSlots[b]);

      if (pair.realMatch) {
        slots.push({ match: pair.realMatch });
      } else {
        const expectedA = prevWinners[a]?.name ?? null;
        const expectedB =
          b !== undefined ? (prevWinners[b]?.name ?? null) : null;
        const crestA = prevWinners[a]?.crest ?? null;
        const crestB = b !== undefined ? (prevWinners[b]?.crest ?? null) : null;
        slots.push(
          makeVirtualSlot(round.key, i, expectedA, expectedB, crestA, crestB),
        );
      }
    });

    // Si quedaron menos cupos que el tamaño fijo de la ronda (puede pasar
    // si aún no hay suficientes ganadores definidos), se rellenan vacíos.
    while (slots.length < round.slots) {
      slots.push(
        makeVirtualSlot(round.key, slots.length, null, null, null, null),
      );
    }

    tree[roundIdx - 1].slots = newPrevSlots;
    tree.push({ ...round, slots });
    prevSlots = slots;
  });

  return tree;
}

/** Posición vertical de cada cupo: la ronda 0 se distribuye uniformemente,
 * y cada cupo de las rondas siguientes se centra entre sus dos cupos
 * alimentadores. */
function buildPositions(slotsPerRound) {
  const slot0 = CARD_HEIGHT + CARD_GAP;
  const round0Count = slotsPerRound[0];

  let currentCenters = [];
  for (let i = 0; i < round0Count; i++) {
    const top = i * slot0;
    currentCenters.push({ top, center: top + CARD_HEIGHT / 2 });
  }

  const positions = [currentCenters];

  for (let r = 1; r < slotsPerRound.length; r++) {
    const count = slotsPerRound[r];
    const next = [];
    for (let k = 0; k < count; k++) {
      const a = currentCenters[k * 2];
      const b = currentCenters[k * 2 + 1] || a;
      const center = (a.center + b.center) / 2;
      next.push({ top: center - CARD_HEIGHT / 2, center });
    }
    positions.push(next);
    currentCenters = next;
  }

  const totalHeight = round0Count * slot0 - CARD_GAP;
  return { positions, totalHeight };
}

function TeamRow({ name, crest, score, isWinner, showScore }) {
  return (
    <div className="flex items-center justify-between gap-2 py-1">
      <div className="flex items-center gap-2 min-w-0">
        {crest ? (
          <img
            src={crest}
            alt={name}
            className="w-5 h-5 object-contain shrink-0 rounded-sm"
          />
        ) : (
          <span className="w-5 h-5 flex items-center justify-center text-text-muted/50 shrink-0">
            <IconShieldGray />
          </span>
        )}
        <span
          className={`text-sm truncate ${
            isWinner
              ? "font-bold text-text"
              : name
                ? "text-text-muted"
                : "text-text-muted/60"
          }`}
        >
          {name || "A definir"}
        </span>
      </div>
      {showScore && (
        <div className="flex items-center gap-1 shrink-0">
          <span
            className={`text-sm ${isWinner ? "font-bold text-text" : "text-text-muted"}`}
          >
            {score ?? "0"}
          </span>
          {isWinner && <span className="text-text-muted">‹</span>}
        </div>
      )}
    </div>
  );
}

function BracketMatchCard({ match, compact }) {
  // Modo compacto: SOLO banderas/escudos + nombre, sin fecha, sin estado
  // (Fin/En vivo) y sin marcador. Mantiene el mismo alto que la tarjeta
  // detallada para que los conectores SVG entre rondas no se desalineen.
  if (compact) {
    return (
      <div
        className="bg-bg-card border border-white/8 rounded-2xl shadow-md shadow-black/20 overflow-hidden"
        style={{ width: CARD_WIDTH - 60, height: CARD_HEIGHT }}
      >
        {[
          { name: match.team_home, crest: match.home_crest },
          { name: match.team_away, crest: match.away_crest },
        ].map((team, i) => (
          <div
            key={i}
            className={`flex items-center gap-2 px-3 ${
              i === 0 ? "border-b border-white/8" : ""
            }`}
            style={{ height: CARD_HEIGHT / 2 }}
          >
            {team.crest ? (
              <img
                src={team.crest}
                alt={team.name}
                className="w-5 h-5 object-contain shrink-0 rounded-sm"
              />
            ) : (
              <span className="w-5 h-5 flex items-center justify-center text-text-muted/50 shrink-0">
                <IconShieldGray />
              </span>
            )}
            <span
              className={`text-sm font-semibold truncate ${
                team.name ? "text-text" : "text-text-muted/60"
              }`}
            >
              {team.name || "A definir"}
            </span>
          </div>
        ))}
      </div>
    );
  }

  const state = getMatchState(match);
  const winnerName = getWinnerName(match);
  const dateLabel = getDateLabel(match);
  const showScore = state === "finished" || state === "live";

  return (
    <div
      className="bg-bg-card border border-white/8 rounded-2xl px-4 py-3 shadow-md shadow-black/20"
      style={{ width: CARD_WIDTH, height: CARD_HEIGHT }}
    >
      <div className="flex items-center justify-between mb-1.5">
        <span className="text-xs text-text-muted">{dateLabel}</span>
        {state === "finished" && (
          <span className="text-[10px] bg-white/8 text-text-muted px-2 py-0.5 rounded-full font-medium">
            {match.went_to_penalties ? "Fin (P)" : "Fin"}
          </span>
        )}
        {state === "live" && (
          <span className="text-[10px] bg-danger/15 text-danger px-2 py-0.5 rounded-full font-semibold animate-pulse">
            En vivo
          </span>
        )}
      </div>

      <TeamRow
        name={match.team_home}
        crest={match.home_crest}
        score={match.score_home}
        isWinner={!!winnerName && winnerName === match.team_home}
        showScore={showScore && !!match.team_home}
      />
      <TeamRow
        name={match.team_away}
        crest={match.away_crest}
        score={match.score_away}
        isWinner={!!winnerName && winnerName === match.team_away}
        showScore={showScore && !!match.team_away}
      />
    </div>
  );
}

function RoundConnectorSVG({ currentCenters, nextCenters, totalHeight }) {
  const half = CONNECTOR_WIDTH / 2;
  return (
    <svg
      width={CONNECTOR_WIDTH}
      height={totalHeight}
      className="shrink-0"
      style={{ display: "block" }}
    >
      {nextCenters.map((next, k) => {
        const a = currentCenters[k * 2];
        const b = currentCenters[k * 2 + 1] || a;
        return (
          <g
            key={k}
            stroke="rgba(255,255,255,0.15)"
            strokeWidth="1.5"
            fill="none"
            strokeLinecap="round"
          >
            <path d={`M0,${a.center} H${half}`} />
            <path d={`M0,${b.center} H${half}`} />
            <path d={`M${half},${a.center} V${b.center}`} />
            <path d={`M${half},${next.center} H${CONNECTOR_WIDTH}`} />
          </g>
        );
      })}
    </svg>
  );
}

export default function Bracket() {
  const [matches, setMatches] = useState([]);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState("detailed"); // "detailed" | "compact"
  const scrollRef = useRef(null);
  const roundRefs = useRef([]);

  useEffect(() => {
    loadBracket();

    const channel = supabase
      .channel("bracket-live-updates")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "matches" },
        () => loadBracket(true),
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const loadBracket = async (silent = false) => {
    if (!silent) setLoading(true);

    const allStages = [...MAIN_ROUNDS.map((r) => r.key), "THIRD_PLACE"];

    const { data, error } = await supabase
      .from("matches")
      .select("*")
      .in("stage", allStages)
      .order("match_date", { ascending: true });

    if (error) console.error(error);
    else setMatches(data || []);

    if (!silent) setLoading(false);
  };

  const isCompact = viewMode === "compact";

  const matchesByStage = MAIN_ROUNDS.reduce((acc, r) => {
    acc[r.key] = matches.filter((m) => m.stage === r.key);
    return acc;
  }, {});

  const thirdPlace = matches.filter((m) => m.stage === "THIRD_PLACE");

  const hasData = (matchesByStage.LAST_32 || []).length > 0;
  const tree = hasData ? buildBracketTree(matchesByStage) : [];

  const { positions, totalHeight } = hasData
    ? buildPositions(MAIN_ROUNDS.map((r) => r.slots))
    : { positions: [], totalHeight: 0 };

  const scrollToRound = (idx) => {
    const el = roundRefs.current[idx];
    if (el && scrollRef.current) {
      scrollRef.current.scrollTo({
        left: el.offsetLeft - 16,
        behavior: "smooth",
      });
    }
  };

  return (
    <div style={{ maxWidth: "100%", margin: "0 auto", padding: "24px 0 0" }}>
      <header className="flex items-center gap-2.5 mb-5 px-4">
        <span className="text-accent">
          <IconBracketBig />
        </span>
        <div>
          <h1 className="m-0 text-xl font-extrabold text-text tracking-tight">
            Llaves del Mundial
          </h1>
          <p className="m-0 text-[11px] text-text-muted">
            Cómo van quedando las eliminatorias
          </p>
        </div>
      </header>

      {loading && (
        <p className="text-text-muted text-center py-10 text-sm">
          Cargando llaves...
        </p>
      )}

      {!loading && !hasData && (
        <p className="text-text-muted text-center py-10 text-sm px-4">
          Aún no hay partidos de eliminatoria disponibles.
        </p>
      )}

      {!loading && hasData && (
        <>
          <div className="flex items-center gap-1.5 px-4 mb-3 overflow-x-auto">
            {tree.map((round, idx) => (
              <button
                key={round.key}
                onClick={() => scrollToRound(idx)}
                className="flex items-center gap-1 text-xs font-semibold text-text-muted hover:text-accent transition-colors whitespace-nowrap px-2 py-1 rounded-lg"
              >
                {round.label}
                {idx < tree.length - 1 && <IconChevronRight />}
              </button>
            ))}
          </div>

          <div ref={scrollRef} className="overflow-x-auto pb-4 px-4">
            <div className="flex" style={{ width: "max-content" }}>
              {tree.map((round, idx) => (
                <div
                  key={round.key}
                  className="flex shrink-0"
                  ref={(el) => (roundRefs.current[idx] = el)}
                >
                  <div className="shrink-0">
                    <div className="text-xs font-bold text-text uppercase tracking-wide mb-3 px-1">
                      {round.label}
                    </div>
                    <div
                      className="relative"
                      style={{
                        height: totalHeight,
                        width: isCompact ? CARD_WIDTH - 60 : CARD_WIDTH,
                      }}
                    >
                      {round.slots.map((slot, i) => (
                        <div
                          key={slot.match.id ?? i}
                          className="absolute"
                          style={{ top: positions[idx][i].top, left: 0 }}
                        >
                          <BracketMatchCard
                            match={slot.match}
                            compact={isCompact}
                          />
                        </div>
                      ))}
                    </div>
                  </div>

                  {idx < tree.length - 1 && (
                    <div
                      className="flex items-start"
                      style={{ paddingTop: 32 }}
                    >
                      <RoundConnectorSVG
                        currentCenters={positions[idx]}
                        nextCenters={positions[idx + 1]}
                        totalHeight={totalHeight}
                      />
                    </div>
                  )}

                  {round.key === "FINAL" && (
                    <div
                      className="flex flex-col items-center justify-center px-4 shrink-0"
                      style={{ height: totalHeight, marginTop: 32 }}
                    >
                      <IconWorldCup />
                      <span className="text-[9px] text-accent font-bold mt-1 uppercase tracking-wide whitespace-nowrap">
                        Campeón
                      </span>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>

          {(() => {
            const semiSlots =
              tree.find((r) => r.key === "SEMI_FINALS")?.slots || [];
            const realThird = thirdPlace[0] || null;
            const getLoser = (slot) => {
              if (!slot) return null;
              const m = slot.match;
              const w = getWinnerName(m);
              if (!w || !m.team_home || !m.team_away) return null;
              return w === m.team_home ? m.team_away : m.team_home;
            };
            const loserA = getLoser(semiSlots[0]);
            const loserB = getLoser(semiSlots[1]);

            const thirdPlaceDisplay = realThird || {
              id: "third-virtual",
              team_home: loserA,
              team_away: loserB,
              home_crest: null,
              away_crest: null,
              score_home: null,
              score_away: null,
              penalty_home: null,
              penalty_away: null,
              went_to_penalties: false,
              status: "scheduled",
              match_date: null,
            };

            if (!thirdPlaceDisplay.team_home && !thirdPlaceDisplay.team_away)
              return null;

            return (
              <div className="px-4 mt-2">
                <div className="text-xs font-bold text-text uppercase tracking-wide mb-2">
                  Tercer puesto
                </div>
                <div className="flex flex-col gap-3">
                  <BracketMatchCard
                    match={thirdPlaceDisplay}
                    compact={isCompact}
                  />
                </div>
              </div>
            );
          })()}
        </>
      )}

      {!loading && hasData && (
        <button
          onClick={() => setViewMode(isCompact ? "detailed" : "compact")}
          className="fixed bottom-24 right-4 z-20 flex items-center gap-2 bg-primary hover:bg-primary-dark text-white font-semibold text-xs px-4 py-2.5 rounded-full shadow-lg shadow-primary/30 active:scale-95 transition-all duration-150"
        >
          <IconSwitch />
          {isCompact ? "Ver resultados" : "Ver solo banderas"}
        </button>
      )}
    </div>
  );
}
