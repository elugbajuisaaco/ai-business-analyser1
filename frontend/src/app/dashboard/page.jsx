"use client";

import { startTransition, useEffect, useState } from "react";
import Navbar from "@/components/Navbar";
import { KpiCard } from "@/components/ui/KpiCard";
import { DataTable } from "@/components/ui/DataTable";
import { getActiveAnalysis } from "@/utils/analysisStorage";

export default function DashboardPage() {
  const [data, setData] = useState(null);

  useEffect(() => {
    startTransition(() => setData(getActiveAnalysis()?.payload || null));
  }, []);

  const summary = data?.summary;
  const summaryText =
    typeof summary === "string"
      ? summary
      : summary
        ? `${summary.totalRevenueFormatted || "Revenue unavailable"} across ${summary.transactionCount || 0} transactions. Top channel: ${summary.topChannel || "Unavailable"}.`
        : "Automated Business Intelligence & AI Analysis";
  const rowCount = data?.facts?.row_count ?? summary?.transactionCount ?? 0;
  const columnCount = data?.facts?.column_count ?? data?.headers?.length ?? 0;

  if (!data) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col">
        <Navbar />
        <main className="max-w-6xl w-full mx-auto p-8 text-center my-auto">
          <div className="bg-white border border-slate-200 rounded-2xl p-12 shadow-sm">
            <h2 className="text-2xl font-bold text-slate-800">No Analysis Found</h2>
            <p className="text-slate-500 mt-2 text-sm">
              Please upload a CSV file on the home page to generate real-time business insights.
            </p>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      <Navbar />

      <main className="max-w-7xl w-full mx-auto p-6 space-y-8">
        {/* Header Section */}
        <div>
          <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">
            Executive Summary
          </h1>
          <p className="text-slate-600 mt-1 text-sm">
            {summaryText}
          </p>
          <p className="text-xs font-semibold uppercase tracking-wider text-blue-600 mt-3">
            {data.filename || "Selected analysis"}
          </p>
        </div>

        {/* Main Content Layout */}
        <div className="grid grid-cols-1 gap-6">
          {/* Left / Primary Column (KPIs, Insights & Table) */}
          <div className="space-y-6">
            {/* KPI Cards Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <KpiCard title="Total Records" value={rowCount} />
              <KpiCard title="Processed Columns" value={columnCount} />
              <KpiCard title="Analysis status" value="Complete" isPositive={true} />
            </div>

            {/* Preview Data Table (If rows exist in payload) */}
            {data.preview_rows && (
              <div className="space-y-3">
                <h3 className="text-lg font-bold text-slate-800">Dataset Preview</h3>
                <DataTable
                  headers={data.headers || Object.keys(data.preview_rows[0] || {})}
                  rows={data.preview_rows}
                />
              </div>
            )}
          </div>

        </div>
      </main>
    </div>
  );
}