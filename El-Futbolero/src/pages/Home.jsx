import { useEffect, useState, useRef } from "react";
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

// Ícono de calendario para el FAB (un poco más pequeño)
const IconCalendarFab = () => (
  <svg
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
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

// Devuelve el rango [inicio, fin] del día solicitado ("today" | "tomorrow")
function getDayRange(day) {
  const start = new Date();
  if (day === "tomorrow") start.setDate(start.getDate() + 1);
  start.setHours(0, 0, 0, 0);

  const end = new Date(start);
  end.setHours(23, 59, 59, 999);

  return { start, end };
}

export default function Home({ user }) {
  const [matches, setMatches] = useState([]);
  const [predictions, setPredictions] = useState({});
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState("");
  const [selectedDay, setSelectedDay] = useState("today"); // "today" | "tomorrow"
  const [menuOpen, setMenuOpen] = useState(false);

  // Para que la suscripción en tiempo real siempre filtre según el
  // día actualmente seleccionado, sin tener que recrear el canal
  // cada vez que cambia selectedDay.
  const selectedDayRef = useRef(selectedDay);
  useEffect(() => {
    selectedDayRef.current = selectedDay;
  }, [selectedDay]);

  // Recarga los datos cuando cambia el día seleccionado
  useEffect(() => {
    loadData();
  }, [selectedDay]);

  useEffect(() => {
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
          const { start: dayStart, end: dayEnd } = getDayRange(
            selectedDayRef.current,
          );

          if (payload.eventType === "DELETE") {
            setMatches((prev) => prev.filter((m) => m.id !== payload.old.id));
            return;
          }

          const updated = payload.new;
          const matchDate = new Date(updated.match_date);

          setMatches((prev) => {
            const exists = prev.some((m) => m.id === updated.id);
            let next;
            if (exists) {
              // Si el partido ya estaba en la lista pero cambió de
              // fecha y ya no corresponde al día seleccionado, lo
              // quitamos. Si sigue correspondiendo, lo actualizamos.
              if (matchDate >= dayStart && matchDate <= dayEnd) {
                next = prev.map((m) =>
                  m.id === updated.id ? { ...m, ...updated } : m,
                );
              } else {
                next = prev.filter((m) => m.id !== updated.id);
              }
            } else if (matchDate >= dayStart && matchDate <= dayEnd) {
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
    const { start: dayStart, end: dayEnd } = getDayRange(selectedDay);

    const { data: matchesData, error: matchesError } = await supabase
      .from("matches")
      .select("*")
      .gte("match_date", dayStart.toISOString())
      .lte("match_date", dayEnd.toISOString())
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

  const handleSelectDay = (day) => {
    setSelectedDay(day);
    setMenuOpen(false);
  };

  const { start: rangeStart } = getDayRange(selectedDay);
  const dayLabel = rangeStart.toLocaleDateString("es-CO", {
    weekday: "long",
    day: "numeric",
    month: "long",
  });

  const headerTitle =
    selectedDay === "today" ? "Partidos de hoy" : "Partidos de mañana";
  const emptyMessage =
    selectedDay === "today"
      ? "No hay partidos programados para hoy."
      : "No hay partidos programados para mañana.";
  const emptySubMessage =
    selectedDay === "today"
      ? "Vuelve mañana para predecir"
      : "Vuelve más tarde para revisar";

  return (
    <div
      style={{
        maxWidth: 448,
        margin: "0 auto",
        padding: "24px 16px 0",
        position: "relative",
      }}
    >
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
              {headerTitle}
            </h1>
            <p
              style={{
                margin: 0,
                fontSize: 11,
                color: "#94A3B8",
                textTransform: "capitalize",
              }}
            >
              {dayLabel}
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
        @keyframes fabMenuIn {
          from { opacity: 0; transform: translateY(8px) scale(0.96); }
          to { opacity: 1; transform: translateY(0) scale(1); }
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
            {emptyMessage}
          </p>
          <p
            style={{
              color: "rgba(148,163,184,0.6)",
              fontSize: 12,
              marginTop: 4,
            }}
          >
            {emptySubMessage}
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

      {/* Overlay para cerrar el menú al tocar fuera */}
      {menuOpen && (
        <div
          onClick={() => setMenuOpen(false)}
          style={{
            position: "fixed",
            inset: 0,
            zIndex: 25,
          }}
        />
      )}

      {/* Menú Hoy / Mañana */}
      {menuOpen && (
        <div
          style={{
            position: "fixed",
            bottom: 168,
            right: 24,
            zIndex: 30,
            background: "#1E293B",
            border: "1px solid rgba(255,255,255,0.1)",
            borderRadius: 14,
            boxShadow: "0 8px 28px rgba(0,0,0,0.45)",
            overflow: "hidden",
            minWidth: 140,
            animation: "fabMenuIn 0.15s ease-out",
          }}
        >
          <button
            onClick={() => handleSelectDay("today")}
            style={{
              display: "block",
              width: "100%",
              textAlign: "left",
              padding: "12px 16px",
              background:
                selectedDay === "today"
                  ? "rgba(22,163,74,0.15)"
                  : "transparent",
              color: selectedDay === "today" ? "#22C55E" : "#F1F5F9",
              fontSize: 14,
              fontWeight: selectedDay === "today" ? 700 : 500,
              border: "none",
              cursor: "pointer",
            }}
          >
            Hoy
          </button>
          <div style={{ height: 1, background: "rgba(255,255,255,0.08)" }} />
          <button
            onClick={() => handleSelectDay("tomorrow")}
            style={{
              display: "block",
              width: "100%",
              textAlign: "left",
              padding: "12px 16px",
              background:
                selectedDay === "tomorrow"
                  ? "rgba(22,163,74,0.15)"
                  : "transparent",
              color: selectedDay === "tomorrow" ? "#22C55E" : "#F1F5F9",
              fontSize: 14,
              fontWeight: selectedDay === "tomorrow" ? 700 : 500,
              border: "none",
              cursor: "pointer",
            }}
          >
            Mañana
          </button>
        </div>
      )}

      {/* FAB calendario Hoy/Mañana */}
      <button
        onClick={() => setMenuOpen((prev) => !prev)}
        aria-label="Seleccionar día"
        style={{
          position: "fixed",
          bottom: 96,
          right: 24,
          zIndex: 30,
          width: 52,
          height: 52,
          borderRadius: "50%",
          background: "#16A34A",
          color: "white",
          border: "none",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          boxShadow: "0 6px 18px rgba(22,163,74,0.45)",
          cursor: "pointer",
        }}
      >
        <IconCalendarFab />
      </button>

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
