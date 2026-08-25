import type {
  BookingWindowBucket,
  ComparableFare,
  FareComponent,
  FareTrendPoint,
  PricePressureEntry,
  RouteInsight,
} from "@/types";
import { apiConfig, mockLatency, request } from "./client";
import * as mock from "@/lib/mock/handlers";

/**
 * Route domain — route insights, fare structure and price pressure model.
 *
 * REST mapping (FastAPI):
 *   GET /api/v1/routes
 *   GET /api/v1/routes/:id
 *   GET /api/v1/routes/:id/fare-trend
 *   GET /api/v1/routes/pressure
 */
export const routesApi = {
  list(): Promise<RouteInsight[]> {
    if (apiConfig.mockMode) return mockLatency(mock.mockGetRoutes());
    return request<RouteInsight[]>("/api/v1/routes");
  },

  get(id: string): Promise<RouteInsight> {
    if (apiConfig.mockMode) {
      const found = mock.ROUTES.find((r) => r.id === id) ?? mock.ROUTES[0];
      return mockLatency(found);
    }
    return request<RouteInsight>(`/api/v1/routes/${encodeURIComponent(id)}`);
  },

  getFareTrend(routeId: string): Promise<FareTrendPoint[]> {
    if (apiConfig.mockMode) return mockLatency(mock.buildFareTrend(routeId));
    return request<FareTrendPoint[]>(`/api/v1/routes/${encodeURIComponent(routeId)}/fare-trend`);
  },

  getBookingWindow(routeId: string): Promise<BookingWindowBucket[]> {
    if (apiConfig.mockMode) return mockLatency(mock.BOOKING_WINDOW);
    return request<BookingWindowBucket[]>(`/api/v1/routes/${encodeURIComponent(routeId)}/booking-window`);
  },

  getFareComposition(routeId: string): Promise<FareComponent[]> {
    if (apiConfig.mockMode) return mockLatency(mock.FARE_COMPOSITION);
    return request<FareComponent[]>(`/api/v1/routes/${encodeURIComponent(routeId)}/fare-composition`);
  },

  getComparableFares(routeId: string): Promise<ComparableFare[]> {
    if (apiConfig.mockMode) return mockLatency(mock.COMPARABLE_FARES);
    return request<ComparableFare[]>(`/api/v1/routes/${encodeURIComponent(routeId)}/comparable-fares`);
  },

  getPricePressure(): Promise<PricePressureEntry[]> {
    if (apiConfig.mockMode) return mockLatency(mock.PRICE_PRESSURE);
    return request<PricePressureEntry[]>("/api/v1/routes/pressure");
  },
};
