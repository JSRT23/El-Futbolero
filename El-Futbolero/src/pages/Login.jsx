import { useState } from "react";
import { supabase } from "../lib/supabaseClient";

const IconBall = ({ size = 28 }) => (
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

const IconUser = ({ size = 16 }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    aria-hidden="true"
  >
    <circle cx="12" cy="8" r="4" />
    <path d="M4 21c0-4 3.58-6 8-6s8 2 8 6" />
  </svg>
);

const IconMail = ({ size = 16 }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    aria-hidden="true"
  >
    <rect x="2" y="4" width="20" height="16" rx="2" />
    <path d="m22 6-10 7L2 6" />
  </svg>
);

const IconLock = ({ size = 16 }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    aria-hidden="true"
  >
    <rect x="3" y="11" width="18" height="11" rx="2" />
    <path d="M7 11V7a5 5 0 0 1 10 0v4" />
  </svg>
);

const IconTrophy = ({ size = 14 }) => (
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

/**
 * Pantalla de autenticación tipo "portal de torneo": fondo con destellos
 * de reflectores de estadio, tarjeta flotante con efecto glass, y un
 * selector de pestañas (Iniciar sesión / Crear cuenta).
 */
export default function Login() {
  const [isRegister, setIsRegister] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [username, setUsername] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      if (isRegister) {
        if (!username.trim()) {
          setError("Ingresa un nombre de usuario");
          setLoading(false);
          return;
        }

        const { data, error: signUpError } = await supabase.auth.signUp({
          email,
          password,
        });
        if (signUpError) throw signUpError;

        if (data.user) {
          // Bono de bienvenida: +1 punto por cada partido ya finalizado
          // antes de que este usuario se registrara.
          const { count: finishedCount, error: countError } = await supabase
            .from("matches")
            .select("id", { count: "exact", head: true })
            .eq("status", "finished");

          if (countError) throw countError;

          const welcomeBonus = finishedCount || 0;

          const { error: profileError } = await supabase
            .from("profiles")
            .insert({
              id: data.user.id,
              username: username.trim(),
              total_points: welcomeBonus,
            });
          if (profileError) throw profileError;
        }
      } else {
        const { error: signInError } = await supabase.auth.signInWithPassword({
          email,
          password,
        });
        if (signInError) throw signInError;
      }
    } catch (err) {
      setError(err.message || "Ocurrió un error, intenta de nuevo");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen relative flex items-center justify-center px-6 py-10 bg-bg overflow-hidden">
      {/* Destellos de reflectores de estadio */}
      <div className="pointer-events-none absolute -top-32 -left-32 w-96 h-96 bg-primary/25 rounded-full blur-3xl" />
      <div className="pointer-events-none absolute -bottom-40 -right-24 w-[28rem] h-[28rem] bg-accent/15 rounded-full blur-3xl" />
      <div className="pointer-events-none absolute top-1/3 right-1/4 w-72 h-72 bg-primary/10 rounded-full blur-3xl" />

      {/* Líneas sutiles de "cancha" */}
      <div className="pointer-events-none absolute inset-0 opacity-[0.04]">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[140%] aspect-square border-2 border-white rounded-full" />
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-px h-full bg-white" />
      </div>

      <div className="relative w-full max-w-sm">
        {/* Logo / título */}
        <div className="text-center mb-6">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary/15 border border-primary/30 shadow-lg shadow-primary/20 mb-3 text-primary">
            <IconBall size={30} />
          </div>
          <h1 className="text-2xl font-extrabold text-text tracking-tight">
            Predictor Mundial
          </h1>
          <p className="text-text-muted text-sm mt-1">
            Predice resultados y compite por el primer lugar
          </p>
        </div>

        {/* Tarjeta flotante */}
        <div className="bg-bg-card/80 backdrop-blur-xl border border-white/10 rounded-3xl shadow-2xl shadow-black/40 p-6">
          {/* Selector de pestañas */}
          <div className="relative grid grid-cols-2 bg-bg rounded-xl p-1 mb-6 border border-border">
            <span
              className={`absolute inset-y-1 w-1/2 rounded-lg bg-primary shadow-md shadow-primary/30 transition-transform duration-300 ${
                isRegister ? "translate-x-full" : "translate-x-0"
              }`}
            />
            <button
              type="button"
              onClick={() => {
                setIsRegister(false);
                setError("");
              }}
              className={`relative z-10 py-2 text-sm font-semibold rounded-lg transition-colors ${
                !isRegister ? "text-white" : "text-text-muted"
              }`}
            >
              Iniciar sesión
            </button>
            <button
              type="button"
              onClick={() => {
                setIsRegister(true);
                setError("");
              }}
              className={`relative z-10 py-2 text-sm font-semibold rounded-lg transition-colors ${
                isRegister ? "text-white" : "text-text-muted"
              }`}
            >
              Crear cuenta
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {isRegister && (
              <div>
                <label className="block text-xs text-text-muted mb-1.5 font-medium">
                  Nombre de usuario
                </label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-3 flex items-center text-text-muted">
                    <IconUser size={16} />
                  </span>
                  <input
                    type="text"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    placeholder="Ej: messi10"
                    required
                    className="w-full bg-bg border border-border rounded-xl pl-10 pr-3 py-2.5 text-text placeholder:text-text-muted/50 focus:border-primary focus:ring-2 focus:ring-primary/20 focus:outline-none transition-all"
                  />
                </div>
              </div>
            )}

            <div>
              <label className="block text-xs text-text-muted mb-1.5 font-medium">
                Correo
              </label>
              <div className="relative">
                <span className="absolute inset-y-0 left-3 flex items-center text-text-muted">
                  <IconMail size={16} />
                </span>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="tucorreo@ejemplo.com"
                  required
                  className="w-full bg-bg border border-border rounded-xl pl-10 pr-3 py-2.5 text-text placeholder:text-text-muted/50 focus:border-primary focus:ring-2 focus:ring-primary/20 focus:outline-none transition-all"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs text-text-muted mb-1.5 font-medium">
                Contraseña
              </label>
              <div className="relative">
                <span className="absolute inset-y-0 left-3 flex items-center text-text-muted">
                  <IconLock size={16} />
                </span>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                  minLength={6}
                  className="w-full bg-bg border border-border rounded-xl pl-10 pr-3 py-2.5 text-text placeholder:text-text-muted/50 focus:border-primary focus:ring-2 focus:ring-primary/20 focus:outline-none transition-all"
                />
              </div>
            </div>

            {error && (
              <p className="text-danger text-sm bg-danger/10 border border-danger/30 rounded-xl px-3 py-2.5">
                {error}
              </p>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-primary hover:bg-primary-dark text-white font-semibold py-3 rounded-xl transition-all duration-150 active:scale-[0.98] disabled:opacity-50 shadow-lg shadow-primary/25 mt-2"
            >
              {loading
                ? "Cargando..."
                : isRegister
                  ? "Crear cuenta"
                  : "Iniciar sesión"}
            </button>
          </form>
        </div>

        <p className="text-center text-text-muted text-xs mt-5 flex items-center justify-center gap-1.5">
          <IconTrophy size={14} />
          Acumula puntos prediciendo cada partido del Mundial
        </p>
      </div>
    </div>
  );
}
