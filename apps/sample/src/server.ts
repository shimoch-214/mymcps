import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { getAlerts, getAlertsInput } from "./functions/get-alerts.js";
import { getForecast, getForecastInput } from "./functions/get-forecast.js";

const server = new McpServer({
  name: "weather",
  version: "1.0.0",
  capabilities: {
    resources: {},
    tools: {},
  },
});

server.tool(
  "get-alerts",
  "Get weather alerts for a state",
  getAlertsInput,
  getAlerts,
);

server.tool(
  "get-forecast",
  "Get weather forecast for a location",
  getForecastInput,
  getForecast,
);

export { server };
