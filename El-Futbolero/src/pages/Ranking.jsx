import { useEffect, useState } from "react";
import { supabase } from "../lib/supabaseClient";
import { avatarFlagUrl, avatarName } from "../lib/avatars";
import { desglosePuntos } from "../lib/scoring";

// ─── Icons ───────────────────────────────────────────────────────────────────
const IconTrophy = () => (
  <svg
    width="22"
    height="22"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.8"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M8 21h8M12 17v4M17 4H7l1 9a4 4 0 0 0 8 0l1-9z" />
    <path d="M17 4c0 0 2 0 2 2s-2 4-4 4M7 4c0 0-2 0-2 2s2 4 4 4" />
  </svg>
);
const IconClose = () => (
  <svg
    width="18"
    height="18"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2.5"
    strokeLinecap="round"
  >
    <line x1="18" y1="6" x2="6" y2="18" />
    <line x1="6" y1="6" x2="18" y2="18" />
  </svg>
);

// ─── Medal config ─────────────────────────────────────────────────────────────
const MEDAL_CONFIG = {
  0: {
    shadow: `0 0 0 2px #5A3800, 0 0 0 5px #FFD700, 0 0 0 7px #B8860B, 0 0 22px rgba(255,215,0,0.65), 0 0 44px rgba(255,165,0,0.3)`,
    numBg:
      "linear-gradient(135deg, #FFE566 0%, #FFD700 40%, #FFA500 70%, #CC8800 100%)",
    numColor: "#5A3000",
    numShadow: "0 0 8px rgba(255,180,0,0.9)",
    crownColor: "#FFD700",
    label: "Líder",
    size: 46,
    badgeSize: 15,
    ptColor: "#FFD700",
    rowBg: "rgba(255,215,0,0.04)",
  },
  1: {
    shadow: `0 0 0 2px #333, 0 0 0 5px #D0D0D0, 0 0 0 7px #888, 0 0 16px rgba(200,200,200,0.5), 0 0 30px rgba(180,180,180,0.2)`,
    numBg:
      "linear-gradient(135deg, #FFFFFF 0%, #D8D8D8 40%, #B0B0B0 70%, #808080 100%)",
    numColor: "#2A2A2A",
    numShadow: "0 0 6px rgba(200,200,200,0.8)",
    crownColor: "#C8C8C8",
    label: "2° lugar",
    size: 42,
    badgeSize: 14,
    ptColor: "#C8C8C8",
    rowBg: "rgba(200,200,200,0.03)",
  },
  2: {
    shadow: `0 0 0 2px #3A1A00, 0 0 0 5px #CD8B3A, 0 0 0 7px #7B4A18, 0 0 14px rgba(180,106,42,0.55), 0 0 28px rgba(150,80,20,0.25)`,
    numBg:
      "linear-gradient(135deg, #F5D09A 0%, #CD8B3A 40%, #A06020 70%, #7B4A18 100%)",
    numColor: "#2A0E00",
    numShadow: "0 0 6px rgba(180,100,30,0.8)",
    crownColor: "#CD8B3A",
    label: "3° lugar",
    size: 38,
    badgeSize: 13,
    ptColor: "#CD8B3A",
    rowBg: "rgba(180,100,30,0.04)",
  },
};

