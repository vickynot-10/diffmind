# diffmind

**Semantic code diff analyzer powered by AST parsing and AI**

diffmind goes beyond line-by-line diffs. It parses your code into an Abstract Syntax Tree, extracts behavioral facts about every function, and uses AI to explain what actually changed — and what could break.

---

## Demo

Paste two versions of code (or load a GitHub PR) → click Analyze → get a semantic breakdown of every function change with severity levels and actionable fixes.

---

## What makes it different

Normal `git diff` tells you **what lines changed**.  
diffmind tells you **what your code means changed**.

| Normal diff | diffmind |
|---|---|
| `- function fetchUser` | `fetchUser: sync → async` |
| `+ async function fetchUser` | `complexity: 1 → 3` |
| line count changes | `addedCalls: [cache.get, cache.set]` |
| | `callers not using await will silently break` |

---

## Features

- **Monaco diff editor** — VS Code-powered split editor with syntax highlighting
- **8 languages** — JavaScript, TypeScript, Python, Go, Rust, Java, C++, Ruby
- **AST-based analysis** — uses tree-sitter (same tech as GitHub, Neovim, Zed) to parse code into syntax trees
- **Fact extraction** — detects async changes, cyclomatic complexity, side effects, call graph changes
- **Semantic diff** — compares behavioral facts, not just text
- **AI analysis** — structured diff sent to LLaMA 3.3 70B for plain-English explanations
- **Severity levels** — breaking / warning / info with risk assessment
- **Fix suggestions** — actionable code improvements with copy to clipboard
- **GitHub PR integration** — paste a PR URL, pick a file, load old and new versions automatically

---

## Tech stack

| Layer | Technology |
|---|---|
| Frontend | Next.js 15, React 19, Tailwind CSS v4 |
| Code editor | Monaco Editor (`@monaco-editor/react`) |
| AST parsing | `web-tree-sitter` (WebAssembly) |
| AI | Groq API — LLaMA 3.3 70B Versatile |
| GitHub integration | GitHub REST API |

---

## How it works

```
user pastes old + new code
        ↓
web-tree-sitter parses both into ASTs
        ↓
fact extractor walks every AST node (iterative stack, not recursive)
extracts: name, isAsync, paramCount, complexity, hasSideEffects, calls[]
        ↓
diffFacts() compares old vs new facts using O(1) Map lookups
        ↓
structured diff sent to Groq with raw code as context
        ↓
AI returns severity + summary + details + risk + fixes[]
        ↓
results rendered as cards with fix modal
```

---

## AST fact extraction

The core innovation — instead of sending raw code to AI, diffmind extracts structured facts first:

```json
{
  "name": "fetchUser",
  "isAsync": true,
  "paramCount": 1,
  "complexity": 3,
  "hasSideEffects": true,
  "calls": ["cache.get", "db.query", "cache.set", "logger.info"]
}
```

This reduces AI token usage by ~60% while improving analysis accuracy — the AI only needs to explain changes it's already been told about, not discover them.

---

## GitHub PR integration

1. Paste a PR URL: `https://github.com/org/repo/pull/123`
2. diffmind fetches the PR via GitHub API
3. For each changed file, fetches the base commit (before the PR) and head commit (the PR changes)
4. Loads both versions into the editor
5. Language auto-detected from file extension

Works with public repos. Private repos require a `GITHUB_TOKEN` in your environment.

---

## Getting started

```bash
git clone https://github.com/your-username/diffmind
cd diffmind
npm install
```

Copy the WASM grammar files:
```bash
cp node_modules/web-tree-sitter/tree-sitter.wasm public/wasm/
cp node_modules/tree-sitter-wasms/out/*.wasm public/wasm/
```

Create `.env.local`:
```
GROQ_API_KEY=your_groq_api_key
GITHUB_TOKEN=your_github_token   # optional, for private repos
```

Run:
```bash
npm run dev
```

---

## Environment variables

| Variable | Required | Description |
|---|---|---|
| `GROQ_API_KEY` | Yes | Groq API key (free at console.groq.com) |
| `GITHUB_TOKEN` | No | GitHub personal access token for private repos |

---

## Project structure

```
app/
  api/
    analyze/route.ts    # AST parsing + fact extraction + AI call
    github/route.ts     # GitHub PR file list
    github/file/route.ts # Fetch old + new file contents
  page.tsx
components/
  Home.tsx              # Main editor + analysis UI
  LanguageSelect.tsx    # Custom language dropdown
  FixModal.tsx          # Fix suggestions modal
  Snackbar.tsx          # Toast notifications
  Header.tsx
  Loader.tsx
public/
  wasm/                 # tree-sitter WASM grammar files
app.constants.ts        # Language node type maps for AST walking
```

---

## License

MIT