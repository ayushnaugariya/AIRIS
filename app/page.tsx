"use client";

import React, { useState, useEffect } from "react";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, Legend, ResponsiveContainer
} from "recharts";
import {
  TrendingUp, Gauge, Loader2, Sparkles, FileCheck2, Search, Download, ShieldCheck, 
  AlertOctagon, AlertTriangle, Activity
} from "lucide-react";

// ---- Design Tokens ----
const bgMain = "#F8FAFC"; 
const borderDefault = "#CBD5E1"; 
const textMain = "#0F172A"; 
const subtleBg = "#F1F5F9"; 

const sans = "'Inter', Arial, sans-serif";

const ROUTE_DATA = [
  { source: "Cheapflights", raw: 4400, normalized: 5350, adjustments: [{ label: "Metasearch unbundled fare", delta: 700 }, { label: "OTA redirect fee omitted", delta: 250 }] },
  { source: "MakeMyTrip", raw: 4500, normalized: 5350, adjustments: [{ label: "Checked baggage excluded", delta: 650 }, { label: "Convenience fee excluded", delta: 200 }] },
  { source: "Cleartrip", raw: 4600, normalized: 5350, adjustments: [{ label: "Checked baggage excluded", delta: 600 }, { label: "Convenience fee excluded", delta: 150 }] },
  { source: "Indigo (Official)", raw: 5200, normalized: 5200, adjustments: [{ label: "Baggage and fees included", delta: 0 }] },
  { source: "Air India (API)", raw: 5350, normalized: 5350, adjustments: [{ label: "Full service carrier standard", delta: 0 }] }
];

