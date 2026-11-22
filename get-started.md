# Getting Started

Setup notes for the [LangChain Essentials (TypeScript) quickstart](https://academy.langchain.com/courses/take/quickstart-langchain-essentials-typescript/texts/69556573-getting-set-up).

The course notebooks run TypeScript in Jupyter, which needs two things:

- **Deno**: provides the TypeScript Jupyter kernel
- **JupyterLab**: the browser UI that runs the notebooks

## 1. Install Deno

Install Deno globally with mise:

```sh
mise use -g deno@latest
```

## 2. Register the Deno Jupyter kernel

Install the kernel globally so Jupyter can find it from any directory:

```sh
deno jupyter --install
```

> In Deno 2.x the old `--unstable` flag has been removed, so you don't need it. To check that the kernel is installed, run `deno jupyter` with no flags.

## 3. Launch JupyterLab

JupyterLab is a Python app. Run it with `uvx` so nothing gets installed into a project:

```sh
uvx --from jupyterlab jupyter lab
# or, same thing via the mise task:
mise run lab
```

This opens JupyterLab in the browser. Choose the **Deno** kernel when you create or open a notebook.

## 4. Install dependencies with Bun

The course uses pnpm, but this checkout has been switched to Bun. The pnpm settings in `package.json` were moved over:

- `pnpm.onlyBuiltDependencies` → `trustedDependencies`
- `pnpm.overrides` → `overrides`

`pnpm-lock.yaml` and `pnpm-workspace.yaml` were replaced by `bun.lock`.

```sh
bun install
cp example.env .env   # then add your API keys
```

The notebooks still run on Deno, because Bun has no Jupyter kernel. Deno reads the `node_modules` that Bun installs. Bun can run the standalone scripts:

```sh
bun sql_agent2.ts
bun run dev          # LangSmith Studio (langgraphjs dev)
```

L5 starts its MCP server with `npx`. That works because Node is installed through mise. To use Bun there instead, change `npx` to `bunx` in the notebook.

> This checkout keeps only the TypeScript course, moved from `js/` to the repo root. The upstream `python/` and `python_local/` folders were removed.
