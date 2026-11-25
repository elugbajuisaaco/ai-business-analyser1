"use client";

import Link from "next/link";
import { startTransition, useEffect, useMemo, useState } from "react";
import {
  Area, 
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Scatter,
  ScatterChart,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import Navbar from "@/components/Navbar";
import { getActiveAnalysis } from "@/utils/analysisStorage";

const chartTypes = [
  { id: "bar", label: "Bar" },
  { id: "line", label: "Line" },
  { id: "area", label: "Area" },
  { id: "scatter", label: "Scatter" },
];

function numericValue(value) {
  if (typeof value === "number") return value;
  const parsed = Number(String(value ?? "").replace(/[$,%\s,]/g, ""));
  return Number.isFinite(parsed) ? parsed : 0;
}

function ChartPreview({ type, data, rowField, columnField }) {
  const commonProps = {
    data,
    margin: { top: 10, right: 20, left: 0, bottom: 10 },
  };
  const axes = (
    <>
      <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
      <XAxis dataKey={rowField} tick={{ fill: "#64748b", fontSize: 12 }} />
      <YAxis tick={{ fill: "#64748b", fontSize: 12 }} />
      <Tooltip
        contentStyle={{ borderRadius: 12, borderColor: "#e2e8f0" }}
        formatter={(value) => [value, columnField]}
      />
    </>
  );

  if (type === "scatter") {
    return (
      <ResponsiveContainer width="100%" height="100%">
        <ScatterChart {...commonProps}>
          <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
          <XAxis type="number" dataKey="x" name={rowField} tick={{ fill: "#64748b", fontSize: 12 }} />
          <YAxis type="number" dataKey="y" name={columnField} tick={{ fill: "#64748b", fontSize: 12 }} />
          <Tooltip cursor={{ strokeDasharray: "3 3" }} />
          <Scatter data={data} fill="#0f766e" />
        </ScatterChart>
      </ResponsiveContainer>
    );
  }

  const Chart = type === "bar" ? BarChart : type === "area" ? AreaChart : LineChart;
  return (
    <ResponsiveContainer width="100%" height="100%">
      <Chart {...commonProps}>
        {axes}
        {type === "bar" && <Bar dataKey={columnField} fill="#0f766e" radius={[5, 5, 0, 0]} />}
        {type === "line" && <Line type="monotone" dataKey={columnField} stroke="#0f766e" strokeWidth={3} dot={{ r: 4 }} />}
        {type === "area" && <Area type="monotone" dataKey={columnField} stroke="#0f766e" fill="#99f6e4" strokeWidth={3} />}
      </Chart>
    </ResponsiveContainer>
  );
}

export default function AnalyticsPage() {
  const [analysis, setAnalysis] = useState(null);
  const [chartType, setChartType] = useState("bar");
  const [rowField, setRowField] = useState("");
  const [columnField, setColumnField] = useState("");

  useEffect(() => {
    startTransition(() => setAnalysis(getActiveAnalysis()));
  }, []);

  const payload = analysis?.payload;
  const sourceRows = useMemo(() => payload?.preview_rows?.length ? payload.preview_rows : payload?.chartData || [], [payload]);
  const fields = useMemo(() => Object.keys(sourceRows[0] || {}), [sourceRows]);

  const activeRowField = fields.includes(rowField) ? rowField : fields[0] || "";
  const numericField = fields.find((field) => field !== activeRowField && sourceRows.some((row) => Number.isFinite(numericValue(row[field]))));
  const activeColumnField = fields.includes(columnField) && columnField !== activeRowField ? columnField : numericField || fields[0] || "";
  const chartRows = useMemo(() => sourceRows.map((row) => ({
    ...row,
    [activeColumnField]: numericValue(row[activeColumnField]),
    x: numericValue(row[activeRowField]),
    y: numericValue(row[activeColumnField]),
  })), [sourceRows, activeRowField, activeColumnField]);

  if (!analysis) {
    return (
      <div className="min-h-screen bg-slate-50 text-slate-900"><Navbar /><main className="max-w-4xl mx-auto px-6 py-16 text-center"><section className="rounded-2xl border border-slate-200 bg-white p-10 shadow-sm"><h1 className="text-2xl font-bold">Upload your data first</h1><p className="mt-2 text-sm text-slate-500">Interactive charts are created from your active analysis.</p><Link href="/" className="mt-6 inline-flex rounded-xl bg-blue-600 px-5 py-3 text-sm font-semibold text-white">Upload CSV</Link></section></main></div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      <Navbar />
      <main className="mx-auto max-w-7xl space-y-6 px-6 py-10">
        <div><p className="text-xs font-semibold uppercase tracking-[0.18em] text-teal-700">Visual analysis</p><h1 className="mt-2 text-3xl font-extrabold tracking-tight">Build a chart from your data</h1><p className="mt-2 text-sm text-slate-500">Choose the chart form and the fields that should become its rows and column values.</p></div>
        <section className="grid gap-5 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm lg:grid-cols-[280px_1fr]">
          <div className="space-y-5">
            <fieldset><legend className="text-xs font-bold uppercase tracking-wider text-slate-500">Chart form</legend><div className="mt-2 grid grid-cols-2 gap-2">{chartTypes.map((type) => <button key={type.id} type="button" onClick={() => setChartType(type.id)} className={`rounded-lg border px-3 py-2 text-sm font-semibold transition ${chartType === type.id ? "border-teal-700 bg-teal-700 text-white" : "border-slate-200 text-slate-600 hover:border-teal-400"}`}>{type.label}</button>)}</div></fieldset>
            <label className="block text-sm font-semibold text-slate-700">Rows / X axis<select value={activeRowField} onChange={(event) => setRowField(event.target.value)} className="mt-2 w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm font-normal"><option value="" disabled>Select a field</option>{fields.map((field) => <option key={field}>{field}</option>)}</select></label>
            <label className="block text-sm font-semibold text-slate-700">Column / Y axis<select value={activeColumnField} onChange={(event) => setColumnField(event.target.value)} className="mt-2 w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm font-normal"><option value="" disabled>Select a field</option>{fields.map((field) => <option key={field}>{field}</option>)}</select></label>
            <p className="text-xs leading-5 text-slate-400">Showing {chartRows.length} available preview points from {analysis.filename}.</p>
          </div>
          <div className="min-h-[380px] rounded-xl bg-slate-50 p-3"><ChartPreview type={chartType} data={chartRows} rowField={activeRowField} columnField={activeColumnField} /></div>
        </section>
      </main>
    </div>
  );
}