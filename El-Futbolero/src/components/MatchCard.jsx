import { useState } from "react";
import PredictionInput from "./PredictionInput";

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
 * Determina el estado visual del partido:
 *  - "finished"  → FINALIZADO  (status en BD = "finished")
 *  - "live"      → EN VIVO     (status en BD = "live" O match_date ya pasó y no está finished)
 *  - "locked"    → CERRADO     (la hora ya pasó pero aún no empezó oficialmente)
 *  - "open"      → POR JUGAR   (todavía hay tiempo de predecir)
 *
 * Prioridad: finished > live > locked/open basado en match_date
 */
function getMatchState(match) {
  if (match.status === "finished") return "finished";
  if (match.status === "live") return "live";

  const now = new Date();
  const matchDate = new Date(match.match_date);

  // Si ya pasó la hora del partido, lo mostramos EN VIVO
  // (puede que aún no se haya actualizado el status en BD)
  if (matchDate <= now) return "live";

  // Cerrado: la predicción ya no se puede editar (5 minutos antes del partido)
  const fiveMinBefore = new Date(matchDate.getTime() - 5 * 60 * 1000);
  if (now >= fiveMinBefore) return "locked";

  return "open";
}

export default function MatchCard({ match, prediction, onSave }) {
  const [home, setHome] = useState(prediction?.pred_home ?? "");
  const [away, setAway] = useState(prediction?.pred_away ?? "");
  const [saved, setSaved] = useState(false);

  const matchState = getMatchState(match);
  const isFinished = matchState === "finished";
  const isLive = matchState === "live";
  const isLocked = matchState === "locked";
  const isOpen = matchState === "open";

  const wentToPenalties = Boolean(match.went_to_penalties);

  const handleSave = () => {
    if (home === "" || away === "") return;
    onSave({
      matchId: match.id,
      predHome: Number(home),
      predAway: Number(away),
    });
    setSaved(true);
    setTimeout(() => setSaved(false), 1500);
  };

  const timeLabel = new Date(match.match_date).toLocaleString("es-CO", {
    hour: "2-digit",
    minute: "2-digit",
  });

  return (
    <div className="relative bg-bg-card border border-white/8 rounded-2xl p-4 mb-4 shadow-lg shadow-black/30 transition-all duration-200 hover:shadow-xl hover:shadow-black/40 hover:border-primary/40 hover:-translate-y-0.5 overflow-hidden">
      {/* Subtle pitch circle accent */}
      <div className="pointer-events-none absolute -right-10 -top-10 w-32 h-32 border border-white/5 rounded-full" />

      {/* Header */}
      <div className="flex items-center justify-between mb-3">
        <span className="text-text-muted text-xs font-medium flex items-center gap-1.5">
          <IconClock /> {timeLabel}
        </span>

        {isFinished && (
          <span className="text-xs bg-success/15 text-success px-2.5 py-1 rounded-full font-semibold tracking-wide">
            FINALIZADO
          </span>
        )}

        {isLive && (
          <span className="text-xs bg-danger/15 text-danger px-2.5 py-1 rounded-full font-semibold tracking-wide animate-pulse flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-danger inline-block" />{" "}
            EN VIVO
          </span>
        )}

        {isLocked && (
          <span className="text-xs bg-border text-text-muted px-2.5 py-1 rounded-full font-semibold tracking-wide">
            CERRADO
          </span>
        )}

        {isOpen && (
          <span className="text-xs bg-primary/15 text-primary px-2.5 py-1 rounded-full font-semibold tracking-wide">
            POR JUGAR
          </span>
        )}
      </div>

      {/* Teams + score */}
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
          {isFinished || isLive ? (
            <div className="flex items-center gap-2">
              <span className="w-11 h-11 flex items-center justify-center bg-bg border border-border rounded-xl text-xl font-extrabold text-success shadow-inner">
                {match.score_home ?? (isLive ? "0" : "-")}
              </span>
              <span className="text-text-muted font-bold">–</span>
              <span className="w-11 h-11 flex items-center justify-center bg-bg border border-border rounded-xl text-xl font-extrabold text-success shadow-inner">
                {match.score_away ?? (isLive ? "0" : "-")}
              </span>
            </div>
          ) : (
            <PredictionInput
              home={home}
              away={away}
              onChangeHome={setHome}
              onChangeAway={setAway}
              disabled={isLocked}
            />
          )}
          <span className="text-[10px] text-text-muted font-medium uppercase tracking-wide">
            {isFinished || isLive ? "Resultado" : "Tu predicción"}
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

      {isOpen && (
        <button
          onClick={handleSave}
          disabled={home === "" || away === ""}
          className="mt-4 w-full bg-primary hover:bg-primary-dark text-white font-semibold py-2.5 rounded-xl transition-all duration-150 active:scale-95 disabled:opacity-40 disabled:cursor-not-allowed shadow-md shadow-primary/20"
        >
          {saved
            ? "Guardado ✓"
            : prediction
              ? "Actualizar predicción"
              : "Guardar predicción"}
        </button>
      )}

      {prediction && (
        <div className="mt-3 pt-3 border-t border-border/50 flex items-center justify-center gap-2 text-xs">
          <span className="text-text-muted">
            Tu pronóstico:{" "}
            <span className="text-text font-semibold">
              {prediction.pred_home} – {prediction.pred_away}
            </span>
          </span>
          {isFinished && prediction.points != null && (
            <span className="bg-accent/15 text-accent font-bold px-2 py-0.5 rounded-full">
              +{prediction.points} pts
            </span>
          )}
        </div>
      )}
    </div>
  );
}
