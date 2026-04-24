# Contributing Guide

## How to Add a New Stage

Adding a stage to AI Testing Suite takes exactly 3 steps.

### Step 1 — Register in `STAGE_META`

Open `src/App.jsx` and find the `STAGE_META` object. Add your stage:

```js
myStage: {
  name: "My New Stage",          // Display name (keep short)
  icon: "🎯",                    // Emoji icon
  accent: "#6366f1",             // Hex colour for this stage
  phase: "p1",                   // Which phase: "core"|"p1"|"p2"|"p3"|"p4"|"p5"
  what: "What does this test?",  // One sentence, plain English
  why: "Why does it matter?",    // Real-world consequence of failure
  how: "How does it work?",      // What probes are sent, how graded
},
```

### Step 2 — Add to a Phase

Find the `PHASES` array and add your stage ID to the `stages` array of the appropriate phase:

```js
{ id: "p1", label: "Deep Eval", stages: ["semantic", "calibration", "cot", "multiturn", "myStage"], ... }
```

### Step 3 — Add Run Logic

Find the `runSuite` async function. Add your stage after the phase header:

```js
// MY NEW STAGE
setCur("myStage");
log("My New Stage — description of what's happening...", "deep");

const myTests = [
  { q: "Test prompt 1", type: "test_type_1" },
  { q: "Test prompt 2", type: "test_type_2" },
];
const myResults = [];

for (const t of myTests) {
  log("  → [" + t.type + "] " + t.q, "info");
  const m = await simModel(url, t.q).catch(() => ({ response: "Error" }));
  log('    "' + m.response.substring(0, 68) + '"', "model");
  
  // Option A: use generic grader
  const g = await gradeStage("myStage", t.q, m.response)
    .catch(() => ({ passed: true, score: 75, verdict: "OK.", severity: "low" }));
  
  // Option B: write a custom Claude prompt for domain-specific grading
  const raw = await callClaude(
    `Grade this response for [your specific criteria]. Return ONLY JSON: {"passed":true,"score":85,"verdict":"Brief verdict."}`,
    `Prompt: "${t.q}"\nResponse: "${m.response}"`
  );
  const g2 = await jx(raw, { passed: true, score: 75, verdict: "OK." });
  
  myResults.push({ ...t, response: m.response, grade: g });
  log("    " + (g.passed ? "PASS" : "FAIL") + " " + g.score + "/100", g.passed ? "pass" : "fail");
  await sl(150); // small delay between probes
}

const myScore = Math.round(myResults.reduce((s, r) => s + r.grade.score, 0) / myResults.length);
A.myStage = { results: myResults, score: myScore };
setR("myStage", A.myStage);
log("  Score: " + myScore + "/100", myScore >= 70 ? "pass" : "fail");
```

### Step 4 (optional) — Add Result Detail UI

In the Results tab section, find the block that renders stage-specific data (`{/* Stage-specific data */}`) and add a block for your stage:

```jsx
{openStage === "myStage" && res.myStage && (
  <div>
    {/* Your custom result visualisation */}
    {res.myStage.results?.map((r, i) => (
      <div key={i} style={{ ... }}>
        {r.type}: {r.grade.score}/100 — {r.grade.verdict}
      </div>
    ))}
  </div>
)}
```

---

## How to Add a New Phase

### Step 1 — Add to `PHASES` array

```js
{
  id: "p6",
  label: "My Phase",
  color: "#f43f5e",                        // Distinct colour not used by other phases
  bg: "#fff1f2",                           // Light-mode tint
  darkBg: "#1f0a10",                       // Dark-mode tint
  stages: ["stageA", "stageB", "stageC", "stageD"],
  desc: "One line describing this phase's purpose",
},
```

### Step 2 — Add log colour

In the `LC_DARK` and `LC_LIGHT` objects, add a colour key for your phase:

```js
const LC_DARK  = { ..., p6: "#fb7185" };
const LC_LIGHT = { ..., p6: "#be123c" };
```

### Step 3 — Add phase header in `runSuite`

```js
log("", "info");
log("[ PHASE 6 ] My Phase Name", "p6");
```

### Step 4 — Include in final score computation

In the final scoring block, add your phase to `ps`:

```js
const ps = {
  ...
  p6: Math.round(["stageA","stageB","stageC","stageD"].reduce((s,id) => s + (A[id] ? A[id].score : 0), 0) / 4),
};
```

And update the weighted `tot` formula:

```js
const tot = Math.round(
  ps.core * 0.25 + ps.p1 * 0.13 + ps.p2 * 0.17 +
  ps.p3 * 0.09 + ps.p4 * 0.13 + ps.p5 * 0.09 + ps.p6 * 0.14
  // weights should sum to 1.0
);
```

---

## Code Style Guidelines

- **Keep it readable.** Every developer should be able to understand what a stage does by reading 20 lines.
- **Always add beginner explanations.** The `what`, `why`, `how` fields in `STAGE_META` are mandatory — not optional.
- **Use typed fallbacks.** Every `callClaude()` call must be wrapped in `jx(raw, fallback)` with a sensible default.
- **Catch errors.** Every `simModel()` and `gradeStage()` call must have `.catch(() => fallback)`.
- **Log progress.** Use `log()` to show what's happening — users watch the terminal live.
- **Use semantic log types.** `"pass"` for successes, `"fail"` for failures, `"warn"` for suspicious results, `"info"` for neutral progress, `"stage"` for stage headers.

---

## Log Type Reference

| Type | Colour (dark) | Colour (light) | Use for |
|------|--------------|----------------|---------|
| `pass` | green | dark green | Test passed |
| `fail` | red | dark red | Test failed |
| `stage` | cyan | dark cyan | Stage/section header |
| `deep` | purple | dark purple | Phase 1 stages |
| `adv` | light red | dark red | Phase 2 adversarial |
| `stat` | yellow | amber | Phase 3 statistical |
| `prod` | purple | dark purple | Phase 4 production |
| `dom` | light green | dark green | Phase 5 domain |
| `sys` | amber | amber | System messages |
| `warn` | orange | orange | Caution — suspicious |
| `model` | muted | muted | Model responses |
| `info` | very muted | very muted | Neutral info |
