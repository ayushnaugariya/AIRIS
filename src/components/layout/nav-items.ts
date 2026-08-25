import {
  Activity,
  BadgeCheck,
  Database,
  History,
  LayoutDashboard,
  LineChart,
  Map as MapIcon,
  Plane,
  PlugZap,
  Route,
  Settings,
  ShieldAlert,
  TrendingUp,
  type LucideIcon,
} from "lucide-react";

export interface NavItem {
  label: string;
  href: string;
  icon: LucideIcon;
}

export const MAIN_NAV: NavItem[] = [
  { label: "Overview", href: "/", icon: LayoutDashboard },
  { label: "Index Explorer", href: "/index-explorer", icon: LineChart },
  { label: "Route Intelligence", href: "/routes", icon: Route },
  { label: "India Map", href: "/map", icon: MapIcon },
  { label: "Airline Intelligence", href: "/airlines", icon: Plane },
  { label: "Anomaly Center", href: "/anomalies", icon: ShieldAlert },
  { label: "Forecasts", href: "/forecasts", icon: TrendingUp },
  { label: "Fare Quality", href: "/fare-quality", icon: BadgeCheck },
  { label: "Data Sources", href: "/data-sources", icon: Database },
];

export const SYSTEM_NAV: { id: string; label: string; icon: LucideIcon; hint?: string }[] = [
  { id: "system", label: "System Status", icon: Activity, hint: "Operational" },
  { id: "api", label: "API Status", icon: PlugZap, hint: "Mock mode" },
  { id: "update", label: "Last Data Update", icon: History },
  { id: "settings", label: "Settings", icon: Settings },
];

export const PAGE_TITLES: Record<string, { title: string; subtitle?: string }> = {
  "/": { title: "Airfare Intelligence Overview", subtitle: "India's near-real-time airfare market signal" },
  "/index-explorer": { title: "Index Explorer", subtitle: "Deep-dive into the national airfare index" },
  "/routes": { title: "Route Intelligence", subtitle: "Sector-level fare structure and pressure" },
  "/map": { title: "India Route Intelligence Map", subtitle: "Geospatial view of fare pressure and live flight traces" },
  "/airlines": { title: "Airline Intelligence", subtitle: "Carrier-level pricing and market signals" },
  "/anomalies": { title: "Anomaly Detection Center", subtitle: "Explainable deviations from expected price behaviour" },
  "/forecasts": { title: "Airfare Forecast", subtitle: "Probabilistic movement outlook for the national index" },
  "/fare-quality": { title: "Fare Quality Engine", subtitle: "Comparability scoring that keeps the index honest" },
  "/data-sources": { title: "Data Sources & Pipeline", subtitle: "Ingestion health across airline and OTA portals" },
};
