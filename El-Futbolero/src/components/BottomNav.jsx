const IconBall = ({ size = 22 }) => (
  <svg
    width={size}
    height={size}
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
const IconHistory = ({ size = 22 }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.8"
    strokeLinecap="round"
    strokeLinejoin="round"
    aria-hidden="true"
  >
    <path d="M3 12a9 9 0 1 0 2.64-6.36L3 8" />
    <path d="M3 3v5h5" />
    <path d="M12 7v5l3 3" />
  </svg>
);
const IconTrophy = ({ size = 22 }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.8"
    strokeLinecap="round"
    strokeLinejoin="round"
    aria-hidden="true"
  >
    <path d="M8 21h8M12 17v4M17 4H7l1 9a4 4 0 0 0 8 0l1-9z" />
    <path d="M17 4c0 0 2 0 2 2s-2 4-4 4M7 4c0 0-2 0-2 2s2 4 4 4" />
  </svg>
);
const IconClipboard = ({ size = 22 }) => (
  <svg
    width={size}
    height={size}
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
const IconUser = ({ size = 22 }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.8"
    strokeLinecap="round"
    strokeLinejoin="round"
    aria-hidden="true"
  >
    <circle cx="12" cy="8" r="4" />
    <path d="M4 21c0-4 3.58-6 8-6s8 2 8 6" />
  </svg>
);

export default function BottomNav({ active, onChange }) {
  const items = [
    { key: "home", label: "Partidos", Icon: IconBall },
    { key: "history", label: "Historial", Icon: IconHistory },
    { key: "ranking", label: "Ranking", Icon: IconTrophy },
    { key: "rules", label: "Reglas", Icon: IconClipboard },
    { key: "profile", label: "Perfil", Icon: IconUser },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-bg-card/90 backdrop-blur-xl border-t border-white/8 flex justify-around py-2 pb-[env(safe-area-inset-bottom)] shadow-2xl shadow-black/40">
      {items.map(({ key, label, Icon }) => {
        const isActive = active === key;
        return (
          <button
            key={key}
            onClick={() => onChange(key)}
            aria-label={label}
            className={`flex flex-col items-center gap-0.5 px-2.5 py-1.5 rounded-xl transition-all duration-150 ${isActive ? "text-accent" : "text-text-muted"}`}
          >
            <span
              className={`transition-transform duration-150 ${isActive ? "scale-110" : ""}`}
            >
              <Icon size={20} />
            </span>
            <span
              className={`text-[9px] font-semibold tracking-wide transition-colors whitespace-nowrap ${isActive ? "text-accent" : "text-text-muted/70"}`}
            >
              {label}
            </span>
          </button>
        );
      })}
    </nav>
  );
}
