/**
 * Calcula los puntos obtenidos por una predicción.
 *
 * Reglas:
 * - Resultado exacto (marcador idéntico): 5 pts (no se suma nada más)
 * - Acierta el signo del resultado (gana local / gana visitante / empate): +2 pts
 * - Acierta los goles exactos de al menos un equipo (local o visitante): +1 pt
 * - Acierta la diferencia de goles entre ambos equipos: +1 pt
 *
 * @param {number} predHome - Goles predichos del equipo local
 * @param {number} predAway - Goles predichos del equipo visitante
 * @param {number} realHome - Goles reales del equipo local
 * @param {number} realAway - Goles reales del equipo visitante
 * @returns {number} Puntos obtenidos
 */
export function calcularPuntos(predHome, predAway, realHome, realAway) {
  // Resultado exacto = máximo de puntos
  const exacto = predHome === realHome && predAway === realAway;
  if (exacto) return 5;

  let pts = 0;

  // Signo del resultado (1 = gana local, -1 = gana visitante, 0 = empate)
  const signoPred = Math.sign(predHome - predAway);
  const signoReal = Math.sign(realHome - realAway);
  if (signoPred === signoReal) pts += 2;

  // Goles exactos de algún equipo
  if (predHome === realHome || predAway === realAway) pts += 1;

  // Diferencia de goles
  const diffPred = Math.abs(predHome - predAway);
  const diffReal = Math.abs(realHome - realAway);
  if (diffPred === diffReal) pts += 1;

  return pts;
}

/**
 * Devuelve un desglose legible de los puntos, útil para mostrar
 * al usuario por qué obtuvo cierto puntaje.
 */
export function desglosePuntos(predHome, predAway, realHome, realAway) {
  const exacto = predHome === realHome && predAway === realAway;
  if (exacto) {
    return { total: 5, detalles: ["¡Resultado exacto! +5 pts"] };
  }

  const detalles = [];
  let total = 0;

  const signoPred = Math.sign(predHome - predAway);
  const signoReal = Math.sign(realHome - realAway);
  if (signoPred === signoReal) {
    detalles.push("Resultado directo correcto: +2 pts");
    total += 2;
  }

  if (predHome === realHome || predAway === realAway) {
    detalles.push("Goles de un equipo exactos: +1 pt");
    total += 1;
  }

  const diffPred = Math.abs(predHome - predAway);
  const diffReal = Math.abs(realHome - realAway);
  if (diffPred === diffReal) {
    detalles.push("Diferencia de goles correcta: +1 pt");
    total += 1;
  }

  if (total === 0) {
    detalles.push("Sin puntos esta vez");
  }

  return { total, detalles };
}
