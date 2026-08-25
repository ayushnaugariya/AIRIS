import type { FareObservation, FareQualityScore } from "@/types";
import { apiConfig, mockLatency, request } from "./client";
import * as mock from "@/lib/mock/handlers";

/**
 * Fare quality domain — comparability scoring and normalized observations.
 *
 * REST mapping (FastAPI):
 *   GET /api/v1/fares/quality?route=DEL-BOM
 *   GET /api/v1/fares/observations?route=DEL-BOM&window=11d
 */
export const faresApi = {
  getQualityScore(routeId: string): Promise<FareQualityScore> {
    if (apiConfig.mockMode) return mockLatency(mock.buildFareQuality(routeId));
    return request<FareQualityScore>(`/api/v1/fares/quality?route=${encodeURIComponent(routeId)}`);
  },

  getObservations(routeId: string): Promise<FareObservation[]> {
    if (apiConfig.mockMode) return mockLatency(mock.buildFareObservations(routeId));
    return request<FareObservation[]>(`/api/v1/fares/observations?route=${encodeURIComponent(routeId)}`);
  },
};
