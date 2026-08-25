import type { AirlineIndex, IndexSummary, MarketCorrelationStat, RegionIndex, SeriesResponse } from "@/types";
import { apiConfig, mockLatency, request } from "./client";
import * as mock from "@/lib/mock/handlers";

/**
 * Index domain — national index summary, series, regional & airline breakdowns.
 *
 * REST mapping (FastAPI):
 *   GET /api/v1/index/summary
 *   GET /api/v1/index/series?range=90d&region=north
 *   GET /api/v1/index/regional
 *   GET /api/v1/index/airlines
 */
export const indicesApi = {
  getSummary(): Promise<IndexSummary> {
    if (apiConfig.mockMode) return mockLatency(mock.mockGetIndexSummary());
    return request<IndexSummary>("/api/v1/index/summary");
  },

  getSeries(seed = "national", target?: number): Promise<SeriesResponse> {
    if (apiConfig.mockMode) return mockLatency(mock.mockGetSeries(seed, target));
    return request<SeriesResponse>("/api/v1/index/series?range=90d");
  },

  getRegional(): Promise<RegionIndex[]> {
    if (apiConfig.mockMode) return mockLatency(mock.mockGetRegionalIndices());
    return request<RegionIndex[]>("/api/v1/index/regional");
  },

  getAirlines(): Promise<AirlineIndex[]> {
    if (apiConfig.mockMode) return mockLatency(mock.mockGetAirlineIndices());
    return request<AirlineIndex[]>("/api/v1/index/airlines");
  },

  getMarketStats(): Promise<MarketCorrelationStat[]> {
    if (apiConfig.mockMode) return mockLatency(mock.mockGetMarketStats());
    return request<MarketCorrelationStat[]>("/api/v1/index/market-stats");
  },
};
