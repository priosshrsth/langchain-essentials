// Weather agent from L3_streaming, exported so `bun run dev` (LangSmith Studio) can serve it.
import "dotenv/config";
import { createAgent, tool, type Runtime } from "langchain";
import { z } from "zod";

const getWeather = tool(
  ({ city }, runtime: Runtime) => {
    // Custom stream events: visible in Studio when streaming with the "custom" mode.
    runtime.writer?.(`Looking up data for city: ${city}`);
    runtime.writer?.(`Acquired data for city: ${city}`);
    return `It's always sunny in ${city}`;
  },
  {
    name: "get_weather",
    description: "Get weather for a given city.",
    schema: z.object({ city: z.string() }),
  },
);

const agent = createAgent({
  model: "ollama:qwen3.5:9b",
  tools: [getWeather],
  systemPrompt: "You are a helpful weather assistant. Use get_weather to answer weather questions.",
});

export default agent;
