import { indicesApi } from "./indices";
import { routesApi } from "./routes";
import { anomaliesApi } from "./anomalies";
import { forecastsApi } from "./forecasts";
import { faresApi } from "./fares";
import { sourcesApi } from "./sources";

/**
 * Unified API surface consumed by the UI.
 *
 * Today every namespace resolves against the mock services in src/lib/mock.
 * When NEXT_PUBLIC_API_BASE_URL is set, each call transparently switches to
 * the FastAPI REST endpoint documented in each module. The UI code never
 * changes.
 */
export const airisApi = {
  indices: indicesApi,
  routes: routesApi,
  anomalies: anomaliesApi,
  forecasts: forecastsApi,
  fares: faresApi,
  sources: sourcesApi,
};

export type AirisApi = typeof airisApi;
