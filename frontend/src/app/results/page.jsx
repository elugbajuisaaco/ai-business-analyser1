"use client";

import Link from "next/link";
import { startTransition, useEffect, useState } from "react";
import Navbar from "@/components/Navbar";
import { getActiveAnalysis, getAnalysisHistory } from "@/utils/analysisStorage";

export default function ResultsPage() {
  const [result, setResult] = useState(null);

  useEffect(() => {
    const cachedResult = sessionStorage.getItem("biz_result");
    const activeAnalysis = getActiveAnalysis();
    if (!cachedResult || !activeAnalysis) return;

    try {
      const parsedResult = JSON.parse(cachedResult);
      const validResult = parsedResult.resultType === "comparison"
        ? parsedResult.analysisIds?.length >= 2 && parsedResult.analysisIds.every((id) => getAnalysisHistory().some((record) => record.id === id))
        : parsedResult.analysisId === activeAnalysis.id;
      if (validResult) {
        startTransition(() => setResult({ ...parsedResult, filename: parsedResult.filenames?.join(" vs ") || activeAnalysis.filename }));
      }
    } catch {
      sessionStorage.removeItem("biz_result");
    }
  }, []);

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      <Navbar />
      <main className="max-w-4xl mx-auto px-6 py-16">
        {!result ? (
          <section className="bg-white border border-slate-200 rounded-2xl p-10 text-center shadow-sm">
            <h1 className="text-2xl font-bold">No client result yet</h1>
            <p className="text-sm text-slate-500 mt-2 mb-6">Ask the AI a question to generate a client-facing result.</p>
            <Link href="/ask" className="inline-flex rounded-xl bg-blue-600 px-5 py-3 text-sm font-semibold text-white hover:bg-blue-700">Ask AI</Link>
          </section>
        ) : (
          <section>
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-blue-600">Client result</p>
            <h1 className="text-3xl font-extrabold tracking-tight mt-3">Your business answer</h1>
            <p className="mt-2 text-xs font-semibold uppercase tracking-wider text-blue-600">Based on {result.filename}</p>
            <div className="mt-8 rounded-2xl border border-slate-200 bg-white p-8 shadow-sm">
              <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">Question</p>
              <p className="mt-2 text-lg font-semibold text-slate-800">{result.question}</p>
              <div className="mt-8 border-t border-slate-100 pt-6">
                <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">AI response</p>
                <p className="mt-3 whitespace-pre-line text-sm leading-7 text-slate-700">{result.answer || "No answer was returned."}</p>
              </div>
            </div>
            <Link href="/ask" className="mt-6 inline-flex rounded-xl border border-slate-300 bg-white px-5 py-3 text-sm font-semibold text-slate-700 hover:border-blue-400 hover:text-blue-700">Ask another question</Link>
          </section>
        )}
      </main>
    </div>
  );
}