export default function Page() {
  const [status, setStatus] = useState("idle"); 
  const [revealed, setRevealed] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [alertState, setAlertState] = useState("critical"); 

  useEffect(() => {
    if (status === "done") {
      const t = setTimeout(() => setRevealed(true), 50);
      return () => clearTimeout(t);
    }
    setRevealed(false);
  }, [status]);

  const runEngine = () => {
    setStatus("running");
    setTimeout(() => setStatus("done"), 1100);
  };

  const downloadCSV = () => {
    const csvContent = "data:text/csv;charset=utf-8," 
      + "Source,RawPrice,NormalizedPrice,AdjustmentNote\n"
      + ROUTE_DATA.map(d => `${d.source},${d.raw},${d.normalized},"${d.adjustments.map(a => a.label).join(';')}"`).join("\n");
    
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `AIRIS_CPI_Telemetry_Report_${new Date().toISOString().slice(0,10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="min-h-screen flex flex-col" style={{ background: bgMain, fontFamily: sans, color: textMain }}>
      <style>{`@import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap');`}</style>

      {/* GOVERNMENT TOP STRIPE */}
      <div className="h-1.5 w-full flex">
        <div className="bg-[#FF9933] flex-1"></div>
        <div className="bg-[#FFFFFF] flex-1"></div>
        <div className="bg-[#138808] flex-1"></div>
      </div>

      {/* OFFICIAL GOV TOP UTILITY BAR */}
      <div className="bg-[#0B132B] text-slate-300 text-xs py-1.5 px-6 border-b border-slate-800">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <div className="flex items-center gap-4 font-semibold tracking-wide">
            <span>GOVERNMENT OF INDIA</span>
            <span className="text-slate-600">|</span>
            <span>MINISTRY OF CIVIL AVIATION &amp; STATISTICS</span>
          </div>
          <div className="flex items-center gap-4 font-semibold tracking-wide">
            <span>PORTAL ID: SIH-2026-NIC</span>
            <span className="text-emerald-400 flex items-center gap-1">● SYSTEM SECURE</span>
          </div>
        </div>
      </div>

      {/* HEADER */}
      <header className="bg-white border-b border-slate-300 shadow-sm sticky top-0 z-20">
        <div className="max-w-7xl mx-auto px-6 py-5 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-slate-900 text-white rounded flex items-center justify-center font-bold text-lg shadow-inner">
              🇮🇳
            </div>
            <div>
              <div className="flex items-baseline gap-2">
                <h1 className="text-3xl font-extrabold tracking-tight text-[#0F172A]">AIRIS</h1>
                <span className="text-xs font-bold px-2 py-0.5 bg-blue-100 text-blue-900 rounded uppercase tracking-wider">
                  National Index
                </span>
              </div>
              <p className="text-xs text-slate-600 font-semibold uppercase tracking-wider mt-0.5">
                Automated Airfare Inflation &amp; Price Intelligence System
              </p>
            </div>
          </div>

          <div className="flex-1 max-w-xl mx-4 relative hidden lg:block">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search size={16} className="text-slate-500" />
            </div>
            <input 
              type="text" 
              placeholder="Query National Database: e.g., 'DEL-BOM anomaly correlation'" 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-24 py-2 rounded border focus:ring-2 focus:ring-blue-700 focus:outline-none transition-all text-sm font-medium"
              style={{ borderColor: borderDefault, background: subtleBg, color: textMain }}
            />
            <button className="absolute inset-y-0 right-0 px-4 rounded-r font-bold text-sm text-white bg-blue-900 hover:bg-blue-800">
              Query
            </button>
          </div>

          <div className="flex items-center gap-3">
            <button 
              onClick={downloadCSV}
              className="flex items-center gap-2 bg-blue-900 hover:bg-blue-800 text-white px-4 py-2 rounded text-xs font-bold shadow-sm transition-colors"
            >
              <Download size={15} /> Export Official CSV
            </button>
            <div className="hidden xl:flex items-center gap-2 text-xs font-bold px-3 py-1.5 bg-emerald-50 text-emerald-800 border border-emerald-200 rounded">
              <ShieldCheck size={16} />
              <span>NIC Gateway: 99.99%</span>
            </div>
          </div>
        </div>
      </header>

      {/* MAIN CONTENT */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-6 py-8 space-y-6">
        
        {/* Top Indicators Bar */}
        <section className="grid grid-cols-1 lg:grid-cols-5 gap-6">
          
          {/* Index Certificate Box */}
          <div className="lg:col-span-2 rounded-lg p-6 shadow-sm border border-slate-300 bg-white flex flex-col justify-between">
            <div className="flex justify-between items-start mb-4 border-b border-slate-200 pb-3">
              <div>
                <span className="text-[10px] font-extrabold uppercase tracking-widest text-blue-800 bg-blue-50 px-2 py-0.5 rounded">Official Metric</span>
                <h3 className="text-base font-bold text-slate-900 mt-1">National Airfare Index (NAI)</h3>
              </div>
              <select className="px-2.5 py-1 rounded text-xs font-bold border border-slate-300 bg-slate-50 text-slate-900 outline-none cursor-pointer">
                <option>All India (National)</option>
                <option>Northern Sector</option>
                <option>Southern Sector</option>
              </select>
            </div>
            
            <div className="py-2">
              <div className="flex items-baseline gap-4">
                <p className="text-6xl font-black text-slate-900 tracking-tight">108.9</p>
                <div className="text-emerald-700 font-bold text-sm bg-emerald-50 px-2 py-1 rounded border border-emerald-200 h-max flex items-center gap-1">
                  <TrendingUp size={16} /> +2.4% vs Base
                </div>
              </div>
              <p className="text-xs text-slate-600 mt-3 font-medium">Weighted index measuring consumer flight price fluctuation against official CPI baselines.</p>
            </div>

            <div className="pt-4 mt-4 border-t border-slate-200 flex justify-between items-center text-xs font-semibold text-slate-600">
              <span>BASE PERIOD: JAN 2026 = 100.0</span>
              <span>FREQ: DAILY 06:00 IST</span>
            </div>
          </div>

          {/* Dynamic Warning Telemetry Box */}
          <div className={`lg:col-span-3 rounded-lg p-6 shadow-sm border transition-all ${
            alertState === 'critical' ? 'bg-red-50 border-red-300' : 
            alertState === 'warning' ? 'bg-amber-50 border-amber-300' : 'bg-blue-50 border-blue-300'
          }`}>
            <div className="flex justify-between items-start mb-3">
              <div className={`flex items-center gap-2 font-extrabold ${
                alertState === 'critical' ? 'text-red-800' : alertState === 'warning' ? 'text-amber-800' : 'text-blue-800'
              }`}>
                {alertState === 'critical' && <AlertOctagon size={20} className="animate-bounce" />}
                {alertState === 'warning' && <AlertTriangle size={20} className="animate-pulse" />}
                {alertState === 'monitoring' && <Activity size={20} className="animate-spin" />}
                
                <span className="text-xs uppercase tracking-widest">
                  {alertState === 'critical' && 'Surge Telemetry: Critical Price Spike'}
                  {alertState === 'warning' && 'Warning Telemetry: Yield Volatility'}
                  {alertState === 'monitoring' && 'Monitoring Telemetry: Stable Baseline'}
                </span>
              </div>

              <select 
                value={alertState}
                onChange={(e) => setAlertState(e.target.value)}
                className={`text-xs font-bold px-2.5 py-1 rounded shadow-sm outline-none cursor-pointer border ${
                  alertState === 'critical' ? 'bg-red-700 text-white border-red-800' : 
                  alertState === 'warning' ? 'bg-amber-600 text-white border-amber-700' : 'bg-blue-700 text-white border-blue-800'
                }`}
              >
                <option value="critical">Mode: Surge</option>
                <option value="warning">Mode: Warning</option>
                <option value="monitoring">Mode: Monitoring</option>
              </select>
            </div>

            <div>
              <p className={`text-2xl font-extrabold mb-3 ${
                alertState === 'critical' ? 'text-red-950' : alertState === 'warning' ? 'text-amber-950' : 'text-blue-950'
              }`}>
                {alertState === 'critical' && 'Route: DEL ✈ BOM (+18% Surge)'}
                {alertState === 'warning' && 'Route: BLR ✈ CCU (+8% Volatility)'}
                {alertState === 'monitoring' && 'Route: HYD ✈ MAI (Nominal Variance)'}
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="p-3 bg-white border rounded shadow-sm">
                  <p className="text-[10px] font-bold uppercase tracking-widest text-slate-600">Metric Weight / Impact</p>
                  <p className="text-sm font-bold text-slate-900 mt-0.5">
                    {alertState === 'critical' && 'High weight contribution to Transport CPI'}
                    {alertState === 'warning' && 'Moderate weighting adjustment factor'}
                    {alertState === 'monitoring' && 'Zero variance from moving average'}
                  </p>
                </div>
                <div className="p-3 bg-white border rounded shadow-sm">
                  <p className="text-[10px] font-bold uppercase tracking-widest text-slate-600">Pipeline Action</p>
                  <p className="text-sm font-bold text-slate-900 mt-0.5">
                    {alertState === 'critical' && 'Kafka Dead-Letter Check Bypassed (Verified)'}
                    {alertState === 'warning' && 'Confidence Scoring Scaled to 0.84'}
                    {alertState === 'monitoring' && 'Canonical Postgres Entry Committed'}
                  </p>
                </div>
              </div>
            </div>

            <div className="pt-3 mt-3 border-t text-xs font-semibold flex justify-between items-center opacity-90">
              <span>AUTOMATED CORROBORATION: MULTI-SOURCE INGESTION ACTIVE</span>
              <button onClick={downloadCSV} className="underline cursor-pointer font-bold flex items-center gap-1">
                <Download size={12} /> Download Metrics CSV
              </button>
            </div>
          </div>

        </section>

        {/* Route Ledger Analysis Section */}
        <section className="rounded-lg p-6 shadow-sm border border-slate-300 bg-white">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-5 mb-6 border-b border-slate-300">
            <div>
              <span className="text-[10px] font-extrabold uppercase tracking-widest text-blue-800 bg-blue-50 px-2 py-0.5 rounded">Analytical Engine</span>
              <h2 className="text-xl font-extrabold text-slate-900 mt-1">Cross-Platform Fare Quality &amp; Normalization Ledger</h2>
            </div>
            
            <div className="flex items-center gap-3">
              <div className="flex flex-col">
                <label className="text-[10px] font-extrabold uppercase text-slate-600 mb-0.5">Origin</label>
                <select className="px-3 py-1.5 rounded border border-slate-300 bg-slate-50 font-bold text-xs text-slate-900">
                  <option>New Delhi (DEL)</option>
                  <option>Mumbai (BOM)</option>
                </select>
              </div>
              <span className="text-slate-400 mt-4">→</span>
              <div className="flex flex-col">
                <label className="text-[10px] font-extrabold uppercase text-slate-600 mb-0.5">Destination</label>
                <select className="px-3 py-1.5 rounded border border-slate-300 bg-slate-50 font-bold text-xs text-slate-900">
                  <option>Mumbai (BOM)</option>
                  <option>New Delhi (DEL)</option>
                </select>
              </div>
            </div>
          </div>

          <p className="text-xs font-bold text-slate-700 uppercase tracking-widest mb-3">Live Ingested Sources (Raw Advertised vs. Standardized)</p>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 mb-6">
            {ROUTE_DATA.map((d) => (
              <div key={d.source} className="p-4 rounded border border-slate-300 bg-slate-50 shadow-sm flex flex-col justify-between">
                <div>
                  <div className="flex justify-between items-center mb-1">
                    <span className="text-xs font-bold text-slate-600 uppercase tracking-wider">{d.source}</span>
                    {d.source === "Cheapflights" && <span className="bg-amber-200 text-amber-900 text-[9px] px-1.5 py-0.5 rounded font-extrabold">METASEARCH</span>}
                  </div>
                  <p className="text-3xl font-black text-slate-900 mt-2">₹{d.raw.toLocaleString("en-IN")}</p>
                </div>
                <p className="text-[11px] text-slate-600 font-medium mt-3 pt-2 border-t border-slate-200">Advertised baseline price</p>
              </div>
            ))}
          </div>

          {status !== "done" && (
            <div className="flex justify-center py-4">
              <button onClick={runEngine} disabled={status === "running"} className="flex items-center gap-2 px-8 py-3 rounded font-extrabold text-sm text-white bg-blue-900 hover:bg-blue-800 transition-all shadow">
                {status === "running" ? <Loader2 size={16} className="animate-spin" /> : <Gauge size={16} />}
                {status === "running" ? "Executing Database Normalization Pipeline..." : "Execute AI Normalization & Confidence Weighting"}
              </button>
            </div>
          )}

          {status === "done" && (
            <div className={`transition-all duration-500 ${revealed ? "opacity-100 translate-y-0" : "opacity-0 translate-y-3"}`}>
              <div className="flex items-center gap-2 mb-4 font-bold text-slate-900 border-t border-slate-200 pt-6">
                <Sparkles size={16} className="text-blue-700" />
                <span className="text-base">Normalization &amp; Attribute Adjustment Audit Trail</span>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
                <div className="lg:col-span-3 space-y-3">
                  {ROUTE_DATA.slice(0,3).map((d) => (
                    <div key={d.source} className="p-3.5 rounded border border-slate-300 bg-slate-50">
                      <div className="flex justify-between items-center mb-2 pb-1 border-b border-slate-200 font-bold text-xs">
                        <span className="text-slate-900">{d.source}</span>
                        <span className="text-blue-900 font-bold text-sm">₹{d.normalized.toLocaleString("en-IN")}</span>
                      </div>
                      {d.adjustments.map((a) => (
                        <div key={a.label} className="flex justify-between items-center text-[11px] text-slate-600 py-0.5 font-medium">
                          <span>{a.label}</span>
                          <span className="font-bold text-red-700">+{`₹${a.delta}`}</span>
                        </div>
                      ))}
                    </div>
                  ))}
                  
                  <div className="p-3 bg-emerald-50 border border-emerald-300 rounded text-xs text-emerald-900 font-medium flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <FileCheck2 size={18} className="text-emerald-700 shrink-0" />
                      <span>All unbundled metasearch and OTA listings verified and mapped to a canonical index value of <strong>₹5,350</strong>.</span>
                    </div>
                    <button onClick={downloadCSV} className="px-3 py-1 bg-emerald-700 hover:bg-emerald-800 text-white rounded font-bold text-xs flex items-center gap-1 shrink-0">
                      <Download size={12} /> CSV
                    </button>
                  </div>
                </div>

                <div className="lg:col-span-2 h-[280px] bg-white border border-slate-300 p-3 rounded">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={ROUTE_DATA.slice(0,4)} margin={{ top: 10, right: 0, left: -20, bottom: 0 }}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
                      <XAxis dataKey="source" stroke="#475569" tick={{ fill: '#0F172A', fontSize: 10, fontWeight: 700 }} axisLine={false} tickLine={false} />
                      <YAxis stroke="#475569" tick={{ fill: '#0F172A', fontSize: 10, fontWeight: 700 }} axisLine={false} tickLine={false} domain={[0, 6000]} />
                      <RechartsTooltip contentStyle={{ background: '#FFFFFF', border: '1px solid #CBD5E1', borderRadius: '4px', fontSize: '12px' }} />
                      <Legend wrapperStyle={{ fontSize: 10, fontWeight: 700, paddingTop: 5 }} />
                      <Bar dataKey="raw" name="Advertised Price" fill="#64748B" radius={[2, 2, 0, 0]} />
                      <Bar dataKey="normalized" name="Standardized True Cost" fill="#1D4ED8" radius={[2, 2, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>
          )}
        </section>

      </main>

      {/* FOOTER */}
      <footer className="bg-[#0F172A] text-slate-400 text-xs mt-auto border-t border-slate-800">
        <div className="max-w-7xl mx-auto px-6 py-6 flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="space-y-1">
            <p className="font-bold text-slate-200">National Informatics Centre (NIC) Hosted Portal</p>
            <p className="text-[11px] text-slate-400">Content owned, updated and maintained by Ministry of Statistics and Programme Implementation (MoSPI).</p>
          </div>
          <div className="flex items-center gap-4">
            <button onClick={downloadCSV} className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded flex items-center gap-2 transition-colors">
              <Download size={14} /> Download Full CPI Report (.csv)
            </button>
            <button className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold rounded border border-slate-700 transition-colors">
              Analyst Support Desk
            </button>
          </div>
        </div>
      </footer>
    </div>
  );
}