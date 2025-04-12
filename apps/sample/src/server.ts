import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import {
  type AlertResponse,
  type ForecastResponse,
  type PointsResponse,
  formatAlert,
  formatForecast,
  makeNWSRequest,
} from "./client.js";

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
  {
    state: z.string().length(2).describe("Two-letter state code (e.g. CA, NY)"),
  },
  async ({ state }) => {
    const stateCode = state.toUpperCase();
    const uri = `/alerts?area=${stateCode}`;
    const res = await makeNWSRequest<AlertResponse>(uri);

    if (!res) {
      return {
        content: [
          {
            type: "text",
            text: "Failed to retrieve alerts.",
          },
        ],
      };
    }

    const features = res.features;
    if (features.length === 0) {
      return {
        content: [
          {
            type: "text",
            text: `No weather alerts for ${stateCode}.`,
          },
        ],
      };
    }

    const formatted = features.map((feature) =>
      formatAlert(feature.properties),
    );

    return {
      content: [
        {
          type: "text",
          text: `Active alerts for ${stateCode}:\n\n${formatted.join("\n")}`,
        },
      ],
    };
  },
);

server.tool(
  "get-forecast",
  "Get weather forecast for a location",
  {
    latitude: z.number().min(-90).max(90).describe("Latitude of the location"),
    longitude: z
      .number()
      .min(-180)
      .max(180)
      .describe("Longitude of the location"),
  },
  async ({ latitude, longitude }) => {
    const pointsUri = `/points/${latitude.toFixed(4)},${longitude.toFixed(4)}`;
    const pointsRes = await makeNWSRequest<PointsResponse>(pointsUri);

    if (!pointsRes) {
      return {
        content: [
          {
            type: "text",
            text: `Failed to retrieve grid point data for coordinates: ${latitude}, ${longitude}. This location may not be supported by the NWS API (only US locations are supported).`,
          },
        ],
      };
    }

    const forecastUri = pointsRes.properties.forecast;
    if (!forecastUri) {
      return {
        content: [
          {
            type: "text",
            text: "Failed to get forecast URL from grid point data",
          },
        ],
      };
    }

    const forecastRes = await makeNWSRequest<ForecastResponse>(forecastUri);
    if (!forecastRes) {
      return {
        content: [
          {
            type: "text",
            text: "Failed to retrieve forecast data",
          },
        ],
      };
    }

    const periods = forecastRes.properties.periods;
    if (periods.length === 0) {
      return {
        content: [
          {
            type: "text",
            text: "No forecast data available",
          },
        ],
      };
    }

    const formatted = periods.map((period) => formatForecast(period));
    return {
      content: [
        {
          type: "text",
          text: `Forecast for ${latitude}, ${longitude}:\n\n${formatted.join("\n")}`,
        },
      ],
    };
  },
);

export { server };