// ─── PlayerAvatar ─────────────────────────────────────────────────────────────
const PlayerAvatar = ({ avatar, position }) => {
  const cfg = MEDAL_CONFIG[position];
  const isTop3 = !!cfg;
  const sz = cfg?.size ?? 34;
  if (isTop3)
    return (
      <div style={{ position: "relative", flexShrink: 0, marginTop: 10 }}>
        <div
          style={{
            position: "absolute",
            top: -18,
            left: "50%",
            transform: "translateX(-50%)",
            fontSize: 18,
            filter: `drop-shadow(0 0 5px ${cfg.crownColor})`,
            zIndex: 10,
            pointerEvents: "none",
          }}
        >
          👑
        </div>
        <div
          style={{
            width: sz,
            height: sz,
            borderRadius: "50%",
            boxShadow: cfg.shadow,
            background: "#0F172A",
            overflow: "hidden",
            position: "relative",
          }}
        >
          <img
            src={avatarFlagUrl(avatar)}
            alt={avatarName(avatar)}
            style={{
              width: "100%",
              height: "100%",
              objectFit: "cover",
              display: "block",
            }}
          />
          <div
            style={{
              position: "absolute",
              top: 0,
              left: 0,
              width: "100%",
              height: "50%",
              background:
                "linear-gradient(to bottom, rgba(255,255,255,0.18), transparent)",
              borderRadius: "50% 50% 0 0",
              pointerEvents: "none",
            }}
          />
        </div>
        <div
          style={{
            position: "absolute",
            bottom: -5,
            right: -5,
            width: 20,
            height: 20,
            borderRadius: "50%",
            background: cfg.numBg,
            boxShadow: cfg.numShadow,
            border: "1.5px solid rgba(0,0,0,0.4)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 5,
          }}
        >
          <span
            style={{
              color: cfg.numColor,
              fontSize: cfg.badgeSize,
              fontWeight: 900,
              lineHeight: 1,
            }}
          >
            {position + 1}
          </span>
        </div>
      </div>
    );
  return (
    <div
      style={{ display: "flex", alignItems: "center", gap: 8, flexShrink: 0 }}
    >
      <div
        style={{
          width: 22,
          height: 22,
          borderRadius: "50%",
          background: "rgba(255,255,255,0.06)",
          border: "1px solid rgba(255,255,255,0.12)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          flexShrink: 0,
        }}
      >
        <span
          style={{
            color: "#94A3B8",
            fontSize: 11,
            fontWeight: 800,
            lineHeight: 1,
          }}
        >
          {position + 1}
        </span>
      </div>
      <div
        style={{
          width: sz,
          height: sz,
          borderRadius: "50%",
          background: "#0F172A",
          border: "1.5px solid rgba(255,255,255,0.1)",
          overflow: "hidden",
        }}
      >
        <img
          src={avatarFlagUrl(avatar)}
          alt={avatarName(avatar)}
          style={{
            width: "100%",
            height: "100%",
            objectFit: "cover",
            display: "block",
          }}
        />
      </div>
    </div>
  );
};

// ─── Colores por puntos ───────────────────────────────────────────────────────
const getPtStyle = (pts) => {
  if (pts === 5)
    return {
      color: "#22C55E",
      bg: "rgba(34,197,94,0.15)",
      border: "rgba(34,197,94,0.3)",
      label: "¡Exacto!",
    };
  if (pts === 4)
    return {
      color: "#FBBF24",
      bg: "rgba(251,191,36,0.15)",
      border: "rgba(251,191,36,0.3)",
      label: "Muy bien",
    };
  if (pts >= 2)
    return {
      color: "#60A5FA",
      bg: "rgba(96,165,250,0.15)",
      border: "rgba(96,165,250,0.3)",
      label: "Bien",
    };
  if (pts === 1)
    return {
      color: "#94A3B8",
      bg: "rgba(148,163,184,0.12)",
      border: "rgba(148,163,184,0.2)",
      label: "Algo",
    };
  return {
    color: "#EF4444",
    bg: "rgba(239,68,68,0.10)",
    border: "rgba(239,68,68,0.2)",
    label: "Sin pts",
  };
};

