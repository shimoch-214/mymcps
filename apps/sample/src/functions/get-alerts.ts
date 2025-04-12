import type { ToolCallback } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import {
  type AlertResponse,
  formatAlert,
  makeNWSRequest,
} from "../api/client.js";

export const getAlertsInput = {
  state: z.string().length(2).describe("Two-letter state code (e.g. CA, NY)"),
};

export const getAlerts: ToolCallback<typeof getAlertsInput> = async ({
  state,
}) => {
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

  const formatted = features.map((feature) => formatAlert(feature.properties));

  return {
    content: [
      {
        type: "text",
        text: `Active alerts for ${stateCode}:\n\n${formatted.join("\n")}`,
      },
    ],
  };
};
