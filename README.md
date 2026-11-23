# 🔗 LangChain Essentials - TypeScript

My notes and checkout for the [LangChain Essentials (TypeScript) quickstart](https://academy.langchain.com/courses/take/quickstart-langchain-essentials-typescript/texts/69556573-getting-set-up). Only the TypeScript course is kept here, moved from `js/` to the repo root, and pnpm has been swapped for Bun.

## 🚀 Setup

The notebooks run TypeScript in Jupyter, which needs two things:

- **Deno**: provides the TypeScript Jupyter kernel
- **JupyterLab**: the browser UI that runs the notebooks

All tools come from mise (`mise.toml` pins deno, bun, node and uv).

### 1. Install the tools

```sh
mise install
```

### 2. Register the Deno Jupyter kernel

Do this once per machine. It installs the kernel globally, so Jupyter finds it from any directory:

```sh
deno jupyter --install
```

> In Deno 2.x the old `--unstable` flag has been removed, so you don't need it. To check that the kernel is installed, run `deno jupyter` with no flags.

### 3. Install dependencies

```sh
bun install
```

The course uses pnpm. Its `package.json` settings were moved over to Bun: `pnpm.onlyBuiltDependencies` became `trustedDependencies`, and `pnpm.overrides` became `overrides`. You don't need Corepack, which Node 25+ no longer ships.

Deno reads the `node_modules` that Bun installs, so the notebooks still run on Deno. Bun has no Jupyter kernel.

### 4. Start Ollama

All lessons and `sql_agent2.ts` run locally on Ollama with `qwen3.5:9b`, so you don't need an Anthropic or OpenAI key:

```sh
ollama pull qwen3.5:9b   # once
ollama serve           # or: systemctl start ollama
```

By default `@langchain/ollama` connects to `http://127.0.0.1:11434`. To go through portless instead, set `OLLAMA_BASE_URL=https://ollama.localhost` in `.env`. The Deno kernel then needs `DENO_TLS_CA_STORE=system` to trust portless's local CA. `mise.toml` sets that, so start Jupyter with `mise run lab`.

The notebooks use `model: "ollama:qwen3.5:9b"`. To try another model, change that string, for example to `"anthropic:claude-sonnet-4-6"` (needs `ANTHROPIC_API_KEY`) or `"openai:gpt-5-mini"` (needs `OPENAI_API_KEY`). A 9B model makes more mistakes with tools and SQL than the hosted models the course was written for.

### 5. Optional: `.env`

You only need this for LangSmith tracing or hosted models:

```sh
cp example.env .env
```

```env
# Optional: LangSmith tracing
LANGSMITH_API_KEY=...
LANGSMITH_TRACING=false
LANGSMITH_AGENT_ID=lc-essentials
LANGSMITH_AGENT_ENVIRONMENT=local
# EU instance: LANGSMITH_ENDPOINT=https://eu.api.smith.langchain.com
```

To turn on tracing, create an agent in LangSmith, put its ID in `LANGSMITH_AGENT_ID` and set `LANGSMITH_TRACING=true`. Then restart the kernel.

## ▶️ Running

### JupyterLab

```sh
mise run lab        # = uvx --from jupyterlab jupyter lab
```

`uvx` runs JupyterLab without installing anything into the project, so you don't need a `.venv` or pip. Open a notebook and choose the **Deno** kernel at the top right.

### Scripts and LangSmith Studio

```sh
bun sql_agent2.ts
bun run dev         # LangSmith Studio (langgraphjs dev)
```

Studio only shows the agents registered in `langgraph.json`: `sql_agent` (`sql_agent2.ts`) and `weather` (the L3 weather agent, `weather_agent.ts`). Choose between them in the graph dropdown. Agents defined in notebooks exist only in the kernel, so they can't be opened in Studio. You can still see their traces in LangSmith. To add one, export it from a `.ts` file and add it to `langgraph.json`.

The `dev` script sets `NODE_USE_SYSTEM_CA=1` so the Node-based server trusts the portless certificate on `https://ollama.localhost`.

See the [Studio docs](https://docs.langchain.com/oss/python/langchain/studio) for more.

L5 starts its MCP server with `npx`, which works because mise provides Node. To use Bun there instead, change `npx` to `bunx` in the notebook.

### Zed (optional)

Zed's REPL can use the Deno kernel, but only in plain `.ts` files. It can't run `.ipynb` notebooks. In a `.ts` file, split the code into cells with `// %%`, run `repl: refresh kernelspecs` once, then run `repl: run` on a cell. To make Deno the default kernel, add this to Zed's `settings.json`:

```json
"jupyter": { "kernel_selections": { "typescript": "deno", "javascript": "deno" } }
```

## 📚 Lessons

> **Before you start:** read [`SCHEMA.md`](SCHEMA.md) for the `Chinook.db` tables and relationships (with an ER diagram). The SQL agent in L1 and L6 queries this database.

- **L1_fast_agent**: build an SQL agent with `createAgent` in a few lines, and explore it in LangSmith Studio.

**Building blocks (L2–L7)**

- **L2_messages**: how messages carry information between the agent's components.
- **L3_streaming**: streaming, to reduce perceived latency.
- **L4_tools**: custom and prebuilt tools.
- **L5_tools_with_mcp**: MCP tools via the LangChain MCP adapter.
- **L6_memory**: keeping state between invocations.
- **L7_structuredOutput**: structured output.

**Customizing with middleware (L8–L9)**

- **L8_dynamic**: changing the system prompt on the fly.
- **L9_HITL**: human-in-the-loop with interrupts.
