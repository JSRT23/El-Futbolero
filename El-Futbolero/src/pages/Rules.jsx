const IconTarget = () => (
  <svg
    width="20"
    height="20"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.8"
    strokeLinecap="round"
    strokeLinejoin="round"
    aria-hidden="true"
  >
    <circle cx="12" cy="12" r="10" />
    <circle cx="12" cy="12" r="6" />
    <circle cx="12" cy="12" r="2" />
  </svg>
);
const IconCheck = () => (
  <svg
    width="20"
    height="20"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    aria-hidden="true"
  >
    <polyline points="20 6 9 17 4 12" />
  </svg>
);
const IconBall = () => (
  <svg
    width="20"
    height="20"
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
  </svg>
);
const IconRuler = () => (
  <svg
    width="20"
    height="20"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.8"
    strokeLinecap="round"
    strokeLinejoin="round"
    aria-hidden="true"
  >
    <path d="M3 17L17 3l4 4L7 21z" />
    <line x1="10" y1="14" x2="14" y2="10" />
  </svg>
);
const IconClipboard = () => (
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
    <path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2" />
    <rect x="8" y="2" width="8" height="4" rx="1" />
  </svg>
);
const IconLightbulb = () => (
  <svg
    width="16"
    height="16"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.8"
    strokeLinecap="round"
    strokeLinejoin="round"
    aria-hidden="true"
  >
    <path d="M9 18h6M10 22h4M12 2a7 7 0 0 1 7 7c0 2.5-1.3 4.7-3.2 6H8.2A7 7 0 0 1 12 2z" />
  </svg>
);
const IconClock = () => (
  <svg
    width="16"
    height="16"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.8"
    strokeLinecap="round"
    strokeLinejoin="round"
    aria-hidden="true"
  >
    <circle cx="12" cy="12" r="10" />
    <polyline points="12 6 12 12 16 14" />
  </svg>
);

const card = {
  background: "rgba(30,41,59,0.80)",
  backdropFilter: "blur(16px)",
  border: "1px solid rgba(255,255,255,0.08)",
  borderRadius: 16,
  padding: 16,
  boxShadow: "0 4px 20px rgba(0,0,0,0.25)",
};

export default function Rules() {
  const rules = [
    {
      Icon: IconTarget,
      title: "Resultado exacto",
      points: "+5 pts",
      desc: "Adivinas el marcador exacto del partido (ej. predices 3-1 y queda 3-1).",
      color: "#22C55E",
    },
    {
      Icon: IconCheck,
      title: "Resultado directo",
      points: "+2 pts",
      desc: "Aciertas quién gana o si es empate, aunque el marcador no sea exacto.",
      color: "#16A34A",
    },
    {
      Icon: IconBall,
      title: "Goles de un equipo",
      points: "+1 pt",
      desc: "Aciertas los goles exactos de uno de los dos equipos (local o visitante).",
      color: "#FBBF24",
    },
    {
      Icon: IconRuler,
      title: "Diferencia de goles",
      points: "+1 pt",
      desc: "La diferencia de goles de tu predicción coincide con la del resultado real.",
      color: "#FBBF24",
    },
  ];

  return (
    <div style={{ maxWidth: 448, margin: "0 auto", padding: "24px 16px 0" }}>
      <header
        style={{
          marginBottom: 20,
          display: "flex",
          alignItems: "center",
          gap: 10,
        }}
      >
        <span style={{ color: "#94A3B8" }}>
          <IconClipboard />
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
            Reglas
          </h1>
          <p style={{ margin: 0, fontSize: 11, color: "#94A3B8" }}>
            Cómo se calculan los puntos
          </p>
        </div>
      </header>

      <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
        {rules.map((rule) => (
          <div key={rule.title} style={card}>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                marginBottom: 6,
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                <span style={{ color: rule.color }}>
                  <rule.Icon />
                </span>
                <span
                  style={{ fontWeight: 600, fontSize: 13, color: "#F1F5F9" }}
                >
                  {rule.title}
                </span>
              </div>
              <span
                style={{ fontWeight: 700, fontSize: 13, color: rule.color }}
              >
                {rule.points}
              </span>
            </div>
            <p
              style={{
                margin: 0,
                fontSize: 12,
                color: "#94A3B8",
                lineHeight: 1.6,
                paddingLeft: 30,
              }}
            >
              {rule.desc}
            </p>
          </div>
        ))}
      </div>

      <div style={{ ...card, marginTop: 10 }}>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 8,
            marginBottom: 10,
          }}
        >
          <span style={{ color: "#FBBF24" }}>
            <IconLightbulb />
          </span>
          <span style={{ fontWeight: 600, fontSize: 13, color: "#F1F5F9" }}>
            Ejemplo
          </span>
        </div>
        <p
          style={{
            margin: "0 0 8px",
            fontSize: 12,
            color: "#94A3B8",
            lineHeight: 1.6,
          }}
        >
          El partido terminó <strong style={{ color: "#F1F5F9" }}>2-1</strong>.
          Tú predijiste <strong style={{ color: "#F1F5F9" }}>3-2</strong>:
        </p>
        <div style={{ display: "flex", flexDirection: "column", gap: 5 }}>
          {[
            { text: "No fue resultado exacto", pts: null, color: null },
            {
              text: "Acertaste que ganaba el local",
              pts: "+2 pts",
              color: "#16A34A",
            },
            {
              text: "No acertaste goles exactos de ningún equipo",
              pts: "+0",
              color: "#94A3B8",
            },
            {
              text: "Diferencia de 1 en ambos",
              pts: "+1 pt",
              color: "#FBBF24",
            },
          ].map(({ text, pts, color }) => (
            <div
              key={text}
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                fontSize: 12,
                color: "#94A3B8",
              }}
            >
              <span>– {text}</span>
              {pts && (
                <span
                  style={{
                    fontWeight: 700,
                    color,
                    marginLeft: 8,
                    whiteSpace: "nowrap",
                  }}
                >
                  {pts}
                </span>
              )}
            </div>
          ))}
        </div>
        <div
          style={{
            marginTop: 12,
            paddingTop: 12,
            borderTop: "1px solid rgba(255,255,255,0.05)",
            fontSize: 14,
            fontWeight: 700,
            color: "#F1F5F9",
          }}
        >
          Total: 3 pts
        </div>
      </div>

      <div style={{ ...card, marginTop: 10 }}>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 8,
            marginBottom: 10,
          }}
        >
          <span style={{ color: "#94A3B8" }}>
            <IconClock />
          </span>
          <span style={{ fontWeight: 600, fontSize: 13, color: "#F1F5F9" }}>
            Importante
          </span>
        </div>
        <p
          style={{ margin: 0, fontSize: 12, color: "#94A3B8", lineHeight: 1.6 }}
        >
          Las predicciones se pueden hacer hasta el momento en que inicia el
          partido. Una vez comienza, ya no podrás editarla. ¡Entra cada día para
          no perder oportunidades de sumar puntos!
        </p>
      </div>
    </div>
  );
}
