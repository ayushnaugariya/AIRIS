import type { PipelineStage, SourceCategoryStats, SystemStatus } from "@/types";
import { apiConfig, mockLatency, request } from "./client";
import * as mock from "@/lib/mock/handlers";
import type { DataSourceRecord } from "@/lib/mock/handlers";

/**
 * Data source & system health domain.
 *
 * REST mapping (FastAPI):
 *   GET /api/v1/sources
 *   GET /api/v1/sources/stats
 *   GET /api/v1/pipeline
 *   GET /api/v1/system/status
 */
export const sourcesApi = {
  list(): Promise<DataSourceRecord[]> {
    if (apiConfig.mockMode) return mockLatency(mock.DATA_SOURCES);
    return request<DataSourceRecord[]>("/api/v1/sources");
  },

  getCategoryStats(category: "airline" | "ota"): Promise<SourceCategoryStats> {
    if (apiConfig.mockMode) return mockLatency(mock.sourceCategoryStats(category));
    return request<SourceCategoryStats>(`/api/v1/sources/stats?category=${category}`);
  },

  getPipeline(): Promise<PipelineStage[]> {
    if (apiConfig.mockMode) return mockLatency(mock.PIPELINE_STAGES);
    return request<PipelineStage[]>("/api/v1/pipeline");
  },

  getSystemStatus(): Promise<SystemStatus> {
    if (apiConfig.mockMode) return mockLatency(mock.SYSTEM_STATUS, 120);
    return request<SystemStatus>("/api/v1/system/status");
  },
};
