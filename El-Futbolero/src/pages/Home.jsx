import { useEffect, useState } from "react";
import { supabase } from "../lib/supabaseClient";
import MatchCard from "../components/MatchCard";

const IconBall = () => (
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
    <circle cx="12" cy="12" r="10" />
    <path d="M12 2a10 10 0 0 1 6.32 2.27L12 8l-6.32-3.73A10 10 0 0 1 12 2z" />
    <path d="M12 22v-6l-5-3-4.68 2.73" />
  </svg>
);

const IconCalendar = () => (
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
    <rect x="3" y="4" width="18" height="18" rx="2" />
    <line x1="16" y1="2" x2="16" y2="6" />
    <line x1="8" y1="2" x2="8" y2="6" />
    <line x1="3" y1="10" x2="21" y2="10" />
  </svg>
);

// Cada cuánto se vuelven a consultar los partidos como respaldo
// (además de la suscripción en tiempo real) para reflejar
// marcadores y estados (EN VIVO / FINALIZADO) por si la conexión
// en tiempo real se pierde momentáneamente.
const REFRESH_INTERVAL_MS = 15000;

export default function Home({ user }) {
  const [matches, setMatches] = useState([]);
  const [predictions, setPredictions] = useState({});
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState("");

  useEffect(() => {
    loadData();

    // Refresca los partidos cada cierto tiempo en segundo plano para
    // que marcadores y estados (EN VIVO -> FINALIZADO) se actualicen
    // sin que el usuario tenga que recargar la página. Esto es un
    // respaldo: el canal en tiempo real de abajo ya actualiza al
    // instante cuando hay un cambio en la base de datos.
    const interval = setInterval(() => {
      if (document.visibilityState === "visible") {
        loadData(true);
      }
    }, REFRESH_INTERVAL_MS);

    // Si el usuario vuelve a la pestaña, refresca de inmediato.
    const handleVisibilityChange = () => {
      if (document.visibilityState === "visible") {
        loadData(true);
      }
    };
    document.addEventListener("visibilitychange", handleVisibilityChange);

    // Suscripción en tiempo real a la tabla "matches": cualquier
    // cambio (marcador, estado EN VIVO/FINALIZADO, etc.) que se
    // guarde en Supabase se refleja al instante en la pantalla, sin
    // esperar al siguiente refresco.
    // IMPORTANTE: para que esto funcione, la tabla "matches" debe
    // tener activado "Realtime" en Supabase (Database > Replication).
    const channel = supabase
      .channel("matches-live-updates")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "matches" },
        (payload) => {
          if (payload.eventType === "DELETE") {
            setMatches((prev) =>
              prev.filter((m) => m.id !== payload.old.id),
            );
            return;
          }

          const updated = payload.new;
          const todayStart = new Date();
          todayStart.setHours(0, 0, 0, 0);
          const todayEnd = new Date();
          todayEnd.setHours(23, 59, 59, 999);
          const matchDate = new Date(updated.match_date);

          setMatches((prev) => {
            const exists = prev.some((m) => m.id === updated.id);
            let next;
            if (exists) {
              next = prev.map((m) =>
                m.id === updated.id ? { ...m, ...updated } : m,
              );
            } else if (matchDate >= todayStart && matchDate <= todayEnd) {
              next = [...prev, updated];
            } else {
              return prev;
            }
            return next.sort(
              (a, b) => new Date(a.match_date) - new Date(b.match_date),
            );
          });
        },
      )
      .subscribe();

    return () => {
      clearInterval(interval);
      document.removeEventListener("visibilitychange", handleVisibilityChange);
      supabase.removeChannel(channel);
    };
  }, []);

  const loadData = async (silent = false) => {
    if (!silent) setLoading(true);
    const todayStart = new Date();
    todayStart.setHours(0, 0, 0, 0);
    const todayEnd = new Date();
    todayEnd.setHours(23, 59, 59, 999);

    const { data: matchesData, error: matchesError } = await supabase
      .from("matches")
      .select("*")
      .gte("match_date", todayStart.toISOString())
      .lte("match_date", todayEnd.toISOString())
      .order("match_date", { ascending: true });

    if (matchesError) console.error(matchesError);
    else setMatches(matchesData || []);

    if (user) {
      const { data: predsData, error: predsError } = await supabase
        .from("predictions")
        .select("*")
        .eq("user_id", user.id);
      if (predsError) console.error(predsError);
      else {
        const map = {};
        (predsData || []).forEach((p) => {
          map[p.match_id] = p;
        });
        setPredictions(map);
      }
    }
    if (!silent) setLoading(false);
  };

  const handleSave = async ({ matchId, predHome, predAway }) => {
    if (!user) return;
    const { data, error } = await supabase
      .from("predictions")
      .upsert(
        {
          user_id: user.id,
          match_id: matchId,
          pred_home: predHome,
          pred_away: predAway,
        },
        { onConflict: "user_id,match_id" },
      )
      .select()
      .single();

    if (error) {
      console.error(error);
      setToast("Error al guardar. Intenta de nuevo.");
    } else {
      setPredictions((prev) => ({ ...prev, [matchId]: data }));
      setToast("Predicción guardada");
    }
    setTimeout(() => setToast(""), 2000);
  };

  const todayLabel = new Date().toLocaleDateString("es-CO", {
    weekday: "long",
    day: "numeric",
    month: "long",
  });

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
          <span style={{ color: "#16A34A" }}>
            <IconBall />
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
              Partidos de hoy
            </h1>
            <p
              style={{
                margin: 0,
                fontSize: 11,
                color: "#94A3B8",
                textTransform: "capitalize",
              }}
            >
              {todayLabel}
            </p>
          </div>
        </div>

        <div
          title="Los marcadores y estados se actualizan automáticamente"
          style={{
            display: "flex",
            alignItems: "center",
            gap: 5,
            fontSize: 10,
            color: "#94A3B8",
            whiteSpace: "nowrap",
          }}
        >
          <span
            style={{
              width: 7,
              height: 7,
              borderRadius: "50%",
              background: "#22C55E",
              boxShadow: "0 0 6px rgba(34,197,94,0.8)",
              animation: "pulse 2s ease-in-out infinite",
            }}
          />
          En vivo
        </div>
      </header>

      <style>{`
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.3; }
        }
      `}</style>

      {loading && (
        <p
          style={{
            color: "#94A3B8",
            textAlign: "center",
            padding: "40px 0",
            fontSize: 14,
          }}
        >
          Cargando partidos...
        </p>
      )}

      {!loading && matches.length === 0 && (
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
            <IconCalendar />
          </div>
          <p style={{ color: "#94A3B8", fontSize: 14, margin: 0 }}>
            No hay partidos programados para hoy.
          </p>
          <p
            style={{
              color: "rgba(148,163,184,0.6)",
              fontSize: 12,
              marginTop: 4,
            }}
          >
            Vuelve mañana para predecir
          </p>
        </div>
      )}

      {!loading &&
        matches.map((match) => (
          <MatchCard
            key={match.id}
            match={match}
            prediction={predictions[match.id]}
            onSave={handleSave}
          />
        ))}

      {toast && (
        <div
          style={{
            position: "fixed",
            bottom: 96,
            left: "50%",
            transform: "translateX(-50%)",
            background: "#16A34A",
            color: "white",
            fontSize: 13,
            padding: "8px 18px",
            borderRadius: 999,
            boxShadow: "0 4px 20px rgba(22,163,74,0.4)",
            whiteSpace: "nowrap",
            zIndex: 20,
          }}
        >
          {toast}
        </div>
      )}
    </div>
  );
}
