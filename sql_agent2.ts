// Sql agent
import "dotenv/config";
import { createAgent, tool } from "langchain";
import { ChatOllama } from "@langchain/ollama";
import { SQL } from "bun";
import { MemorySaver } from "@langchain/langgraph";
import { z } from "zod";

/**
 * Model
 * - Local Ollama (http://localhost:11434), no API key needed
 */
const llm = new ChatOllama({ model: "qwen3.5:9b" });

/**
 * Database
 * - Bun's built-in SQL client with the SQLite adapter (Bun runtime only)
 * - Opened read-write; the system prompt keeps the agent to SELECTs
 */
const db = new SQL({
  adapter: "sqlite",
  filename: `${import.meta.dir}/Chinook.db`,
});

/**
 * Schema (included in the prompt to ground the model)
 * - CREATE TABLE statements + 3 sample rows per table
 */
async function getTableInfo(sampleRows = 3): Promise<string> {
  const tables = await db<{ name: string; sql: string }[]>`
    SELECT name, sql FROM sqlite_master
    WHERE type = 'table' AND name NOT LIKE 'sqlite_%'
    ORDER BY name`;
  const parts: string[] = [];
  for (const { name, sql } of tables) {
    const rows = await db.unsafe(`SELECT * FROM "${name}" LIMIT ${sampleRows}`);
    const cols = rows.length ? Object.keys(rows[0]) : [];
    const sample = rows
      .map((r: Record<string, unknown>) =>
        cols.map((c) => String(r[c])).join(" "),
      )
      .join("\n");
    parts.push(
      `${sql};\n/*\n${sampleRows} rows from ${name} table:\n${cols.join(" ")}\n${sample}\n*/`,
    );
  }
  return parts.join("\n\n");
}

const SCHEMA = await getTableInfo();

/**
 * Tool (function-first signature; matches LangChain umbrella API)
 * - No runtime context required; closes over `db`
 */
export const execute_sql = tool(
  async ({ query }: { query: string }) => {
    try {
      const rows = await db.unsafe(query);
      return JSON.stringify([...rows]);
    } catch (e: any) {
      return `Error: ${e?.message ?? String(e)}`;
    }
  },
  {
    name: "execute_sql",
    description: "Execute a READ-ONLY SQLite SELECT query and return results.",
    schema: z.object({ query: z.string() }),
  },
);

/**
 * System prompt (includes schema + rules)
 */
const SYSTEM_PROMPT = `
You are a careful SQLite analyst.

Database schema (use these exact table and column names):
${SCHEMA}

Rules:
- Only use tables and columns that appear in the schema above.
- Think step-by-step.
- When you need data, call the tool \`execute_sql\` with ONE SELECT query.
- Read-only only; no INSERT/UPDATE/DELETE/ALTER/DROP/CREATE/REPLACE/TRUNCATE.
- Limit to 5 rows unless user explicitly asks otherwise.
- If the tool returns 'Error:', revise the SQL and try again.
- You should have up to date knowledge of you db schema before generating queries.
- Limit the number of attempts to 5.
- Prefer explicit column lists; avoid SELECT *.
`;

/**
 * Checkpointer (enables Studio thread history)
 * - Studio supplies thread_id automatically
 */
const checkpointer = new MemorySaver();

/**
 * Agent (default export for langgraph.json "<file>:default")
 */
const agent = createAgent({
  model: llm,
  tools: [execute_sql],
  systemPrompt: SYSTEM_PROMPT,
  checkpointer,
});

export default agent;
