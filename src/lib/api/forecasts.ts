import type { ConfidenceDistribution, ForecastHorizon, ForecastSummary, RouteForecast } from "@/types";
import { apiConfig, mockLatency, request } from "./client";
import * as mock from "@/lib/mock/handlers";

/**
 * Forecast domain — horizon summaries, per-route forecasts and confidence.
 *
 * REST mapping (FastAPI):
 *   GET /api/v1/forecasts/summary?horizon=7
 *   GET /api/v1/forecasts/routes?horizon=7
 *   GET /api/v1/forecasts/confidence
 */
export const forecastsApi = {
  getSummary(horizon: ForecastHorizon): Promise<ForecastSummary> {
    if (apiConfig.mockMode) return mockLatency(mock.mockGetForecastSummary(horizon));
    return request<ForecastSummary>(`/api/v1/forecasts/summary?horizon=${horizon}`);
  },

  getRouteForecasts(): Promise<RouteForecast[]> {
    if (apiConfig.mockMode) return mockLatency(mock.mockGetRouteForecasts());
    return request<RouteForecast[]>("/api/v1/forecasts/routes");
  },

  getConfidenceDistribution(): Promise<ConfidenceDistribution[]> {
    if (apiConfig.mockMode) return mockLatency(mock.CONFIDENCE_DISTRIBUTION);
    return request<ConfidenceDistribution[]>("/api/v1/forecasts/confidence");
  },
};
