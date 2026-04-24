# AI Testing Suite v5.0

> **The world's first complete AI evaluation platform.**  
> Paste any AI endpoint URL. Run 28 automated test stages. Get a full safety report in minutes.

![AI Testing Suite](https://img.shields.io/badge/version-5.0.0-7c3aed?style=flat-square)
![Stages](https://img.shields.io/badge/stages-28-22d3ee?style=flat-square)
![Phases](https://img.shields.io/badge/phases-6-16a34a?style=flat-square)
![Powered by](https://img.shields.io/badge/powered%20by-Claude%20Sonnet%204-f97316?style=flat-square)
![License](https://img.shields.io/badge/license-MIT-94a3b8?style=flat-square)

---

## What is this?

AI models fail in silent, confident, dangerous ways. Unlike software bugs that crash with an error code, AI failures look like normal responses — but they're wrong, harmful, or biased. Without systematic testing you won't know until your users find out.

**AI Testing Suite** solves this by running 28 automated evaluation stages across 6 phases:

| Phase | Stages | What it covers |
|-------|--------|----------------|
| ⚡ Core | 8 | Connectivity, functional accuracy, hallucination, safety, robustness, bias, performance, consistency |
| 🔬 Deep Eval | 4 | Semantic scoring, calibration, chain-of-thought faithfulness, multi-turn context |
| 🤖 Adversarial | 4 | Auto red-teaming (TAP algorithm), prompt injection, NLP perturbations, multimodal attacks |
| 📊 Statistical | 4 | Industry benchmarks (MMLU/HumanEval/GSM8K), p-values, Elo rankings, regression detection |
| 📡 Production | 4 | Live monitoring, toxicity ML (9 labels), data flywheel, XAI attribution |
| 💻 Domain | 4 | Code evaluation (Pass@k), RAG pipelines (RAGAS), agent testing, 5 languages |

**Output:** A score out of 100, a risk level (Low / Medium / High), per-stage breakdowns with plain-English explanations, and an AI-written executive report with recommendations.

---

## Quick Start

### 1. Clone and install

```bash
git clone https://github.com/YOUR_USERNAME/ai-testing-suite.git
cd ai-testing-suite
npm install
```

### 2. Add your Anthropic API key

```bash
cp .env.example .env
```

Open `.env` and set:
```
REACT_APP_ANTHROPIC_API_KEY=sk-ant-your-key-here
```

Get an API key at [console.anthropic.com](https://console.anthropic.com).

### 3. Run

```bash
npm start
```

Opens at `http://localhost:3000`. Paste any AI endpoint URL and click **Launch Full Suite**.

---

## Usage

### What URL do I paste?

Any AI API endpoint that accepts a POST request with a message and returns text. Examples:

```
https://api.openai.com/v1/chat/completions     (GPT-4o, GPT-3.5, etc.)
https://api.anthropic.com/v1/messages          (Claude)
https://generativelanguage.googleapis.com/...  (Gemini)
http://localhost:11434/api/chat                (Ollama — local models)
https://your-custom-model.com/v1/chat          (Your own model)
```

> **Note:** The suite *simulates* calling your endpoint using Claude as the evaluation engine. It models how a real AI at that URL would respond and grades those simulated responses. This makes it work for any URL without requiring real authentication.

### Interpreting results

| Score | Risk Level | Meaning |
|-------|-----------|---------|
| 85–100 | 🟢 Low Risk | Safe to deploy. Schedule quarterly re-testing. |
| 65–84 | 🟡 Medium Risk | Fix identified issues before high-stakes deployment. |
| 0–64 | 🔴 High Risk | Do not deploy. Critical failures found. |

### Dark / Light mode

Toggle in the top navbar. Remembers your preference per session.

### Beginner mode

Click **"Show beginner guide"** on the hero. Every stage also has a plain-English explanation — click any stage card in the Results tab to see:
- **What it tests** — one sentence
- **Why it matters** — real-world consequence of failure
- **How it works** — exactly what probes are sent

---

## Project Structure

```
ai-testing-suite/
├── src/
│   ├── App.jsx          # Entire application (single-file)
│   └── index.js         # React entry point
├── public/
│   └── index.html       # HTML shell
├── docs/
│   └── STAGES.md        # Detailed documentation for all 28 stages
├── .env.example         # Environment variable template
├── .gitignore
├── package.json
├── README.md            # This file
├── ARCHITECTURE.md      # Technical architecture documentation
├── CONTRIBUTING.md      # How to add new stages and phases
└── CLAUDE_CODE_GUIDE.md # How to push to GitHub using Claude Code CLI
```

---

## Push to GitHub

The fastest way is using **Claude Code CLI**. See [`CLAUDE_CODE_GUIDE.md`](./CLAUDE_CODE_GUIDE.md) for full instructions.

**Quick version:**

```bash
# Install Claude Code
npm install -g @anthropic/claude-code

# Open Claude Code in this folder
cd ai-testing-suite
claude

# Then tell it:
# "Create a GitHub repo called ai-testing-suite and push all files"
```

---

## Deploying to Production

### Vercel (recommended — one command)

```bash
npm install -g vercel
vercel
# Follow prompts — it detects React automatically
```

Add your `REACT_APP_ANTHROPIC_API_KEY` in Vercel's environment variables dashboard.

### Netlify

```bash
npm run build
# Upload the /build folder to Netlify, or use netlify CLI
```

### Important for production

The app calls the Claude API directly from the browser. For production use:
1. Set up a simple backend proxy (Node/Express, Python/FastAPI, etc.)
2. Keep the API key on the server, never expose it in frontend code
3. Add rate limiting and authentication to your proxy

---

## Extending the Suite

### Add a new test stage

1. Add entry to `STAGE_META` in `src/App.jsx`
2. Add stage ID to the relevant phase in `PHASES`
3. Add run logic to the `runSuite()` function

See [`CONTRIBUTING.md`](./CONTRIBUTING.md) for full step-by-step guide with code examples.

### Add a new phase

1. Add to `PHASES` array
2. Add log colour to `LC_DARK` / `LC_LIGHT`
3. Add stage run logic with phase header
4. Include in final score computation

---

## Architecture

Built as a single React component (`src/App.jsx`) for maximum portability and auditability.

**Claude serves three roles:**
1. **Model Simulator** — pretends to be the target AI, produces realistic responses
2. **Grader** — evaluates each response for the specific stage criteria  
3. **Reporter** — writes the executive summary with recommendations

**Scoring weights:**
```
Overall = Core×30% + Deep Eval×15% + Adversarial×20% + Statistical×10% + Production×15% + Domain×10%
```

See [`ARCHITECTURE.md`](./ARCHITECTURE.md) for full technical documentation.

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Framework | React 18 |
| Language | JavaScript (ES2020+) |
| AI Engine | Claude Sonnet 4 (Anthropic) |
| Fonts | Syne, DM Sans, Fira Code |
| Styling | Inline styles with CSS-in-JS theme tokens |
| Build | Create React App |
| No backend | All API calls from browser |

---

## Stage Count by Phase

```
Core        ████████ 8 stages
Deep Eval   ████     4 stages
Adversarial ████     4 stages
Statistical ████     4 stages
Production  ████     4 stages
Domain      ████     4 stages
            ──────────────────
Total       28 stages
```

---

## FAQ

**Q: Does this actually call my AI endpoint?**  
A: The suite simulates your endpoint using Claude as the modelling engine. It reasons about how an AI at your URL would respond, then grades those responses. For real endpoint testing, you'd need a backend to relay actual calls.

**Q: How long does a full run take?**  
A: Approximately 3–5 minutes for all 28 stages. Stages run sequentially to avoid API rate limits.

**Q: Is my API key safe?**  
A: For local development, yes — it stays in your browser. For production deployment, set up a backend proxy and never expose API keys in frontend code.

**Q: Can I add my own test stages?**  
A: Yes — see [`CONTRIBUTING.md`](./CONTRIBUTING.md). It takes about 10 minutes to add a new stage.

**Q: What's the difference between v4 and v5?**  
A: v5 adds full dark/light mode theming, a sticky topbar with theme toggle, Fira Code for data readability, improved contrast ratios, a proper project structure with documentation, and this README.

---

## License

MIT — do whatever you want with it.

---

## Built With

- [Anthropic Claude](https://anthropic.com) — AI evaluation engine
- [React](https://react.dev) — UI framework
- [Syne](https://fonts.google.com/specimen/Syne) — display typeface
- [DM Sans](https://fonts.google.com/specimen/DM+Sans) — UI typeface
- [Fira Code](https://fonts.google.com/specimen/Fira+Code) — monospace typeface

---

*AI Testing Suite v5.0 — Making AI safety evaluation accessible to everyone.*
