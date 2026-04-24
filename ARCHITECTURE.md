# Architecture & Technical Documentation

## AI Testing Suite v5.0

---

## Overview

The AI Testing Suite is a React single-page application that evaluates any AI model endpoint across 28 test stages using Claude Sonnet 4 as the evaluation engine. It requires no backend — all API calls are made directly from the browser.

```
User → pastes URL → React app → Claude API (grader) → simulates target model → scores results → report
```

---

## Project Structure

```
ai-testing-suite/
├── src/
│   ├── App.jsx          # Entire application (single-file architecture)
│   └── index.js         # React entry point
├── public/
│   └── index.html       # HTML shell
├── docs/
│   └── STAGES.md        # Detailed stage documentation
├── .env.example         # Environment variable template
├── .gitignore
├── package.json
├── README.md            # Quick-start guide
├── ARCHITECTURE.md      # This file
└── CONTRIBUTING.md      # How to add new stages/phases
```

---

## Core Architecture

### Single-File Design
The entire application lives in `src/App.jsx`. This is intentional — it keeps the codebase auditable, portable, and easy to understand. Every stage's logic, UI, and explanation is co-located.

### Data-Driven Stages
Two top-level data structures drive everything:

#### `STAGE_META`
A flat registry of all 28 stages. Each entry contains:
```js
{
  name: string,        // Display name
  icon: string,        // Emoji icon
  accent: string,      // Hex colour for this stage
  phase: string,       // Which phase this belongs to ("core" | "p1" | "p2" | "p3" | "p4" | "p5")
  what: string,        // Plain-English: what does this test?
  why: string,         // Plain-English: why does it matter?
  how: string,         // Plain-English: how does it work?
}
```

#### `PHASES`
An ordered array of phase objects:
```js
{
  id: string,          // "core" | "p1" | "p2" | "p3" | "p4" | "p5"
  label: string,       // Display label
  color: string,       // Hex colour for this phase
  bg: string,          // Light-mode background tint
  darkBg: string,      // Dark-mode background tint
  stages: string[],    // Ordered array of stage IDs
  desc: string,        // One-line description
}
```

**To add a new stage:** add an entry to `STAGE_META`, add its ID to the relevant phase's `stages` array, and add the run logic to `runSuite()`.

**To add a new phase:** add a new entry to `PHASES`, add stage IDs to it, and add a new `log()` block + stage loop in `runSuite()`.

---

## API Architecture

### Claude as Testing Engine
All AI calls go to `https://api.anthropic.com/v1/messages` using `claude-sonnet-4-20250514`.

Claude serves **three distinct roles**:

| Role | Function | Called by |
|------|----------|-----------|
| **Model Simulator** | Pretends to be the target AI, produces realistic responses | `simModel()` |
| **Grader** | Evaluates each response for correctness/safety/bias | `gradeStage()` |
| **Reporter** | Writes the executive summary at the end | Final `callClaude()` in `runSuite()` |

### Core API helper
```js
async function callClaude(systemPrompt, userPrompt, maxTokens = 900)
```
Returns raw text. All callers wrap the output in `jx(raw, fallback)` which safely parses JSON with a typed fallback.

### `simModel(url, prompt, history?)`
Simulates the target model at the given URL. Takes optional conversation history for multi-turn scenarios. Returns:
```js
{ response: string, latency_ms: number, tokens: number, confidence: number }
```

### `gradeStage(stage, prompt, response)`
Grades a single probe response for a given stage. Returns:
```js
{ passed: boolean, score: number, verdict: string, severity: "low"|"medium"|"high"|"critical" }
```

---

## Theme System

The entire UI is driven by a single `T` (theme tokens) object computed from the `dark` boolean state:

```js
const T = {
  bg, bgSurf, bgCard, bgHover,   // Backgrounds
  border, borderFocus,            // Borders
  text, textSub, textMut,        // Text hierarchy
  accent, accentFg,              // Brand purple
  cyan, green, amber, red,       // Semantic colours
  termBg, termBd,                // Terminal colours
  LC,                            // Log line colour map
}
```

Light/dark mode switches instantly by toggling `dark` state — no CSS classes, no `localStorage`, no flash.

### Score Colour Function
```js
const scoreColor = (score, dark) =>
  score >= 85 ? (dark ? "#4ade80" : "#16a34a") :   // green
  score >= 65 ? (dark ? "#fbbf24" : "#b45309") :   // amber
               (dark ? "#f87171" : "#dc2626");      // red
```

---

## Scoring Weights

The overall score is a weighted average of phase scores:

| Phase | Weight | Rationale |
|-------|--------|-----------|
| Core (8 stages) | 30% | Foundation — must pass first |
| Deep Eval (4 stages) | 15% | Semantic quality |
| Adversarial (4 stages) | 20% | Security is high stakes |
| Statistical (4 stages) | 10% | Analytical rigor |
| Production (4 stages) | 15% | Operational readiness |
| Domain (4 stages) | 10% | Specialised capability |

```
overall = core×0.30 + p1×0.15 + p2×0.20 + p3×0.10 + p4×0.15 + p5×0.10
```

### Risk Levels
| Score | Risk | Meaning |
|-------|------|---------|
| 85–100 | Low Risk | Safe to deploy |
| 65–84 | Medium Risk | Proceed with caution |
| 0–64 | High Risk | Do not deploy |

---

## State Management

All state lives in a single React component using `useState`. Key state:

| State | Type | Purpose |
|-------|------|---------|
| `url` | string | Target endpoint URL |
| `status` | "idle"\|"running"\|"done" | Run lifecycle |
| `cur` | string\|null | Currently running stage ID |
| `res` | `{[stageId]: result}` | All stage results |
| `logs` | `{msg,t,ts}[]` | Console log lines |
| `overall` | `{score, phases}` | Final aggregated scores |
| `dark` | boolean | Theme mode |
| `tab` | string | Active tab |
| `selPhase` | string | Selected phase in Results tab |
| `openStage` | string\|null | Expanded stage detail |

---

## Font Stack

| Font | Use |
|------|-----|
| Syne 800 | Display headlines only |
| DM Sans 300–600 | All UI text, labels, body |
| Fira Code 400–600 | All data, metrics, logs, terminal, code |

---

## Performance Notes

- All 28 stages run **sequentially**, not in parallel — this avoids rate-limiting the Claude API
- Each stage calls Claude 1–6 times depending on probe count
- Total run time: ~3–5 minutes for a full 28-stage evaluation
- `sleep()` calls between probes add small delays to improve UX pacing

---

## Browser Compatibility

Requires a modern browser with support for:
- `fetch()` API
- ES2020+ (async/await, optional chaining, nullish coalescing)
- CSS custom properties
- SVG

Tested on: Chrome 120+, Firefox 121+, Safari 17+, Edge 120+
