import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import {
  CallToolRequestSchema,
  ListToolsRequestSchema
} from "@modelcontextprotocol/sdk/types.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const mocksDir = path.resolve(__dirname, "..", "mocks", "mcp");

async function loadTools() {
  try {
    const toolsDir = path.join(mocksDir, "tools");
    const entries = await fs.readdir(toolsDir, { withFileTypes: true });
    const tools = [];

    for (const entry of entries) {
      if (!entry.isFile() || !entry.name.endsWith(".json")) {
        continue;
      }
      const raw = await fs.readFile(path.join(toolsDir, entry.name), "utf8");
      const tool = JSON.parse(raw);
      tools.push(tool);
    }

    return tools;
  } catch (error) {
    return [];
  }
}

async function loadToolResponse(name) {
  const responsePath = path.join(mocksDir, "responses", `${name}.json`);
  const raw = await fs.readFile(responsePath, "utf8");
  return JSON.parse(raw);
}

const server = new Server(
  {
    name: "hippie-mcp",
    version: "3.0.0"
  },
  {
    capabilities: {
      tools: {}
    }
  }
);

server.setRequestHandler(ListToolsRequestSchema, async () => {
  const tools = await loadTools();
  return { tools };
});

server.setRequestHandler(CallToolRequestSchema, async (request) => {
  const name = request.params.name;

  try {
    const response = await loadToolResponse(name);
    return {
      content: response.content || response
    };
  } catch (error) {
    return {
      content: [
        {
          type: "text",
          text: `No mock response found for tool: ${name}`
        }
      ]
    };
  }
});

const transport = new StdioServerTransport();
await server.connect(transport);
