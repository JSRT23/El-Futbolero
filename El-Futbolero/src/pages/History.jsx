import { useEffect, useState } from "react";
import { supabase } from "../lib/supabaseClient";
import HistoryMatchCard from "../components/HistoryMatchCard";

const IconHistory = () => (
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
    <path d="M3 12a9 9 0 1 0 2.64-6.36L3 8" />
    <path d="M3 3v5h5" />
    <path d="M12 7v5l3 3" />
  </svg>
);

const IconInbox = () => (
  <svg
    width="32"
    height="32"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.5"
    strokeLinecap="round"
    strokeLinejoin="round"
    aria-hidden="true"
  >
    <path d="M21 12V8a2 2 0 0 0-2-2H5a2 2 0 0 0-2 2v4" />
    <path d="M3 12l3 7h12l3-7" />
    <path d="M3 12h5l1 3h6l1-3h5" />
  </svg>
);

export default function History({ user }) {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadHistory();

    // Realtime: cuando un match cambia de estado o marcador
    const matchesChannel = supabase
      .channel("history-matches-updates")
      .on(
        "postgres_changes",
        { event: "UPDATE", schema: "public", table: "matches" },
        () => {
          // Recarga el historial completo para reflejar nuevo marcador/estado
          loadHistory(true);
        },
      )
      .subscribe();

    // Realtime: cuando los puntos de una predicción se actualizan
    const predictionsChannel = supabase
      .channel("history-predictions-updates")
      .on(
        "postgres_changes",
        {
          event: "UPDATE",
          schema: "public",
          table: "predictions",
          filter: `user_id=eq.${user.id}`,
        },
        (payload) => {
          // Actualiza solo la predicción que cambió, sin recargar todo
          setItems((prev) =>
            prev.map((p) =>
              p.id === payload.new.id ? { ...p, ...payload.new } : p,
            ),
          );
        },
      )
      .subscribe();

    return () => {
      supabase.removeChannel(matchesChannel);
      supabase.removeChannel(predictionsChannel);
    };
  }, [user.id]);

  const loadHistory = async (silent = false) => {
    if (!silent) setLoading(true);

    const { data, error } = await supabase
      .from("predictions")
      .select("*, match:matches(*)")
      .eq("user_id", user.id)
      .order("match_date", { foreignTable: "matches", ascending: false });

    if (error) console.error(error);
    else setItems((data || []).filter((p) => p.match));

    if (!silent) setLoading(false);
  };

  const finished = items.filter((p) => p.match.status === "finished");
  const totalPoints = finished.reduce((acc, p) => acc + (p.points || 0), 0);

  return (
    <div style={{ maxWidth: 448, margin: "0 auto", padding: "24px 16px 0" }}>
      <header
        style={{
          marginBottom: 20,
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          gap: 10,
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <span style={{ color: "#FBBF24" }}>
            <IconHistory />
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
              Historial
            </h1>
            <p style={{ margin: 0, fontSize: 11, color: "#94A3B8" }}>
              Tus predicciones y puntos obtenidos
            </p>
          </div>
        </div>

        {!loading && finished.length > 0 && (
          <div
            style={{
              textAlign: "right",
              background: "rgba(255,255,255,0.04)",
              border: "1px solid rgba(255,255,255,0.08)",
              borderRadius: 12,
              padding: "6px 12px",
            }}
          >
            <div
              style={{
                fontSize: 15,
                fontWeight: 800,
                color: "#FBBF24",
                lineHeight: 1.1,
              }}
            >
              {totalPoints} pts
            </div>
            <div style={{ fontSize: 9, color: "#94A3B8" }}>Acumulados</div>
          </div>
        )}
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
          Cargando historial...
        </p>
      )}

      {!loading && items.length === 0 && (
        <div style={{ textAlign: "center", padding: "64px 0" }}>
          <div
            style={{
              display: "inline-flex",
              alignItems: "center",
              justifyContent: "center",
              width: 56,
              height: 56,
              borderRadius: "50%",
              background: "rgba(255,255,255,0.05)",
              border: "1px solid rgba(255,255,255,0.1)",
              color: "#94A3B8",
              marginBottom: 12,
            }}
          >
            <IconInbox />
          </div>
          <p style={{ color: "#94A3B8", fontSize: 14, margin: 0 }}>
            Aún no has hecho ninguna predicción.
          </p>
          <p
            style={{
              color: "rgba(148,163,184,0.6)",
              fontSize: 12,
              marginTop: 4,
            }}
          >
            Ve a la pestaña Partidos para empezar a predecir
          </p>
        </div>
      )}

      {!loading &&
        items.map((p) => <HistoryMatchCard key={p.id} prediction={p} />)}
    </div>
  );
}
