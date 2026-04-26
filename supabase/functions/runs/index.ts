// Tythos — runs edge function
// CRUD for evaluation run history + usage tracking

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const SUPABASE_URL         = Deno.env.get("SUPABASE_URL")!;
const SUPABASE_SERVICE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

const cors = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const json = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), { status, headers: { ...cors, "Content-Type": "application/json" } });

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: cors });

  const url      = new URL(req.url);
  const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);

  // Public share link — no auth needed
  const shareId = url.searchParams.get("share_id");
  if (shareId && req.method === "GET") {
    const { data, error } = await supabase.from("runs").select("*").eq("share_id", shareId).single();
    if (error) return json({ error: "Not found" }, 404);
    return json(data);
  }

  // All other operations require auth
  const auth = req.headers.get("Authorization");
  if (!auth) return json({ error: "Unauthorized" }, 401);
  const { data: { user } } = await supabase.auth.getUser(auth.replace("Bearer ", ""));
  if (!user) return json({ error: "Unauthorized" }, 401);

  const yearMonth = new Date().toISOString().slice(0, 7);

  // POST — create new run + increment usage counter
  if (req.method === "POST") {
    const body = await req.json();
    const { data, error } = await supabase
      .from("runs").insert({ user_id: user.id, ...body }).select().single();
    if (error) return json({ error: error.message }, 500);
    await supabase.rpc("increment_usage", { p_user_id: user.id, p_year_month: yearMonth });
    return json(data, 201);
  }

  // PATCH — save completed run results
  if (req.method === "PATCH") {
    const runId = url.searchParams.get("id");
    if (!runId) return json({ error: "Missing id" }, 400);
    const body = await req.json();
    const { data, error } = await supabase
      .from("runs")
      .update({ ...body, completed_at: new Date().toISOString() })
      .eq("id", runId).eq("user_id", user.id)
      .select().single();
    if (error) return json({ error: error.message }, 500);
    return json(data);
  }

  // GET — list user's runs (most recent 50)
  if (req.method === "GET") {
    const { data, error } = await supabase
      .from("runs")
      .select("id, target_url, target_model, overall_score, status, created_at, share_id")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false })
      .limit(50);
    if (error) return json({ error: error.message }, 500);
    return json(data);
  }

  // DELETE — remove a run
  if (req.method === "DELETE") {
    const runId = url.searchParams.get("id");
    if (!runId) return json({ error: "Missing id" }, 400);
    await supabase.from("runs").delete().eq("id", runId).eq("user_id", user.id);
    return json({ ok: true });
  }

  return new Response("Method not allowed", { status: 405, headers: cors });
});
