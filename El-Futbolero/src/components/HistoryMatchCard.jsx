const IconClock = () => (
  <svg
    width="13"
    height="13"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    aria-hidden="true"
  >
    <circle cx="12" cy="12" r="10" />
    <polyline points="12 6 12 12 16 14" />
  </svg>
);

const IconShield = () => (
  <svg
    width="28"
    height="28"
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

/**
 * Define el estilo de la insignia de puntos según el puntaje obtenido.
 * - 5 pts (resultado exacto): verde brillante (success)
 * - 3-4 pts: verde primario
 * - 1-2 pts: dorado (accent)
 * - 0 pts: gris neutro
 */
function getPointsBadge(points) {
  const pts = points ?? 0;
  if (pts >= 5) {
    return {
      label: `+${pts} pts`,
      className: "bg-success/15 text-success border border-success/30",
    };
  }
  if (pts >= 3) {
    return {
      label: `+${pts} pts`,
      className: "bg-primary/15 text-primary border border-primary/30",
    };
  }
  if (pts >= 1) {
    return {
      label: `+${pts} pts`,
      className: "bg-accent/15 text-accent border border-accent/30",
    };
  }
  return {
    label: "+0 pts",
    className: "bg-white/5 text-text-muted border border-white/10",
  };
}

export default function HistoryMatchCard({ prediction }) {
  const match = prediction.match;
  const isFinished = match.status === "finished";
  const isLive = match.status === "live";
  const wentToPenalties = Boolean(match.went_to_penalties);

  const dateLabel = new Date(match.match_date).toLocaleDateString("es-CO", {
    day: "numeric",
    month: "short",
  });
  const timeLabel = new Date(match.match_date).toLocaleTimeString("es-CO", {
    hour: "2-digit",
    minute: "2-digit",
  });

  const badge = getPointsBadge(prediction.points);

  return (
    <div className="relative bg-bg-card border border-white/8 rounded-2xl p-4 mb-4 shadow-lg shadow-black/30 overflow-hidden">
      {/* Subtle pitch circle accent */}
      <div className="pointer-events-none absolute -right-10 -top-10 w-32 h-32 border border-white/5 rounded-full" />

      {/* Header: fecha + insignia (puntos en la esquina) */}
      <div className="flex items-center justify-between mb-3">
        <span className="text-text-muted text-xs font-medium flex items-center gap-1.5 capitalize">
          <IconClock /> {dateLabel} · {timeLabel}
        </span>

        {isFinished && (
          <span
            className={`text-xs font-bold px-2.5 py-1 rounded-full tracking-wide ${badge.className}`}
          >
            {badge.label}
          </span>
        )}
        {isLive && (
          <span className="text-xs bg-danger/15 text-danger px-2.5 py-1 rounded-full font-semibold tracking-wide animate-pulse flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-danger inline-block" />{" "}
            EN VIVO
          </span>
        )}
        {!isFinished && !isLive && (
          <span className="text-xs bg-border text-text-muted px-2.5 py-1 rounded-full font-semibold tracking-wide">
            PENDIENTE
          </span>
        )}
      </div>

      {/* Equipos + marcador */}
      <div className="flex items-center justify-between gap-2">
        <div className="flex flex-col items-center gap-1.5 flex-1 min-w-0">
          {match.home_crest ? (
            <img
              src={match.home_crest}
              alt={match.team_home}
              className="w-10 h-10 object-contain drop-shadow-md"
            />
          ) : (
            <div className="w-10 h-10 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-text-muted">
              <IconShield />
            </div>
          )}
          <span className="font-semibold text-xs text-center leading-tight line-clamp-2">
            {match.team_home}
          </span>
        </div>

        <div className="flex flex-col items-center gap-1 px-1">
          <div className="flex items-center gap-2">
            <span className="w-11 h-11 flex items-center justify-center bg-bg border border-border rounded-xl text-xl font-extrabold text-success shadow-inner">
              {match.score_home ?? "-"}
            </span>
            <span className="text-text-muted font-bold">–</span>
            <span className="w-11 h-11 flex items-center justify-center bg-bg border border-border rounded-xl text-xl font-extrabold text-success shadow-inner">
              {match.score_away ?? "-"}
            </span>
          </div>
          <span className="text-[10px] text-text-muted font-medium uppercase tracking-wide">
            Resultado
          </span>

          {/* Resultado de penales (solo si el partido terminó así) */}
          {isFinished && wentToPenalties && (
            <span className="mt-0.5 text-[10px] bg-accent/15 text-accent font-bold px-2 py-0.5 rounded-full whitespace-nowrap">
              Penales {match.penalty_home ?? "-"}–{match.penalty_away ?? "-"}
            </span>
          )}
        </div>

        <div className="flex flex-col items-center gap-1.5 flex-1 min-w-0">
          {match.away_crest ? (
            <img
              src={match.away_crest}
              alt={match.team_away}
              className="w-10 h-10 object-contain drop-shadow-md"
            />
          ) : (
            <div className="w-10 h-10 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-text-muted">
              <IconShield />
            </div>
          )}
          <span className="font-semibold text-xs text-center leading-tight line-clamp-2">
            {match.team_away}
          </span>
        </div>
      </div>

      {/* Tu predicción */}
      <div className="mt-3 pt-3 border-t border-border/50 flex items-center justify-center gap-2 text-xs">
        <span className="text-text-muted">
          Tu predicción:{" "}
          <span className="text-text font-semibold">
            {prediction.pred_home} – {prediction.pred_away}
          </span>
        </span>
      </div>
    </div>
  );
}
