import { supabase, FN } from "./supabase";

async function authHeader() {
  const { data: { session } } = await supabase.auth.getSession();
  return session ? `Bearer ${session.access_token}` : null;
}

// Proxy callClaude through Tythos backend — Tythos pays for grading
export async function gradeRemote(sys, usr, tok) {
  const auth = await authHeader();
  if (!auth) throw Object.assign(new Error("Not signed in."), { code: "NO_SESSION" });

  const r = await fetch(`${FN}/grade`, {
    method: "POST",
    headers: { "Content-Type": "application/json", Authorization: auth },
    body: JSON.stringify({ sys, usr, tok }),
  });

  if (r.status === 429) {
    const d = await r.json();
    throw Object.assign(new Error(d.message || "Run limit reached."), { code: d.error || "LIMIT_REACHED" });
  }
  if (r.status === 401) throw Object.assign(new Error("Session expired — please sign in again."), { code: "BAD_SESSION" });
  if (!r.ok) throw new Error(`Grade API error ${r.status}`);

  return r.json(); // raw Anthropic response — caller extracts .content[0].text
}

// Create a run record at suite start
export async function createRun(targetUrl, targetModel) {
  const auth = await authHeader();
  if (!auth) return null;
  const r = await fetch(`${FN}/runs`, {
    method: "POST",
    headers: { "Content-Type": "application/json", Authorization: auth },
    body: JSON.stringify({ target_url: targetUrl, target_model: targetModel, status: "running" }),
  });
  if (!r.ok) return null;
  const d = await r.json();
  return d.id || null;
}

// Save completed run results
export async function completeRun(runId, payload) {
  const auth = await authHeader();
  if (!auth || !runId) return;
  await fetch(`${FN}/runs?id=${runId}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json", Authorization: auth },
    body: JSON.stringify({ ...payload, status: "complete" }),
  });
}

// Mark run aborted
export async function abortRun(runId) {
  const auth = await authHeader();
  if (!auth || !runId) return;
  await fetch(`${FN}/runs?id=${runId}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json", Authorization: auth },
    body: JSON.stringify({ status: "aborted" }),
  });
}

// List user's past runs
export async function listRuns() {
  const auth = await authHeader();
  if (!auth) return [];
  const r = await fetch(`${FN}/runs`, { headers: { Authorization: auth } });
  if (!r.ok) return [];
  return r.json();
}

// Get current month usage + tier
export async function getUsage() {
  const { data: { session } } = await supabase.auth.getSession();
  if (!session) return { run_count: 0, tier: "free" };
  const yearMonth = new Date().toISOString().slice(0, 7);
  const [{ data: usage }, { data: sub }] = await Promise.all([
    supabase.from("usage").select("run_count").eq("user_id", session.user.id).eq("year_month", yearMonth).single(),
    supabase.from("subscriptions").select("tier").eq("user_id", session.user.id).single(),
  ]);
  return { run_count: usage?.run_count || 0, tier: sub?.tier || "free" };
}
