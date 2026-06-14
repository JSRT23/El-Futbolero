/**
 * Par de inputs numéricos para predecir el marcador de un partido.
 *
 * Props:
 * - home, away: valores actuales (string o number)
 * - onChangeHome, onChangeAway: callbacks al cambiar cada valor
 * - disabled: si está bloqueado (partido ya iniciado/finalizado)
 */
export default function PredictionInput({
  home,
  away,
  onChangeHome,
  onChangeAway,
  disabled,
}) {
  return (
    <div className="flex gap-2 items-center">
      <input
        type="number"
        min="0"
        inputMode="numeric"
        value={home}
        disabled={disabled}
        onChange={(e) => onChangeHome(e.target.value)}
        aria-label="Goles equipo local"
        className="w-12 h-10 bg-bg border border-border rounded-lg text-center text-text focus:border-primary focus:outline-none disabled:opacity-50"
      />
      <span className="text-text-muted">-</span>
      <input
        type="number"
        min="0"
        inputMode="numeric"
        value={away}
        disabled={disabled}
        onChange={(e) => onChangeAway(e.target.value)}
        aria-label="Goles equipo visitante"
        className="w-12 h-10 bg-bg border border-border rounded-lg text-center text-text focus:border-primary focus:outline-none disabled:opacity-50"
      />
    </div>
  );
}
