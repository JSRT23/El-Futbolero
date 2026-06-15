import { useEffect, useState } from "react";
import { supabase } from "../lib/supabaseClient";
import { avatarFlagUrl, avatarName } from "../lib/avatars";

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
    aria-hidden="true"
  >
    <path d="M8 21h8M12 17v4M17 4H7l1 9a4 4 0 0 0 8 0l1-9z" />
    <path d="M17 4c0 0 2 0 2 2s-2 4-4 4M7 4c0 0-2 0-2 2s2 4 4 4" />
  </svg>
);

const MEDAL_CONFIG = {
  0: {
    outerRing: "3px solid #5A3800",
    ring: "3px solid #FFD700",
    shadow: `0 0 0 2px #5A3800, 0 0 0 5px #FFD700, 0 0 0 7px #B8860B, 0 0 22px rgba(255,215,0,0.65), 0 0 44px rgba(255,165,0,0.3)`,
    numBg:
      "linear-gradient(135deg, #FFE566 0%, #FFD700 40%, #FFA500 70%, #CC8800 100%)",
    numColor: "#5A3000",
    numShadow: "0 0 8px rgba(255,180,0,0.9)",
    crownColor: "#FFD700",
    crownShadow: "0 0 6px rgba(255,215,0,0.9)",
    ribbonBg: "#CC1111",
    ribbonTop: "#FF2222",
    label: "Líder",
    size: 46,
    badgeSize: 15,
  },
  1: {
    outerRing: "3px solid #333",
    ring: "3px solid #D0D0D0",
    shadow: `0 0 0 2px #333, 0 0 0 5px #D0D0D0, 0 0 0 7px #888, 0 0 16px rgba(200,200,200,0.5), 0 0 30px rgba(180,180,180,0.2)`,
    numBg:
      "linear-gradient(135deg, #FFFFFF 0%, #D8D8D8 40%, #B0B0B0 70%, #808080 100%)",
    numColor: "#2A2A2A",
    numShadow: "0 0 6px rgba(200,200,200,0.8)",
    crownColor: "#C8C8C8",
    crownShadow: "0 0 5px rgba(200,200,200,0.8)",
    ribbonBg: "#444488",
    ribbonTop: "#6666BB",
    label: "2° lugar",
    size: 42,
    badgeSize: 14,
  },
  2: {
    outerRing: "3px solid #3A1A00",
    ring: "3px solid #CD8B3A",
    shadow: `0 0 0 2px #3A1A00, 0 0 0 5px #CD8B3A, 0 0 0 7px #7B4A18, 0 0 14px rgba(180,106,42,0.55), 0 0 28px rgba(150,80,20,0.25)`,
    numBg:
      "linear-gradient(135deg, #F5D09A 0%, #CD8B3A 40%, #A06020 70%, #7B4A18 100%)",
    numColor: "#2A0E00",
    numShadow: "0 0 6px rgba(180,100,30,0.8)",
    crownColor: "#CD8B3A",
    crownShadow: "0 0 5px rgba(180,100,30,0.8)",
    ribbonBg: "#774411",
    ribbonTop: "#AA6633",
    label: "3° lugar",
    size: 38,
    badgeSize: 13,
  },
};

const Crown = ({ color, shadow }) => (
  <div
    style={{
      position: "absolute",
      top: -18,
      left: "50%",
      transform: "translateX(-50%)",
      fontSize: 18,
      lineHeight: 1,
      filter: `drop-shadow(0 0 5px ${color})`,
      zIndex: 10,
      pointerEvents: "none",
    }}
  >
    👑
  </div>
);

const PlayerAvatar = ({ avatar, position }) => {
  const cfg = MEDAL_CONFIG[position];
  const isTop3 = !!cfg;
  const avatarSize = cfg?.size ?? 34;

  if (isTop3) {
    return (
      <div style={{ position: "relative", flexShrink: 0, marginTop: 10 }}>
        <Crown color={cfg.crownColor} shadow={cfg.crownShadow} />
        <div
          style={{
            width: avatarSize,
            height: avatarSize,
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
          {/* Shine */}
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
        {/* Badge número */}
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
  }

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
          width: avatarSize,
          height: avatarSize,
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

export default function Ranking({ user }) {
  const [players, setPlayers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadRanking();
    const channel = supabase
      .channel("ranking-profiles-updates")
      .on(
        "postgres_changes",
        { event: "UPDATE", schema: "public", table: "profiles" },
        () => {
          loadRanking(true);
        },
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
          Aún no hay jugadores en el ranking.
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
            const isCurrentUser = user && player.id === user.id;
            const isTop3 = i < 3;
            const cfg = MEDAL_CONFIG[i];
            const ptColor =
              i === 0
                ? "#FFD700"
                : i === 1
                  ? "#C8C8C8"
                  : i === 2
                    ? "#CD8B3A"
                    : "#FBBF24";

            return (
              <div
                key={player.id}
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  padding: isTop3 ? "16px 16px" : "11px 16px",
                  borderBottom:
                    i !== players.length - 1
                      ? "1px solid rgba(255,255,255,0.05)"
                      : "none",
                  background: isCurrentUser
                    ? "rgba(22,163,74,0.12)"
                    : i === 0
                      ? "rgba(255,215,0,0.04)"
                      : i === 1
                        ? "rgba(200,200,200,0.03)"
                        : i === 2
                          ? "rgba(180,100,30,0.04)"
                          : "transparent",
                  borderRadius:
                    i === 0
                      ? "16px 16px 0 0"
                      : i === players.length - 1
                        ? "0 0 16px 16px"
                        : 0,
                  transition: "background 0.15s",
                  overflow: "visible",
                }}
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
                        color: isCurrentUser
                          ? "#16A34A"
                          : isTop3
                            ? "#F1F5F9"
                            : "#94A3B8",
                      }}
                    >
                      {player.username}
                      {isCurrentUser && (
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
                    {isTop3 && (
                      <span
                        style={{
                          fontSize: 10,
                          color: ptColor,
                          fontWeight: 600,
                          opacity: 0.85,
                        }}
                      >
                        {cfg?.label}
                      </span>
                    )}
                  </div>
                </div>

                <div style={{ textAlign: "right" }}>
                  <span
                    style={{
                      fontWeight: 800,
                      fontVariantNumeric: "tabular-nums",
                      fontSize: isTop3 ? 16 : 13,
                      color: ptColor,
                      textShadow: isTop3 ? `0 0 12px ${ptColor}55` : "none",
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
    </div>
  );
}
