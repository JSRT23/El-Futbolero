import "dotenv/config";

const APISPORTS_KEY = process.env.APISPORTS_KEY;

if (!APISPORTS_KEY) {
  console.error("❌ Falta APISPORTS_KEY en scripts/.env");
  process.exit(1);
}

const response = await fetch("https://v3.football.api-sports.io/status", {
  headers: { "x-apisports-key": APISPORTS_KEY },
});

const data = await response.json();
console.log(JSON.stringify(data, null, 2));
