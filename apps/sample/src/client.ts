const NWS_API_BASE = "https://api.weather.gov";
const USER_AGENT = "weather-app/1.0";

type AlertFeature = {
  event?: string;
  areaDesc?: string;
  severity?: string;
  status?: string;
  headline?: string;
};

export type AlertResponse = {
  features: {
    properties: AlertFeature;
  }[];
};

type ForecastPeriod = {
  name?: string;
  temperature?: number;
  temperatureUnit?: string;
  windSpeed?: string;
  windDirection?: string;
  shortForecast?: string;
};

export type ForecastResponse = {
  properties: {
    periods: ForecastPeriod[];
  };
};

export type PointsResponse = {
  properties: {
    forecast?: string;
  };
};

export const makeNWSRequest = async <T>(uri: string): Promise<T | null> => {
  const headers = {
    "User-Agent": USER_AGENT,
    Accept: "application/geo+json",
  };

  try {
    const res = await fetch(`${NWS_API_BASE}${uri}`, { headers });
    if (!res.ok) {
      throw new Error(`HTTP error! status: ${res.status}`);
    }
    return (await res.json()) as T;
  } catch (err) {
    console.error("Error fetching data from NWS API:", err);
    return null;
  }
};

export const formatAlert = (feature: AlertFeature): string => {
  return [
    `Event: ${feature.event || "Unknown"}`,
    `Area: ${feature.areaDesc || "Unknown"}`,
    `Severity: ${feature.severity || "Unknown"}`,
    `Status: ${feature.status || "Unknown"}`,
    `Headline: ${feature.headline || "No headline"}`,
    "---",
  ].join("\n");
};

export const formatForecast = (period: ForecastPeriod): string => {
  return [
    `${period.name || "Unknown"}:`,
    `Temperature: ${period.temperature || "Unknown"}°${period.temperatureUnit || "F"}`,
    `Wind: ${period.windSpeed || "Unknown"} ${period.windDirection || ""}`,
    `${period.shortForecast || "No forecast available"}`,
    "---",
  ].join("\n");
};
