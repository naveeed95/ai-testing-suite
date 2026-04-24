# Push to GitHub with Claude Code CLI

Step-by-step guide to get this project onto GitHub using Claude Code.

---

## Prerequisites

Install these before starting:

```bash
# 1. Node.js (v18 or higher)
# Download from https://nodejs.org

# 2. Claude Code CLI
npm install -g @anthropic/claude-code

# 3. Git
# Download from https://git-scm.com

# 4. GitHub CLI (recommended — makes auth easy)
# Windows:
winget install GitHub.cli
# Mac:
brew install gh
# Linux:
sudo apt install gh
```

---

## Step 1 — Authenticate

```bash
# Authenticate Claude Code with your Anthropic API key
# It will prompt you on first run, or set the env var:
export ANTHROPIC_API_KEY=your_key_here   # Mac/Linux
set ANTHROPIC_API_KEY=your_key_here      # Windows

# Authenticate GitHub CLI
gh auth login
# Follow the prompts → choose GitHub.com → HTTPS → browser auth
```

---

## Step 2 — Set up the project

```bash
# Navigate into the project folder you downloaded
cd ai-testing-suite

# Install dependencies
npm install
```

---

## Step 3 — Add your API key

```bash
# Copy the example env file
cp .env.example .env

# Open .env and add your Anthropic API key
# (use any text editor)
```

Your `.env` should look like:
```
REACT_APP_ANTHROPIC_API_KEY=sk-ant-xxxxxxxxxxxxxxxx
```

---

## Step 4 — Test it locally first

```bash
npm start
# Opens http://localhost:3000
# Paste any AI endpoint URL and click Launch Full Suite
```

---

## Step 5 — Open Claude Code in the project

```bash
# From inside the ai-testing-suite folder:
claude
```

Claude Code will start. You'll see a prompt like `>`.

---

## Step 6 — Tell Claude Code to push to GitHub

Type this (or something like it) at the Claude Code prompt:

```
Initialize a git repo, create a new GitHub repository called "ai-testing-suite", 
commit all files with a proper commit message, and push to GitHub.
```

Claude Code will run all the Git commands automatically:

```bash
# It will do something like this for you:
git init
git add .
git commit -m "feat: AI Testing Suite v5.0 - 28 stages, 6 phases, dark/light mode"
gh repo create ai-testing-suite --public --source=. --remote=origin --push
```

---

## Step 7 — Verify it worked

```bash
# Claude Code should show you the GitHub URL, but you can also check:
gh repo view --web
# or
git remote -v
```

---

## Alternative: Push manually without Claude Code

If you prefer to do it yourself:

```bash
# 1. Initialize git
git init

# 2. Stage all files
git add .

# 3. Commit
git commit -m "feat: AI Testing Suite v5.0 - complete AI evaluation platform"

# 4. Create GitHub repo and push
gh repo create ai-testing-suite --public --source=. --remote=origin --push

# OR with a PAT instead of GitHub CLI:
git remote add origin https://github.com/YOUR_USERNAME/ai-testing-suite.git
git branch -M main
git push -u origin main
```

---

## Useful Claude Code prompts for this project

Once Claude Code is set up, you can ask it to:

```
Add a new test stage for "Instruction Following" that tests whether 
the model follows complex multi-part instructions

Deploy this to Vercel and give me the live URL

Write unit tests for the scoring functions

Add a feature to export test results as a PDF report

Create a GitHub Actions workflow that runs the test suite on a schedule
```

---

## Common issues

**"gh: command not found"**
→ Install GitHub CLI: https://cli.github.com

**"npm: command not found"**
→ Install Node.js: https://nodejs.org

**"API key not valid"**
→ Check `.env` — make sure `REACT_APP_ANTHROPIC_API_KEY` is set correctly

**"Repository already exists"**
→ Use a different name: `gh repo create ai-testing-suite-2 --public --source=. --push`

**CORS errors when running**
→ The Claude API requires the Anthropic API key. For production, set up a backend proxy.