// ─── Mapa equipo → bandera ────────────────────────────────────────────────────
const TEAM_FLAG = {
  Germany: "de",
  Brazil: "br",
  Argentina: "ar",
  France: "fr",
  Spain: "es",
  Italy: "it",
  England: "gb-eng",
  Netherlands: "nl",
  Portugal: "pt",
  Croatia: "hr",
  Belgium: "be",
  Mexico: "mx",
  Colombia: "co",
  "United States": "us",
  Uruguay: "uy",
  Sweden: "se",
  Poland: "pl",
  Turkey: "tr",
  Japan: "jp",
  "South Korea": "kr",
  Morocco: "ma",
  Senegal: "sn",
  Australia: "au",
  Ecuador: "ec",
  Canada: "ca",
  Qatar: "qa",
  Switzerland: "ch",
  "Bosnia-Herzegovina": "ba",
  "South Africa": "za",
  Scotland: "gb-sct",
  Haiti: "ht",
  Paraguay: "py",
  "Ivory Coast": "ci",
  Curaçao: "cw",
  Czechia: "cz",
  "Saudi Arabia": "sa",
  Egypt: "eg",
  "Cape Verde Islands": "cv",
  "Cape Verde": "cv",
  Algeria: "dz",
  Tunisia: "tn",
  Ghana: "gh",
  Cameroon: "cm",
  Nigeria: "ng",
  "Costa Rica": "cr",
  Panama: "pa",
  Jamaica: "jm",
  Honduras: "hn",
  Chile: "cl",
  Peru: "pe",
  Venezuela: "ve",
  Iran: "ir",
  Iraq: "iq",
  China: "cn",
  Indonesia: "id",
  Thailand: "th",
  "New Zealand": "nz",
  Serbia: "rs",
  Romania: "ro",
  Denmark: "dk",
  Austria: "at",
  Ukraine: "ua",
  Greece: "gr",
  "Czech Republic": "cz",
  Hungary: "hu",
  Slovakia: "sk",
  Slovenia: "si",
  Finland: "fi",
  Norway: "no",
  Wales: "gb-wls",
  "Northern Ireland": "gb-nir",
};

const TeamFlag = ({ name }) => {
  const code = TEAM_FLAG[name];
  return (
    <div
      style={{
        width: 26,
        height: 26,
        borderRadius: 5,
        overflow: "hidden",
        border: "1px solid rgba(255,255,255,0.15)",
        flexShrink: 0,
        boxShadow: "0 2px 6px rgba(0,0,0,0.5)",
        background: "#1E293B",
      }}
    >
      {code ? (
        <img
          src={`https://flagcdn.com/w80/${code}.png`}
          alt={name}
          style={{
            width: "100%",
            height: "100%",
            objectFit: "cover",
            display: "block",
          }}
        />
      ) : (
        <span
          style={{
            fontSize: 9,
            color: "#475569",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            height: "100%",
          }}
        >
          ?
        </span>
      )}
    </div>
  );
};

