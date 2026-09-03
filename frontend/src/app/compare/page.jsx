"use client";

import Link from "next/link";
import { startTransition, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Navbar from "@/components/Navbar";
import { getAnalysisHistory } from "@/utils/analysisStorage";
import { sendCopilotPrompt } from "@/services/api";

const metrics = [
  { key: "totalRevenue", label: "Total revenue", format: (value) => value == null ? "Unavailable" : `$${value.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}` },
  { key: "transactionCount", label: "Transactions", format: (value) => value?.toLocaleString?.() || "0" },
  { key: "topChannel", label: "Top channel", format: (value) => value || "Unavailable" },
  { key: "monthlyRows", label: "Monthly rows", format: (value) => value?.toLocaleString?.() || "0" },
];

function getMetricValue(record, key) {
  const payload = record.payload || {};
  if (key === "monthlyRows") return payload.summary?.monthly_rows ?? payload.summary?.monthlyRows;
  if (key === "totalRevenue") return payload.facts?.business?.total_sales ?? null;
  return payload.summary?.[key];
}

function formatDelta(metric, value, baseline) {
  if (typeof value !== "number" || typeof baseline !== "number" || value === baseline) return "-";
  const difference = value - baseline;
  if (metric.key === "totalRevenue") return `${difference >= 0 ? "+" : ""}$${difference.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  return `${difference >= 0 ? "+" : ""}${difference.toLocaleString()}`;
}

export default function ComparePage() {
  const router = useRouter();
  const [history, setHistory] = useState([]);
  const [selectedIds, setSelectedIds] = useState([]);
  const [question, setQuestion] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    startTransition(() => setHistory(getAnalysisHistory()));
  }, []);

  const toggleSelection = (id) => {
    setSelectedIds((current) => current.includes(id)
      ? current.filter((item) => item !== id)
      : [...current, id]);
  };

  const selectedRecords = history.filter((record) => selectedIds.includes(record.id));

  const askComparison = async (event) => {
    event.preventDefault();
    if (selectedRecords.length < 2 || !question.trim() || isLoading) return;

    setErrorMessage("");
    setIsLoading(true);
    try {
      const context = {
        comparisons: selectedRecords.map((record) => ({
          filename: record.filename,
          summary: record.payload?.summary,
          facts: record.payload?.facts,
        })),
      };
      const response = await sendCopilotPrompt(question.trim(), context);
      sessionStorage.setItem("biz_result", JSON.stringify({
        resultType: "comparison",
        analysisIds: selectedRecords.map((record) => record.id),
        filenames: selectedRecords.map((record) => record.filename),
        question: question.trim(),
        answer: response.response,
      }));
      router.push("/results");
    } catch (error) {
      setErrorMessage(error.message || "Failed to connect to the AI service.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      <Navbar />
      <main className="max-w-6xl mx-auto px-6 py-12">
        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-blue-600">Analysis workspace</p>
        <h1 className="text-3xl font-extrabold tracking-tight mt-3">Compare saved CSV analyses</h1>
        <p className="text-sm text-slate-500 mt-2">Choose two or more uploads to compare their processed business metrics.</p>

        {!history.length ? (
          <section className="mt-8 rounded-2xl border border-slate-200 bg-white p-10 text-center shadow-sm">
            <h2 className="text-xl font-bold">No saved analyses</h2>
            <p className="mt-2 mb-6 text-sm text-slate-500">Upload CSV files before comparing them.</p>
            <Link href="/" className="inline-flex rounded-xl bg-blue-600 px-5 py-3 text-sm font-semibold text-white hover:bg-blue-700">Upload CSV</Link>
          </section>
        ) : (
          <>
            <section className="mt-8 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-base font-bold text-slate-800">Saved uploads</h2>
                <span className="text-xs text-slate-400">{selectedIds.length} selected</span>
              </div>
              <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                {history.map((record) => (
                  <label key={record.id} className={`flex cursor-pointer items-start gap-3 rounded-xl border p-4 transition-colors ${selectedIds.includes(record.id) ? "border-blue-400 bg-blue-50/50" : "border-slate-200 hover:border-blue-300"}`}>
                    <input type="checkbox" checked={selectedIds.includes(record.id)} onChange={() => toggleSelection(record.id)} className="mt-1 h-4 w-4 accent-blue-600" />
                    <span className="min-w-0">
                      <span className="block truncate text-sm font-semibold text-slate-800">{record.filename}</span>
                      <span className="mt-1 block text-xs text-slate-400">{new Date(record.uploadedAt).toLocaleDateString()}</span>
                    </span>
                  </label>
                ))}
              </div>
            </section>

            {selectedRecords.length < 2 ? (
              <p className="mt-6 rounded-xl border border-dashed border-slate-300 bg-white p-6 text-center text-sm text-slate-500">Select at least two saved analyses to see a comparison.</p>
            ) : (
              <>
                <section className="mt-8 overflow-x-auto rounded-2xl border border-slate-200 bg-white shadow-sm">
                <table className="w-full min-w-[640px] border-collapse text-left">
                  <thead>
                    <tr className="border-b border-slate-200 bg-slate-50">
                      <th className="px-5 py-4 text-xs font-semibold uppercase tracking-wider text-slate-400">Metric</th>
                      {selectedRecords.map((record) => <th key={record.id} className="px-5 py-4 text-sm font-bold text-slate-800">{record.filename}</th>)}
                    </tr>
                  </thead>
                  <tbody>
                    {metrics.map((metric) => (
                      <tr key={metric.key} className="border-b border-slate-100 last:border-0">
                        <th className="px-5 py-4 text-sm font-semibold text-slate-600">{metric.label}</th>
                        {selectedRecords.map((record, index) => <td key={record.id} className="px-5 py-4 text-sm text-slate-800">
                          <div>{metric.format(getMetricValue(record, metric.key))}</div>
                          {index > 0 && typeof getMetricValue(record, metric.key) === "number" && typeof getMetricValue(selectedRecords[0], metric.key) === "number" && <div className={`mt-1 text-xs font-semibold ${getMetricValue(record, metric.key) >= getMetricValue(selectedRecords[0], metric.key) ? "text-emerald-600" : "text-rose-600"}`}>{formatDelta(metric, getMetricValue(record, metric.key), getMetricValue(selectedRecords[0], metric.key))}</div>}
                        </td>)}
                      </tr>
                    ))}
                  </tbody>
                </table>
                </section>
                <section className="mt-8 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
                  <h2 className="text-lg font-bold text-slate-800">Ask about this comparison</h2>
                  <p className="mt-1 text-sm text-slate-500">The AI will compare only the selected CSV analyses.</p>
                  <form onSubmit={askComparison} className="mt-4 space-y-3">
                    <textarea value={question} onChange={(event) => setQuestion(event.target.value)} rows={4} placeholder="Which analysis shows stronger revenue performance, and why?" disabled={isLoading} className="w-full resize-y rounded-xl border border-slate-300 px-4 py-3 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 disabled:bg-slate-100" />
                    {errorMessage && <p className="rounded-lg bg-rose-50 px-3 py-2 text-sm text-rose-700">{errorMessage}</p>}
                    <button type="submit" disabled={!question.trim() || isLoading} className="rounded-xl bg-blue-600 px-5 py-3 text-sm font-semibold text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50">{isLoading ? "Preparing comparison..." : "Ask about comparison"}</button>
                  </form>
                </section>
              </>
            )}
          </>
        )}
      </main>
    </div>
  );
}
