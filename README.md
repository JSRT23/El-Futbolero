# ⚽ El Futbolero

Juego de **predicciones del Mundial**: cada usuario pronostica marcadores, suma puntos según qué tan cerca estuvo y compite en la tabla de posiciones.

![React](https://img.shields.io/badge/React-19-61DAFB?logo=react&logoColor=white)
![Supabase](https://img.shields.io/badge/Supabase-3ECF8E?logo=supabase&logoColor=white)
![Tailwind](https://img.shields.io/badge/Tailwind-4-06B6D4?logo=tailwindcss&logoColor=white)
![Docker](https://img.shields.io/badge/Docker-ready-2496ED?logo=docker&logoColor=white)

## Sistema de puntos

| Acierto | Puntos |
|---|---|
| Resultado exacto | **5** (no se suma nada más) |
| Signo correcto (local / visitante / empate) | +2 |
| Goles exactos de al menos un equipo | +1 |
| Diferencia de goles correcta | +1 |

La lógica vive en `El-Futbolero/src/lib/scoring.js`.

## Arquitectura

- **Frontend:** React 19 + Tailwind 4 (carpeta `El-Futbolero/`).
- **Backend:** Supabase (auth, base de datos, políticas RLS).
- **Sincronización de partidos:** `scripts/syncMatches.js` trae fixtures y resultados de [football-data.org](https://www.football-data.org/) (competición `WC`) y los guarda en Supabase.

## Variables de entorno

Copia `.env.example` a `.env`.

| Variable | Dónde se usa | Obligatoria |
|---|---|---|
| `VITE_SUPABASE_URL` | Frontend | Sí |
| `VITE_SUPABASE_ANON_KEY` | Frontend | Sí |
| `FOOTBALL_DATA_TOKEN` | Script de sincronización | Solo para sync |
| `SUPABASE_SERVICE_ROLE_KEY` | Script de sincronización | Solo para sync |

> ⚠️ `SUPABASE_SERVICE_ROLE_KEY` es secreta: nunca la expongas en el frontend ni la subas al repo.

## Cómo correrlo

### Con Docker

```bash
git clone https://github.com/JSRT23/El-Futbolero.git
cd El-Futbolero
cp .env.example .env                       # completa las variables VITE_*
docker compose up --build web              # producción -> http://localhost:8080
docker compose --profile dev up dev        # desarrollo  -> http://localhost:5173
docker compose --profile sync run --rm sync   # sincroniza partidos una vez
```

### Sin Docker

```bash
cd El-Futbolero
npm ci
npm run dev
node scripts/syncMatches.js     # con FOOTBALL_DATA_TOKEN, SUPABASE_URL y SUPABASE_SERVICE_ROLE_KEY exportadas
```

## Estructura

```
El-Futbolero/            # app React (src/pages, src/components, src/lib)
  scripts/syncMatches.js # sincronización con football-data.org
docker-compose.yml       # web, dev (perfil dev) y sync (perfil sync)
```
