import { useEffect, useState } from "react";
import { supabase } from "../lib/supabaseClient";
import {
  AVATAR_OPTIONS,
  DEFAULT_AVATAR,
  avatarFlagUrl,
  avatarName,
  resolveAvatarCode,
} from "../lib/avatars";

const IconUser = () => (
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
    <circle cx="12" cy="8" r="4" />
    <path d="M4 21c0-4 3.58-6 8-6s8 2 8 6" />
  </svg>
);

const IconEdit = () => (
  <svg
    width="15"
    height="15"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    aria-hidden="true"
  >
    <path d="M12 20h9" />
    <path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4Z" />
  </svg>
);

const IconTrophy = () => (
  <svg
    width="14"
    height="14"
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

const IconLogout = () => (
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
    <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
    <polyline points="16 17 21 12 16 7" />
    <line x1="21" y1="12" x2="9" y2="12" />
  </svg>
);

const card = {
  background: "rgba(30,41,59,0.80)",
  backdropFilter: "blur(16px)",
  border: "1px solid rgba(255,255,255,0.08)",
  borderRadius: 16,
  padding: 20,
  boxShadow: "0 4px 20px rgba(0,0,0,0.25)",
};

export default function Profile({ user, onLogout }) {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [username, setUsername] = useState("");
  const [avatar, setAvatar] = useState(DEFAULT_AVATAR);
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState("");
  const [toastError, setToastError] = useState(false);

  useEffect(() => {
    loadProfile();
  }, []);

  const loadProfile = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", user.id)
      .single();

    if (error) {
      console.error(error);
    } else if (data) {
      setProfile(data);
      setUsername(data.username || "");
      setAvatar(resolveAvatarCode(data.avatar));
    }
    setLoading(false);
  };

  const showToast = (msg, isError = false) => {
    setToast(msg);
    setToastError(isError);
    setTimeout(() => setToast(""), 2200);
  };

  const startEditing = () => {
    setUsername(profile?.username || "");
    setAvatar(resolveAvatarCode(profile?.avatar));
    setEditing(true);
  };

  const cancelEditing = () => {
    setUsername(profile?.username || "");
    setAvatar(resolveAvatarCode(profile?.avatar));
    setEditing(false);
  };

  const handleSave = async () => {
    const trimmed = username.trim();
    if (!trimmed) {
      showToast("El nombre de usuario no puede estar vacío", true);
      return;
    }

    setSaving(true);
    const { data, error } = await supabase
      .from("profiles")
      .update({ username: trimmed, avatar })
      .eq("id", user.id)
      .select()
      .single();

    if (error) {
      console.error(error);
      showToast("No se pudo guardar. Intenta de nuevo.", true);
    } else {
      setProfile(data);
      setEditing(false);
      showToast("Perfil actualizado");
    }
    setSaving(false);
  };

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
        <span style={{ color: "#16A34A" }}>
          <IconUser />
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
            Mi Perfil
          </h1>
          <p style={{ margin: 0, fontSize: 11, color: "#94A3B8" }}>
            Tu selección y nombre de jugador
          </p>
        </div>
      </header>

      {loading && (
        <p
          style={{
            color: "#94A3B8",
            textAlign: "center",
            padding: "40px 0",
            fontSize: 14,
          }}
        >
          Cargando perfil...
        </p>
      )}

      {!loading && (
        <div style={card}>
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              gap: 10,
            }}
          >
            {/* Avatar (bandera grande, ocupa todo el espacio) */}
            <div
              style={{
                width: 90,
                height: 90,
                borderRadius: "50%",
                overflow: "hidden",
                background:
                  "linear-gradient(135deg, rgba(22,163,74,0.25) 0%, rgba(15,23,42,0.6) 100%)",
                border: "2.5px solid rgba(22,163,74,0.45)",
                boxShadow: "0 0 28px rgba(22,163,74,0.25)",
                flexShrink: 0,
              }}
            >
              <img
                src={avatarFlagUrl(avatar)}
                alt={avatarName(avatar)}
                style={{
                  width: "100%",
                  height: "100%",
                  objectFit: "cover",
                  display: "block",
                }}
              />
            </div>

            {!editing && (
              <>
                <div style={{ textAlign: "center" }}>
                  <p
                    style={{
                      margin: 0,
                      fontSize: 18,
                      fontWeight: 800,
                      color: "#F1F5F9",
                    }}
                  >
                    {profile?.username || "Jugador"}
                  </p>
                  <p
                    style={{
                      margin: "2px 0 0",
                      fontSize: 12,
                      color: "#94A3B8",
                    }}
                  >
                    {user.email}
                  </p>
                </div>

                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 6,
                    background: "rgba(251,191,36,0.12)",
                    border: "1px solid rgba(251,191,36,0.25)",
                    borderRadius: 999,
                    padding: "5px 14px",
                    marginTop: 4,
                  }}
                >
                  <span style={{ color: "#FBBF24" }}>
                    <IconTrophy />
                  </span>
                  <span
                    style={{
                      fontSize: 13,
                      fontWeight: 700,
                      color: "#FBBF24",
                    }}
                  >
                    {profile?.total_points ?? 0} pts totales
                  </span>
                </div>

                <button
                  onClick={startEditing}
                  className="mt-2 w-full bg-primary hover:bg-primary-dark text-white font-semibold py-2.5 rounded-xl transition-all duration-150 active:scale-95 shadow-md shadow-primary/20 flex items-center justify-center gap-2"
                >
                  <IconEdit />
                  Editar perfil
                </button>
              </>
            )}

            {editing && (
              <div style={{ width: "100%" }}>
                {/* Campeonas del Mundo */}
                <p
                  style={{
                    margin: "6px 0 8px",
                    fontSize: 11,
                    fontWeight: 700,
                    color: "#FBBF24",
                    display: "flex",
                    alignItems: "center",
                    gap: 4,
                  }}
                >
                  🏆 Elige tu selección campeona
                </p>
                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns: "repeat(4, 1fr)",
                    gap: 8,
                    marginBottom: 16,
                  }}
                >
                  {AVATAR_OPTIONS.map((option) => {
                    const isSelected = option.code === avatar;
                    return (
                      <button
                        key={option.code}
                        type="button"
                        onClick={() => setAvatar(option.code)}
                        title={`${option.name} — ${option.titles}`}
                        style={{
                          aspectRatio: "1",
                          borderRadius: 12,
                          position: "relative",
                          overflow: "hidden",
                          cursor: "pointer",
                          border: isSelected
                            ? "2px solid #FBBF24"
                            : "1.5px solid rgba(255,255,255,0.1)",
                          boxShadow: isSelected
                            ? "0 0 12px rgba(251,191,36,0.35)"
                            : "none",
                          transition: "all 0.15s",
                          padding: 0,
                        }}
                      >
                        <img
                          src={avatarFlagUrl(option.code)}
                          alt={option.name}
                          style={{
                            width: "100%",
                            height: "100%",
                            objectFit: "cover",
                            display: "block",
                          }}
                        />
                        <div
                          style={{
                            position: "absolute",
                            inset: 0,
                            background:
                              "linear-gradient(to bottom, transparent 45%, rgba(0,0,0,0.78) 100%)",
                          }}
                        />
                        <div
                          style={{
                            position: "absolute",
                            left: 0,
                            right: 0,
                            bottom: 4,
                            display: "flex",
                            flexDirection: "column",
                            alignItems: "center",
                            lineHeight: 1.2,
                          }}
                        >
                          <span
                            style={{
                              fontSize: 8,
                              color: isSelected ? "#FBBF24" : "#F1F5F9",
                              fontWeight: 700,
                              textAlign: "center",
                              maxWidth: "100%",
                              overflow: "hidden",
                              textOverflow: "ellipsis",
                              whiteSpace: "nowrap",
                              padding: "0 2px",
                            }}
                          >
                            {option.name}
                          </span>
                          <span
                            style={{
                              fontSize: 7,
                              color: isSelected
                                ? "rgba(251,191,36,0.85)"
                                : "rgba(255,255,255,0.75)",
                              fontWeight: 500,
                              textAlign: "center",
                            }}
                          >
                            {option.titles}
                          </span>
                        </div>
                      </button>
                    );
                  })}
                </div>

                <label className="block text-xs text-text-muted mb-1.5 font-medium">
                  Nombre de usuario
                </label>
                <input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="Ej: messi10"
                  maxLength={24}
                  className="w-full bg-bg border border-border rounded-xl px-3 py-2.5 text-text placeholder:text-text-muted/50 focus:border-primary focus:ring-2 focus:ring-primary/20 focus:outline-none transition-all mb-4"
                />

                <div style={{ display: "flex", gap: 8 }}>
                  <button
                    onClick={cancelEditing}
                    disabled={saving}
                    className="flex-1 bg-white/5 hover:bg-white/10 border border-white/10 text-text-muted font-semibold py-2.5 rounded-xl transition-all duration-150 active:scale-95 disabled:opacity-50"
                  >
                    Cancelar
                  </button>
                  <button
                    onClick={handleSave}
                    disabled={saving}
                    className="flex-1 bg-primary hover:bg-primary-dark text-white font-semibold py-2.5 rounded-xl transition-all duration-150 active:scale-95 disabled:opacity-50 shadow-md shadow-primary/20"
                  >
                    {saving ? "Guardando..." : "Guardar cambios"}
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {!loading && (
        <div style={{ ...card, marginTop: 10, padding: 12 }}>
          <button
            onClick={onLogout}
            className="w-full flex items-center justify-center gap-2 text-danger font-semibold py-2 rounded-xl transition-all duration-150 active:scale-95 hover:bg-danger/10"
          >
            <IconLogout />
            Cerrar sesión
          </button>
        </div>
      )}

      {toast && (
        <div
          style={{
            position: "fixed",
            bottom: 96,
            left: "50%",
            transform: "translateX(-50%)",
            background: toastError ? "#EF4444" : "#16A34A",
            color: "white",
            fontSize: 13,
            padding: "8px 18px",
            borderRadius: 999,
            boxShadow: toastError
              ? "0 4px 20px rgba(239,68,68,0.4)"
              : "0 4px 20px rgba(22,163,74,0.4)",
            whiteSpace: "nowrap",
            zIndex: 20,
          }}
        >
          {toast}
        </div>
      )}
    </div>
  );
}
