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

// Marco y colores para top 3
const MEDAL_CONFIG = {
  0: {
    ring: "3px solid #FFB800",
    shadow: "0 0 0 5px rgba(255,184,0,0.22), 0 0 18px rgba(255,184,0,0.45)",
    numBg: "linear-gradient(135deg, #FFE066 0%, #FFB800 50%, #FF8C00 100%)",
    numColor: "#7A4500",
    numShadow: "0 0 10px rgba(255,180,0,0.7)",
    label: "Líder",
    size: 46,
    fontSize: 24,
  },
  1: {
    ring: "3px solid #C8C8C8",
    shadow: "0 0 0 4px rgba(200,200,200,0.18), 0 0 14px rgba(200,200,200,0.35)",
    numBg: "linear-gradient(135deg, #F0F0F0 0%, #C8C8C8 50%, #A0A0A0 100%)",
    numColor: "#3A3A3A",
    numShadow: "0 0 8px rgba(200,200,200,0.6)",
    label: "2° lugar",
    size: 42,
    fontSize: 22,
  },
  2: {
    ring: "3px solid #CD8C52",
    shadow: "0 0 0 4px rgba(180,106,42,0.18), 0 0 14px rgba(180,106,42,0.35)",
    numBg: "linear-gradient(135deg, #E0A060 0%, #B46A2A 50%, #8B4513 100%)",
    numColor: "#3A1A08",
    numShadow: "0 0 8px rgba(180,106,42,0.6)",
    label: "3° lugar",
    size: 40,
    fontSize: 20,
  },
};

const PlayerAvatar = ({ avatar, position }) => {
  const cfg = MEDAL_CONFIG[position];
  const isTop3 = !!cfg;
  const avatarSize = cfg?.size ?? 34;

  if (isTop3) {
    return (
      <div style={{ position: "relative", flexShrink: 0 }}>
        <div
          style={{
            width: avatarSize,
            height: avatarSize,
            borderRadius: "50%",
            border: cfg.ring,
            boxShadow: cfg.shadow,
            background: "rgba(30,41,59,0.9)",
            overflow: "hidden",
            transition: "transform 0.15s",
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
        <div
          style={{
            position: "absolute",
            bottom: -4,
            right: -4,
            width: 18,
            height: 18,
            borderRadius: "50%",
            background: cfg.numBg,
            boxShadow: cfg.numShadow,
            border: "1.5px solid rgba(0,0,0,0.3)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <span
            style={{
              color: cfg.numColor,
              fontSize: 10,
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
          background: "rgba(30,41,59,0.9)",
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

    // Realtime: cuando cualquier perfil actualice sus puntos,
    // recarga el ranking completo (necesitamos reordenar la lista)
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
      .order("total_points", { ascending: false })
      .limit(10);
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
            Los 10 mejores predictores
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
            overflow: "hidden",
            boxShadow: "0 20px 60px rgba(0,0,0,0.4)",
          }}
        >
          {players.map((player, i) => {
            const isCurrentUser = user && player.id === user.id;
            const isTop3 = i < 3;
            const cfg = MEDAL_CONFIG[i];
            const ptColor =
              i === 0
                ? "#FFB800"
                : i === 1
                  ? "#C8C8C8"
                  : i === 2
                    ? "#CD8C52"
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
                    : isTop3
                      ? "rgba(255,255,255,0.02)"
                      : "transparent",
                  transition: "background 0.15s",
                }}
              >
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: isTop3 ? 14 : 10,
                  }}
                >
                  <PlayerAvatar avatar={player.avatar} position={i} />
                  <div>
                    <span
                      style={{
                        fontSize: isTop3 ? 14 : 13,
                        fontWeight: 600,
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
                          color: cfg?.numBg
                            ? "rgba(148,163,184,0.65)"
                            : "rgba(148,163,184,0.45)",
                          fontWeight: 500,
                        }}
                      >
                        {cfg?.label}
                      </span>
                    )}
                  </div>
                </div>
                <span
                  style={{
                    fontWeight: 700,
                    fontVariantNumeric: "tabular-nums",
                    fontSize: isTop3 ? 15 : 13,
                    color: ptColor,
                  }}
                >
                  {player.total_points} pts
                </span>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