// ─── Modal ────────────────────────────────────────────────────────────────────
const PredictionsModal = ({ player, onClose }) => {
  const [preds, setPreds] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPreds = async () => {
      // Rango de "hoy" en hora Colombia (UTC-5)
      const nowCO = new Date(Date.now() - 5 * 60 * 60 * 1000);
      const yyyymmdd = nowCO.toISOString().slice(0, 10); // "2026-06-15"
      const todayStart = new Date(`${yyyymmdd}T00:00:00-05:00`).toISOString();
      const todayEnd = new Date(`${yyyymmdd}T23:59:59-05:00`).toISOString();

      // 1. Partidos de hoy que ya cerraron o están en vivo
      const { data: matches } = await supabase
        .from("matches")
        .select(
          "id, team_home, team_away, score_home, score_away, status, match_date",
        )
        .in("status", ["live", "finished"])
        .gte("match_date", todayStart)
        .lte("match_date", todayEnd)
        .order("match_date", { ascending: true });

      if (!matches || matches.length === 0) {
        setLoading(false);
        return;
      }

      // 2. Predicciones del jugador para esos partidos
      const matchIds = matches.map((m) => m.id);
      const { data: predictions } = await supabase
        .from("predictions")
        .select("match_id, pred_home, pred_away, points")
        .eq("user_id", player.id)
        .in("match_id", matchIds);

      const predMap = {};
      for (const p of predictions || []) predMap[p.match_id] = p;

      // Mostrar TODOS los partidos cerrados de hoy; pred null = no predijo
      setPreds(matches.map((m) => ({ ...m, pred: predMap[m.id] ?? null })));
      setLoading(false);
    };
    fetchPreds();
  }, [player.id]);

  return (
    <div
      onClick={onClose}
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 100,
        background: "rgba(0,0,0,0.75)",
        backdropFilter: "blur(6px)",
        display: "flex",
        alignItems: "flex-end", // bottom sheet
        justifyContent: "center",
      }}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          width: "100%",
          maxWidth: 448,
          // FIX: altura fija para que el scroll interno funcione
          height: "78vh",
          display: "flex",
          flexDirection: "column",
          background: "linear-gradient(180deg, #0F1E35 0%, #080F1E 100%)",
          border: "1px solid rgba(255,255,255,0.09)",
          borderRadius: "24px 24px 0 0",
          boxShadow: "0 -24px 80px rgba(0,0,0,0.8)",
          // FIX: espacio para la nav bar del dispositivo
          paddingBottom: "env(safe-area-inset-bottom, 72px)",
        }}
      >
        {/* Handle */}
        <div
          style={{
            display: "flex",
            justifyContent: "center",
            padding: "10px 0 0",
            flexShrink: 0,
          }}
        >
          <div
            style={{
              width: 36,
              height: 4,
              borderRadius: 99,
              background: "rgba(255,255,255,0.15)",
            }}
          />
        </div>

        {/* Header */}
        <div
          style={{
            padding: "12px 16px 14px",
            borderBottom: "1px solid rgba(255,255,255,0.07)",
            flexShrink: 0,
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
              <div
                style={{
                  width: 50,
                  height: 50,
                  borderRadius: "50%",
                  overflow: "hidden",
                  border: "2.5px solid rgba(255,255,255,0.2)",
                  boxShadow: "0 0 20px rgba(0,0,0,0.5)",
                  flexShrink: 0,
                  position: "relative",
                }}
              >
                <img
                  src={avatarFlagUrl(player.avatar)}
                  alt=""
                  style={{
                    width: "100%",
                    height: "100%",
                    objectFit: "cover",
                    display: "block",
                  }}
                />
                <div
                  style={{
                    position: "absolute",
                    inset: 0,
                    background:
                      "linear-gradient(to bottom, rgba(255,255,255,0.1), transparent 50%)",
                    borderRadius: "50%",
                    pointerEvents: "none",
                  }}
                />
              </div>
              <div>
                <p
                  style={{
                    margin: 0,
                    fontSize: 16,
                    fontWeight: 800,
                    color: "#F1F5F9",
                    letterSpacing: "-0.3px",
                  }}
                >
                  {player.username}
                </p>
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 8,
                    marginTop: 2,
                  }}
                >
                  <span
                    style={{ fontSize: 12, color: "#FBBF24", fontWeight: 700 }}
                  >
                    ⚡ {player.total_points ?? 0} pts totales
                  </span>
                  {preds.length > 0 && (
                    <span style={{ fontSize: 11, color: "#475569" }}>
                      · {preds.length} pred{preds.length !== 1 ? "s" : ""}
                    </span>
                  )}
                </div>
              </div>
            </div>
            <button
              onClick={onClose}
              style={{
                background: "rgba(255,255,255,0.08)",
                border: "1px solid rgba(255,255,255,0.1)",
                borderRadius: 10,
                padding: "7px 8px",
                cursor: "pointer",
                color: "#94A3B8",
                display: "flex",
                lineHeight: 0,
              }}
            >
              <IconClose />
            </button>
          </div>
        </div>

        {/* FIX: minHeight: 0 es clave para que flex+overflow funcione */}
        <div
          style={{
            overflowY: "auto",
            flex: 1,
            minHeight: 0,
            padding: "12px 12px 16px",
            WebkitOverflowScrolling: "touch",
          }}
        >
          {loading && (
            <p
              style={{
                color: "#94A3B8",
                textAlign: "center",
                padding: "32px 0",
                fontSize: 13,
              }}
            >
              Cargando predicciones...
            </p>
          )}

          {!loading && preds.length === 0 && (
            <div style={{ textAlign: "center", padding: "40px 0" }}>
              <p style={{ fontSize: 32, margin: "0 0 8px" }}>🔒</p>
              <p style={{ color: "#475569", fontSize: 13, margin: 0 }}>
                No hay partidos cerrados hoy con predicciones visibles
              </p>
            </div>
          )}

          {!loading &&
            preds.map((m) => {
              const hasPred = m.pred !== null;
              const ps = getPtStyle(hasPred ? (m.pred.points ?? 0) : -1);
              const isLive = m.status === "live";
              const fecha = new Date(m.match_date).toLocaleDateString("es-CO", {
                timeZone: "America/Bogota",
                day: "numeric",
                month: "short",
              });

              return (
                <div
                  key={m.id}
                  style={{
                    marginBottom: 10,
                    background: "rgba(255,255,255,0.03)",
                    border: "1px solid rgba(255,255,255,0.07)",
                    borderRadius: 14,
                    overflow: "hidden",
                  }}
                >
                  {/* Fecha + status */}
                  <div
                    style={{
                      padding: "7px 12px 0",
                      display: "flex",
                      alignItems: "center",
                      gap: 6,
                    }}
                  >
                    <span
                      style={{
                        fontSize: 10,
                        color: "#334155",
                        fontWeight: 600,
                      }}
                    >
                      {fecha}
                    </span>
                    {isLive && (
                      <span
                        style={{
                          fontSize: 9,
                          fontWeight: 700,
                          color: "#EF4444",
                          background: "rgba(239,68,68,0.15)",
                          padding: "1px 6px",
                          borderRadius: 99,
                          display: "flex",
                          alignItems: "center",
                          gap: 3,
                        }}
                      >
                        <span
                          style={{
                            width: 5,
                            height: 5,
                            borderRadius: "50%",
                            background: "#EF4444",
                            display: "inline-block",
                          }}
                        />
                        EN VIVO
                      </span>
                    )}
                  </div>

                  {/* Equipos y marcador */}
                  <div
                    style={{
                      padding: "8px 12px 10px",
                      display: "flex",
                      alignItems: "center",
                      gap: 6,
                    }}
                  >
                    {/* Local */}
                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: 6,
                        flex: 1,
                        minWidth: 0,
                      }}
                    >
                      <TeamFlag name={m.team_home} />
                      <span
                        style={{
                          fontSize: 12,
                          fontWeight: 600,
                          color: "#CBD5E1",
                          whiteSpace: "nowrap",
                          overflow: "hidden",
                          textOverflow: "ellipsis",
                        }}
                      >
                        {m.team_home}
                      </span>
                    </div>

                    {/* Marcador */}
                    <div
                      style={{
                        textAlign: "center",
                        flexShrink: 0,
                        minWidth: 52,
                      }}
                    >
                      <div
                        style={{
                          fontSize: 17,
                          fontWeight: 900,
                          color: "#F1F5F9",
                          fontVariantNumeric: "tabular-nums",
                          letterSpacing: 1,
                          lineHeight: 1,
                        }}
                      >
                        {m.score_home !== null
                          ? `${m.score_home}-${m.score_away}`
                          : "-"}
                      </div>
                      <div
                        style={{ fontSize: 9, color: "#334155", marginTop: 2 }}
                      >
                        resultado
                      </div>
                    </div>

                    {/* Visitante */}
                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: 6,
                        flex: 1,
                        minWidth: 0,
                        justifyContent: "flex-end",
                      }}
                    >
                      <span
                        style={{
                          fontSize: 12,
                          fontWeight: 600,
                          color: "#CBD5E1",
                          whiteSpace: "nowrap",
                          overflow: "hidden",
                          textOverflow: "ellipsis",
                          textAlign: "right",
                        }}
                      >
                        {m.team_away}
                      </span>
                      <TeamFlag name={m.team_away} />
                    </div>
                  </div>

                  {/* Predicción + puntos */}
                  <div
                    style={{
                      borderTop: "1px solid rgba(255,255,255,0.06)",
                      padding: "10px 12px",
                      background: hasPred ? ps.bg : "rgba(0,0,0,0.1)",
                    }}
                  >
                    {/* Fila principal: predicción y badge de puntos */}
                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "space-between",
                      }}
                    >
                      <div
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: 8,
                        }}
                      >
                        <span style={{ fontSize: 11, color: "#475569" }}>
                          Su predicción:
                        </span>
                        {hasPred ? (
                          <span
                            style={{
                              fontSize: 16,
                              fontWeight: 900,
                              color: ps.color,
                              fontVariantNumeric: "tabular-nums",
                              letterSpacing: 1,
                            }}
                          >
                            {m.pred.pred_home}-{m.pred.pred_away}
                          </span>
                        ) : (
                          <span
                            style={{
                              fontSize: 12,
                              color: "#334155",
                              fontStyle: "italic",
                            }}
                          >
                            Sin predicción
                          </span>
                        )}
                      </div>
                      {hasPred && (
                        <div
                          style={{
                            display: "flex",
                            alignItems: "center",
                            gap: 6,
                          }}
                        >
                          <span
                            style={{
                              fontSize: 10,
                              color: ps.color,
                              fontWeight: 600,
                            }}
                          >
                            {ps.label}
                          </span>
                          <div
                            style={{
                              background: "rgba(0,0,0,0.25)",
                              border: `1px solid ${ps.border}`,
                              borderRadius: 8,
                              padding: "3px 9px",
                            }}
                          >
                            <span
                              style={{
                                fontSize: 13,
                                fontWeight: 900,
                                color: ps.color,
                              }}
                            >
                              {(m.pred.points ?? 0) > 0
                                ? `+${m.pred.points}`
                                : "0"}{" "}
                              pts
                            </span>
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Desglose de puntos */}
                    {hasPred &&
                      m.score_home !== null &&
                      (() => {
                        const { detalles } = desglosePuntos(
                          m.pred.pred_home,
                          m.pred.pred_away,
                          m.score_home,
                          m.score_away,
                        );
                        return (
                          <div
                            style={{
                              marginTop: 8,
                              display: "flex",
                              flexWrap: "wrap",
                              gap: 4,
                            }}
                          >
                            {detalles.map((d, idx) => {
                              const esSinPts = d.startsWith("Sin");
                              const esExacto = d.includes("exacto");
                              const color = esExacto
                                ? "#22C55E"
                                : esSinPts
                                  ? "#475569"
                                  : "#60A5FA";
                              const bg = esExacto
                                ? "rgba(34,197,94,0.12)"
                                : esSinPts
                                  ? "rgba(71,85,105,0.15)"
                                  : "rgba(96,165,250,0.12)";
                              return (
                                <span
                                  key={idx}
                                  style={{
                                    fontSize: 10,
                                    fontWeight: 600,
                                    color,
                                    background: bg,
                                    border: `1px solid ${color}33`,
                                    borderRadius: 6,
                                    padding: "2px 7px",
                                    lineHeight: 1.6,
                                  }}
                                >
                                  {d}
                                </span>
                              );
                            })}
                          </div>
                        );
                      })()}
                  </div>
                </div>
              );
            })}

          <div style={{ height: 8 }} />
        </div>
      </div>
    </div>
  );
};

