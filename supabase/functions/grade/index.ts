// Tythos — grade edge function
// Proxies callClaude through Tythos's Anthropic key — users never need their own grader key

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const ANTHROPIC_KEY        = Deno.env.get("ANTHROPIC_API_KEY")!;
const SUPABASE_URL         = Deno.env.get("SUPABASE_URL")!;
const SUPABASE_SERVICE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
const FREE_TIER_LIMIT      = 3;
const GRADER_MODEL         = "claude-sonnet-4-6";

const cors = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const json = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), { status, headers: { ...cors, "Content-Type": "application/json" } });

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: cors });

  try {
    // Authenticate
    const auth = req.headers.get("Authorization");
    if (!auth) return json({ error: "Unauthorized" }, 401);

    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);
    const { data: { user }, error: authErr } = await supabase.auth.getUser(auth.replace("Bearer ", ""));
    if (authErr || !user) return json({ error: "Unauthorized" }, 401);

    // Enforce free tier limit
    const yearMonth = new Date().toISOString().slice(0, 7);
    const { data: sub } = await supabase.from("subscriptions").select("tier").eq("user_id", user.id).single();
    const tier = sub?.tier || "free";

    if (tier === "free") {
      const { data: usage } = await supabase
        .from("usage").select("run_count")
        .eq("user_id", user.id).eq("year_month", yearMonth).single();
      if ((usage?.run_count || 0) >= FREE_TIER_LIMIT) {
        return json({
          error: "LIMIT_REACHED",
          message: `Free tier limit reached (${FREE_TIER_LIMIT} runs/month). Upgrade to Pro for unlimited runs.`,
        }, 429);
      }
    }

    // Forward to Anthropic
    const { sys, usr, tok } = await req.json();
    const r = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": ANTHROPIC_KEY,
        "anthropic-version": "2023-06-01",
      },
      body: JSON.stringify({
        model: GRADER_MODEL,
        max_tokens: tok || 900,
        system: sys,
        messages: [{ role: "user", content: usr }],
      }),
    });

    const data = await r.json();
    return new Response(JSON.stringify(data), {
      status: r.status,
      headers: { ...cors, "Content-Type": "application/json" },
    });
  } catch (e) {
    return json({ error: e.message }, 500);
  }
});
