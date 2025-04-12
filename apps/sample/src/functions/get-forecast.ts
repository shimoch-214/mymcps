import type { ToolCallback } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import {
  type ForecastResponse,
  type PointsResponse,
  formatForecast,
  makeNWSRequest,
} from "../api/client.js";

export const getForecastInput = {
  latitude: z.number().min(-90).max(90).describe("Latitude of the location"),
  longitude: z
    .number()
    .min(-180)
    .max(180)
    .describe("Longitude of the location"),
};

export const getForecast: ToolCallback<typeof getForecastInput> = async ({
  latitude,
  longitude,
}) => {
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
};