// ─── Ranking ──────────────────────────────────────────────────────────────────
export default function Ranking({ user }) {
  const [players, setPlayers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState(null);

  useEffect(() => {
    loadRanking();
    const channel = supabase
      .channel("ranking-profiles-updates")
      .on(
        "postgres_changes",
        { event: "UPDATE", schema: "public", table: "profiles" },
        () => loadRanking(true),
      )
      .subscribe();
    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const loadRanking = async (silent = false) => {
    if (!silent) setLoading(true);
    const { data, error } = await supabase
      .from("profiles")
      .select("id, username, total_points, avatar")
      .order("total_points", { ascending: false });
    if (error) console.error(error);
    else setPlayers(data || []);
    if (!silent) setLoading(false);
  };

  return (
    <div style={{ maxWidth: 448, margin: "0 auto", padding: "24px 16px 0" }}>
      <header
        style={{
          marginBottom: 24,
          display: "flex",
          alignItems: "center",
          gap: 10,
        }}
      >
        <span style={{ color: "#FBBF24" }}>
          <IconTrophy />
        </span>
        <div>
          <h1
            style={{
              margin: 0,
              fontSize: 20,
              fontWeight: 800,
              color: "#F1F5F9",
              letterSpacing: "-0.3px",
            }}
          >
            Ranking Global
          </h1>
          <p style={{ margin: 0, fontSize: 11, color: "#94A3B8" }}>
            {players.length > 0
              ? `${players.length} jugador${players.length !== 1 ? "es" : ""}`
              : "Todos los predictores"}
            {" · "}
            <span style={{ color: "#334155" }}>toca para ver predicciones</span>
          </p>
        </div>
      </header>

      {loading && (
        <p
          style={{
            color: "#94A3B8",
            textAlign: "center",
            padding: "40px 0",
            fontSize: 14,
          }}
        >
          Cargando ranking...
        </p>
      )}
      {!loading && players.length === 0 && (
        <p
          style={{
            color: "#94A3B8",
            textAlign: "center",
            padding: "40px 0",
            fontSize: 14,
          }}
        >
          Aún no hay jugadores.
        </p>
      )}

      {!loading && players.length > 0 && (
        <div
          style={{
            background: "rgba(30,41,59,0.80)",
            backdropFilter: "blur(16px)",
            border: "1px solid rgba(255,255,255,0.08)",
            borderRadius: 16,
            overflow: "visible",
            boxShadow: "0 20px 60px rgba(0,0,0,0.4)",
          }}
        >
          {players.map((player, i) => {
            const isMe = user && player.id === user.id;
            const isTop3 = i < 3;
            const cfg = MEDAL_CONFIG[i];
            const pc = cfg?.ptColor ?? "#FBBF24";

            return (
              <div
                key={player.id}
                onClick={() => setSelected(player)}
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  padding: isTop3 ? "16px 16px" : "11px 16px",
                  borderBottom:
                    i !== players.length - 1
                      ? "1px solid rgba(255,255,255,0.05)"
                      : "none",
                  background: isMe
                    ? "rgba(22,163,74,0.12)"
                    : (cfg?.rowBg ?? "transparent"),
                  borderRadius:
                    i === 0
                      ? "16px 16px 0 0"
                      : i === players.length - 1
                        ? "0 0 16px 16px"
                        : 0,
                  cursor: "pointer",
                  transition: "opacity 0.1s",
                  overflow: "visible",
                }}
                onMouseEnter={(e) => (e.currentTarget.style.opacity = "0.8")}
                onMouseLeave={(e) => (e.currentTarget.style.opacity = "1")}
              >
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: isTop3 ? 14 : 10,
                    overflow: "visible",
                  }}
                >
                  <PlayerAvatar avatar={player.avatar} position={i} />
                  <div>
                    <span
                      style={{
                        fontSize: isTop3 ? 14 : 13,
                        fontWeight: 700,
                        display: "block",
                        color: isMe
                          ? "#16A34A"
                          : isTop3
                            ? "#F1F5F9"
                            : "#94A3B8",
                      }}
                    >
                      {player.username}
                      {isMe && (
                        <span
                          style={{
                            color: "#94A3B8",
                            fontSize: 11,
                            fontWeight: 400,
                          }}
                        >
                          {" "}
                          (tú)
                        </span>
                      )}
                    </span>
                    <span
                      style={{
                        fontSize: 10,
                        color: isTop3 ? pc : "#334155",
                        fontWeight: 600,
                        opacity: isTop3 ? 0.85 : 1,
                      }}
                    >
                      {isTop3 ? cfg.label : "Ver predicciones →"}
                    </span>
                  </div>
                </div>
                <div style={{ textAlign: "right" }}>
                  <span
                    style={{
                      fontWeight: 800,
                      fontVariantNumeric: "tabular-nums",
                      fontSize: isTop3 ? 16 : 13,
                      color: pc,
                      textShadow: isTop3 ? `0 0 12px ${pc}55` : "none",
                    }}
                  >
                    {player.total_points ?? 0}
                    <span
                      style={{
                        fontSize: isTop3 ? 11 : 10,
                        fontWeight: 600,
                        marginLeft: 2,
                        opacity: 0.8,
                      }}
                    >
                      pts
                    </span>
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      )}

      <div style={{ height: 24 }} />

      {selected && (
        <PredictionsModal player={selected} onClose={() => setSelected(null)} />
      )}
    </div>
  );
}
