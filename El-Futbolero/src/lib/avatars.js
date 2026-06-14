// Selecciones campeonas del mundo disponibles como avatar.
// "code" es el código ISO (o de subdivisión) que usa flagcdn.com
// para servir la bandera como imagen real.
export const AVATAR_OPTIONS = [
  { code: "br", name: "Brasil", titles: "5 títulos" },
  { code: "de", name: "Alemania", titles: "4 títulos" },
  { code: "it", name: "Italia", titles: "4 títulos" },
  { code: "ar", name: "Argentina", titles: "3 títulos" },
  { code: "fr", name: "Francia", titles: "2 títulos" },
  { code: "uy", name: "Uruguay", titles: "2 títulos" },
  { code: "gb-eng", name: "Inglaterra", titles: "1 título" },
  { code: "es", name: "España", titles: "1 título" },
];

export const DEFAULT_AVATAR = "br";

// Compatibilidad con perfiles que ya tenían guardado un emoji de
// bandera como avatar (formato anterior). Se traduce al código nuevo.
const LEGACY_EMOJI_TO_CODE = {
  "🇧🇷": "br",
  "🇩🇪": "de",
  "🇮🇹": "it",
  "🇦🇷": "ar",
  "🇫🇷": "fr",
  "🇺🇾": "uy",
  "🏴󠁧󠁢󠁥󠁮󠁧󠁿": "gb-eng",
  "🇪🇸": "es",
};

// Siempre devuelve un código de país válido, sin importar si el valor
// guardado es un código nuevo, un emoji antiguo o está vacío.
export function resolveAvatarCode(value) {
  if (!value) return DEFAULT_AVATAR;
  if (LEGACY_EMOJI_TO_CODE[value]) return LEGACY_EMOJI_TO_CODE[value];
  if (AVATAR_OPTIONS.some((option) => option.code === value)) return value;
  return DEFAULT_AVATAR;
}

// URL de la imagen de la bandera (llena todo el espacio del avatar).
export function avatarFlagUrl(value) {
  return `https://flagcdn.com/w320/${resolveAvatarCode(value)}.png`;
}

export function avatarName(value) {
  const code = resolveAvatarCode(value);
  return AVATAR_OPTIONS.find((option) => option.code === code)?.name || "Bandera";
}
