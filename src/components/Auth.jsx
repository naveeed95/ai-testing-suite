import { useState } from "react";
import { supabase } from "../lib/supabase";

export default function Auth({ dark, onClose }) {
  const [mode, setMode]         = useState("signin");
  const [email, setEmail]       = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading]   = useState(false);
  const [error, setError]       = useState("");
  const [success, setSuccess]   = useState("");

  const T = {
    bg:    dark ? "#0b0b1c" : "#ffffff",
    card:  dark ? "#0f0f28" : "#f8f8ff",
    input: dark ? "#070711" : "#f0f0fc",
    border:dark ? "#1c1c45" : "#ddddf0",
    text:  dark ? "#ececff" : "#0a0a1a",
    sub:   dark ? "#7878aa" : "#44446a",
    red:   dark ? "#ff4455" : "#dc2626",
    green: dark ? "#00f5a0" : "#059669",
  };

  async function handleSubmit(e) {
    e.preventDefault();
    setError(""); setSuccess(""); setLoading(true);
    try {
      if (mode === "signup") {
        const { error: err } = await supabase.auth.signUp({ email, password });
        if (err) throw err;
        setSuccess("Account created! Check your email to confirm, then sign in.");
        setMode("signin");
      } else {
        const { error: err } = await supabase.auth.signInWithPassword({ email, password });
        if (err) throw err;
        onClose();
      }
    } catch (err) {
      setError(err.message || "Something went wrong.");
    } finally {
      setLoading(false);
    }
  }

  async function handleGoogle() {
    setError(""); setLoading(true);
    const { error: err } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: { redirectTo: window.location.origin },
    });
    if (err) { setError(err.message); setLoading(false); }
  }

  const inp = { width:"100%", padding:"11px 14px", background:T.input, border:"1px solid "+T.border, borderRadius:8, color:T.text, fontFamily:"'DM Sans',sans-serif", fontSize:13, boxSizing:"border-box" };

  return (
    <div onClick={onClose} style={{ position:"fixed", inset:0, background:"rgba(0,0,0,0.75)", backdropFilter:"blur(4px)", zIndex:10000, display:"flex", alignItems:"center", justifyContent:"center" }}>
      <div onClick={e=>e.stopPropagation()} style={{ background:T.bg, border:"1px solid "+T.border, borderRadius:16, padding:"36px 40px", width:"100%", maxWidth:400, position:"relative", boxShadow:"0 24px 80px rgba(0,0,0,0.5)" }}>

        <button onClick={onClose} style={{ position:"absolute", top:16, right:18, background:"none", border:"none", color:T.sub, cursor:"pointer", fontSize:20 }}>×</button>

        <div style={{ textAlign:"center", marginBottom:28 }}>
          <div style={{ fontSize:14, fontWeight:800, background:"linear-gradient(90deg,#b794f4,#00d4ff)", WebkitBackgroundClip:"text", WebkitTextFillColor:"transparent", fontFamily:"'Syne',sans-serif", marginBottom:6 }}>TYTHOS</div>
          <div style={{ fontSize:18, fontWeight:600, color:T.text }}>{mode==="signin"?"Sign in":"Create account"}</div>
          <div style={{ fontSize:12, color:T.sub, marginTop:4 }}>No Anthropic key needed — Tythos covers it</div>
        </div>

        <button onClick={handleGoogle} disabled={loading} style={{ width:"100%", padding:"11px", background:T.card, border:"1px solid "+T.border, borderRadius:9, color:T.text, fontFamily:"'DM Sans',sans-serif", fontSize:13, fontWeight:500, cursor:"pointer", marginBottom:16, display:"flex", alignItems:"center", justifyContent:"center", gap:9 }}>
          <span style={{ fontSize:15 }}>G</span> Continue with Google
        </button>

        <div style={{ display:"flex", alignItems:"center", gap:10, marginBottom:16 }}>
          <div style={{ flex:1, height:1, background:T.border }} />
          <span style={{ fontSize:11, color:T.sub }}>or email</span>
          <div style={{ flex:1, height:1, background:T.border }} />
        </div>

        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom:12 }}>
            <input type="email" value={email} onChange={e=>setEmail(e.target.value)} placeholder="Email address" required autoComplete="email" style={inp} />
          </div>
          <div style={{ marginBottom:20 }}>
            <input type="password" value={password} onChange={e=>setPassword(e.target.value)} placeholder="Password" required autoComplete={mode==="signup"?"new-password":"current-password"} style={inp} />
          </div>

          {error   && <div style={{ fontSize:12, color:T.red,   marginBottom:12, padding:"8px 12px", background:T.red+"22",   borderRadius:6 }}>{error}</div>}
          {success && <div style={{ fontSize:12, color:T.green, marginBottom:12, padding:"8px 12px", background:T.green+"22", borderRadius:6 }}>{success}</div>}

          <button type="submit" disabled={loading||!email||!password} style={{ width:"100%", padding:"12px", background:"linear-gradient(135deg,#7c3aed,#0891b2)", border:"none", borderRadius:9, color:"#fff", fontFamily:"'DM Sans',sans-serif", fontSize:14, fontWeight:600, cursor:"pointer", opacity:(loading||!email||!password)?0.5:1 }}>
            {loading ? "…" : mode==="signin" ? "Sign in" : "Create account"}
          </button>
        </form>

        <div style={{ textAlign:"center", marginTop:16, fontSize:12, color:T.sub }}>
          {mode==="signin" ? "No account? " : "Already have one? "}
          <button onClick={()=>{setMode(m=>m==="signin"?"signup":"signin");setError("");setSuccess("");}} style={{ background:"none", border:"none", color:"#b794f4", cursor:"pointer", fontSize:12, fontWeight:600, textDecoration:"underline" }}>
            {mode==="signin" ? "Create one free" : "Sign in"}
          </button>
        </div>

        <div style={{ textAlign:"center", marginTop:12, fontSize:10, color:T.sub, lineHeight:1.6 }}>
          Free: 3 runs/month · Pro: $49/mo unlimited
        </div>
      </div>
    </div>
  );
}
