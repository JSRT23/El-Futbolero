/**
 * Prueba: consulta los partidos del Mundial 2026 desde football-data.org
 * y muestra cuántos hay y los primeros 3 como ejemplo.
 *
 * Uso:
 *   node scripts/testFixtures.js
 */

import "dotenv/config";

const FOOTBALL_DATA_TOKEN = process.env.FOOTBALL_DATA_TOKEN;

const response = await fetch(
  "https://api.football-data.org/v4/competitions/WC/matches",
  {
    headers: { "X-Auth-Token": FOOTBALL_DATA_TOKEN },
  },
);

const data = await response.json();

if (data.matches) {
  console.log("Total partidos:", data.matches.length);
  console.log("---");
  data.matches.slice(0, 3).forEach((m) => {
    console.log({
      id: m.id,
      fecha: m.utcDate,
      estado: m.status,
      local: m.homeTeam.name,
      escudoLocal: m.homeTeam.crest,
      visitante: m.awayTeam.name,
      escudoVisitante: m.awayTeam.crest,
      estadio: m.venue,
      goles: `${m.score?.fullTime?.home ?? "-"} - ${m.score?.fullTime?.away ?? "-"}`,
    });
  });
} else {
  console.log(JSON.stringify(data, null, 2));
}
