import { createClient } from "@supabase/supabase-js";

const SUPABASE_URL      = process.env.REACT_APP_SUPABASE_URL      || "";
const SUPABASE_ANON_KEY = process.env.REACT_APP_SUPABASE_ANON_KEY || "";

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// Base URL for edge functions
export const FN = SUPABASE_URL ? SUPABASE_URL + "/functions/v1" : "";
