import { createClient } from "@supabase/supabase-js";

// Reemplaza estos valores con los de tu proyecto en Supabase
// (Project Settings > API). Idealmente usa variables de entorno:
// VITE_SUPABASE_URL y VITE_SUPABASE_ANON_KEY en un archivo .env
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
