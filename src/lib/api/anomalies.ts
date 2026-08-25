import type { Anomaly, AnomalyStats } from "@/types";
import { apiConfig, mockLatency, request } from "./client";
import * as mock from "@/lib/mock/handlers";

/**
 * Anomaly domain — detection stream and explanations.
 *
 * REST mapping (FastAPI):
 *   GET /api/v1/anomalies?severity=critical&limit=50
 *   GET /api/v1/anomalies/stats
 *   PATCH /api/v1/anomalies/:id/status
 */
export const anomaliesApi = {
  list(): Promise<Anomaly[]> {
    if (apiConfig.mockMode) return mockLatency(mock.mockGetAnomalies());
    return request<Anomaly[]>("/api/v1/anomalies");
  },

  getStats(): Promise<AnomalyStats> {
    if (apiConfig.mockMode) return mockLatency(mock.mockGetAnomalyStats());
    return request<AnomalyStats>("/api/v1/anomalies/stats");
  },

  async updateStatus(_id: string, _status: Anomaly["status"]): Promise<{ ok: true }> {
    if (apiConfig.mockMode) return mockLatency({ ok: true as const }, 180);
    return request<{ ok: true }>(`/api/v1/anomalies/${encodeURIComponent(_id)}/status`, {
      method: "PATCH",
      body: { status: _status },
    });
  },
};
