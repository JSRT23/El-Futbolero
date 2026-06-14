export default function StadiumBackground() {
  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 0,
        backgroundColor: "#0F172A",
        overflow: "hidden",
        pointerEvents: "none",
      }}
    >
      <div
        style={{
          position: "absolute",
          top: -160,
          left: -160,
          width: 500,
          height: 500,
          borderRadius: "50%",
          background:
            "radial-gradient(circle, rgba(22,163,74,0.30) 0%, transparent 70%)",
        }}
      />
      <div
        style={{
          position: "absolute",
          bottom: -100,
          right: -100,
          width: 550,
          height: 550,
          borderRadius: "50%",
          background:
            "radial-gradient(circle, rgba(251,191,36,0.14) 0%, transparent 70%)",
        }}
      />
      <div
        style={{
          position: "absolute",
          top: "45%",
          left: "50%",
          transform: "translate(-50%, -50%)",
          width: 400,
          height: 400,
          borderRadius: "50%",
          background:
            "radial-gradient(circle, rgba(22,163,74,0.10) 0%, transparent 70%)",
        }}
      />
      <svg
        style={{
          position: "absolute",
          inset: 0,
          width: "100%",
          height: "100%",
        }}
        viewBox="0 0 390 844"
        preserveAspectRatio="xMidYMid slice"
        fill="none"
        aria-hidden="true"
      >
        <g stroke="white" strokeOpacity="0.10" strokeWidth="1.5">
          <rect x="30" y="80" width="330" height="684" rx="2" />
          <line x1="30" y1="422" x2="360" y2="422" />
          <circle cx="195" cy="422" r="70" />
          <circle
            cx="195"
            cy="422"
            r="3"
            fill="white"
            fillOpacity="0.18"
            stroke="none"
          />
          <rect x="105" y="80" width="180" height="90" />
          <rect x="145" y="80" width="100" height="45" />
          <path d="M 148 170 A 50 50 0 0 1 242 170" />
          <circle
            cx="195"
            cy="150"
            r="2.5"
            fill="white"
            fillOpacity="0.18"
            stroke="none"
          />
          <rect x="105" y="674" width="180" height="90" />
          <rect x="145" y="719" width="100" height="45" />
          <path d="M 148 674 A 50 50 0 0 0 242 674" />
          <circle
            cx="195"
            cy="694"
            r="2.5"
            fill="white"
            fillOpacity="0.18"
            stroke="none"
          />
          <rect x="162" y="68" width="66" height="14" />
          <rect x="162" y="762" width="66" height="14" />
          <path d="M 30 96 A 14 14 0 0 1 44 80" />
          <path d="M 346 80 A 14 14 0 0 1 360 96" />
          <path d="M 30 748 A 14 14 0 0 0 44 764" />
          <path d="M 346 764 A 14 14 0 0 0 360 748" />
        </g>
      </svg>
    </div>
  );
}
