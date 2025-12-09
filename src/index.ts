#!/usr/bin/env node

import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
} from "@modelcontextprotocol/sdk/types.js";

import { WordstatClient } from "./api/wordstatClient.js";
import {
  topRequestsDefinition,
  handleTopRequests,
  type TopRequestsInput,
} from "./tools/topRequests.js";
import {
  dynamicsDefinition,
  handleDynamics,
  type DynamicsInput,
} from "./tools/dynamics.js";
import {
  regionsDefinition,
  handleRegions,
  type RegionsInput,
} from "./tools/regions.js";
import { regionsTreeDefinition, handleRegionsTree } from "./tools/regionsTree.js";
import { userInfoDefinition, handleUserInfo } from "./tools/userInfo.js";

// Get API token from environment
const API_TOKEN = process.env.WORDSTAT_API_TOKEN;

if (!API_TOKEN) {
  console.error("Error: WORDSTAT_API_TOKEN environment variable is required");
  process.exit(1);
}

// Initialize Wordstat client
const wordstatClient = new WordstatClient(API_TOKEN);

// Initialize MCP server
const server = new Server(
  {
    name: "wordstat-mcp",
    version: "1.0.0",
  },
  {
    capabilities: {
      tools: {},
    },
  }
);

// List available tools
server.setRequestHandler(ListToolsRequestSchema, async () => {
  return {
    tools: [
      topRequestsDefinition,
      dynamicsDefinition,
      regionsDefinition,
      regionsTreeDefinition,
      userInfoDefinition,
    ],
  };
});

// Handle tool calls
server.setRequestHandler(CallToolRequestSchema, async (request) => {
  const { name, arguments: args } = request.params;

  try {
    let result: string;

    switch (name) {
      case "wordstat_top_requests":
        result = await handleTopRequests(
          wordstatClient,
          args as unknown as TopRequestsInput
        );
        break;

      case "wordstat_dynamics":
        result = await handleDynamics(
          wordstatClient,
          args as unknown as DynamicsInput
        );
        break;

      case "wordstat_regions":
        result = await handleRegions(
          wordstatClient,
          args as unknown as RegionsInput
        );
        break;

      case "wordstat_regions_tree":
        result = await handleRegionsTree(wordstatClient);
        break;

      case "wordstat_user_info":
        result = await handleUserInfo(wordstatClient);
        break;

      default:
        throw new Error(`Unknown tool: ${name}`);
    }

    return {
      content: [
        {
          type: "text",
          text: result,
        },
      ],
    };
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    return {
      content: [
        {
          type: "text",
          text: `Error: ${errorMessage}`,
        },
      ],
      isError: true,
    };
  }
});

// Start the server
async function main() {
  const transport = new StdioServerTransport();
  await server.connect(transport);
  console.error("Wordstat MCP server started");
}

main().catch((error) => {
  console.error("Fatal error:", error);
  process.exit(1);
});
