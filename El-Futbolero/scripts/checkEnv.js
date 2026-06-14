import "dotenv/config";

console.log(
  "FOOTBALL_DATA_TOKEN:",
  process.env.FOOTBALL_DATA_TOKEN ? "✅ presente" : "❌ falta",
);
console.log(
  "SUPABASE_URL:",
  process.env.SUPABASE_URL ? "✅ presente" : "❌ falta",
);
console.log(
  "SUPABASE_SERVICE_ROLE_KEY:",
  process.env.SUPABASE_SERVICE_ROLE_KEY ? "✅ presente" : "❌ falta",
);
console.log("---");
console.log("Valores crudos:");
console.log("SUPABASE_URL =", process.env.SUPABASE_URL);
console.log(
  "SUPABASE_SERVICE_ROLE_KEY =",
  process.env.SUPABASE_SERVICE_ROLE_KEY?.slice(0, 20) + "...",
);
