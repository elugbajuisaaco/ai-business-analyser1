"use client";

import Link from "next/link";
import { startTransition, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Navbar from "@/components/Navbar";
import { sendCopilotPrompt } from "@/services/api";
import { getActiveAnalysis } from "@/utils/analysisStorage";

export default function AskPage() {
  const router = useRouter();
  const [data, setData] = useState(null);
  const [question, setQuestion] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    const activeAnalysis = getActiveAnalysis();
    startTransition(() => setData(activeAnalysis));
  }, []);

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (!question.trim() || !data?.payload || isLoading) return;

    setErrorMessage("");
    setIsLoading(true);

    try {
      const clientContext = {
        summary: data.payload.summary,
        facts: data.payload.facts,
      };
      const response = await sendCopilotPrompt(question.trim(), clientContext);
      sessionStorage.setItem(
        "biz_result",
        JSON.stringify({ analysisId: data.id, question: question.trim(), answer: response.response })
      );
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
      <main className="max-w-3xl mx-auto px-6 py-16">
        {!data ? (
          <section className="bg-white border border-slate-200 rounded-2xl p-10 text-center shadow-sm">
            <h1 className="text-2xl font-bold">Upload your data first</h1>
            <p className="text-sm text-slate-500 mt-2 mb-6">A client question needs an uploaded CSV as its business context.</p>
            <Link href="/" className="inline-flex rounded-xl bg-blue-600 px-5 py-3 text-sm font-semibold text-white hover:bg-blue-700">Upload CSV</Link>
          </section>
        ) : (
          <section className="bg-white border border-slate-200 rounded-2xl p-8 shadow-sm">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-blue-600">Client AI consultation</p>
            <h1 className="text-3xl font-extrabold tracking-tight mt-3">What would you like to understand?</h1>
            <p className="text-sm text-slate-500 mt-2">Using: <span className="font-semibold text-slate-700">{data.filename}</span>. Ask a focused question about this business data.</p>
            <form onSubmit={handleSubmit} className="mt-8 space-y-4">
              <label htmlFor="question" className="block text-sm font-semibold text-slate-700">Your question</label>
              <textarea
                id="question"
                value={question}
                onChange={(event) => setQuestion(event.target.value)}
                placeholder="Which product category should we focus on next quarter?"
                rows={6}
                disabled={isLoading}
                className="w-full resize-y rounded-xl border border-slate-300 px-4 py-3 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 disabled:bg-slate-100"
              />
              {errorMessage && <p className="rounded-lg bg-rose-50 px-3 py-2 text-sm text-rose-700">{errorMessage}</p>}
              <button type="submit" disabled={!question.trim() || isLoading} className="w-full rounded-xl bg-blue-600 px-5 py-3 text-sm font-semibold text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50">
                {isLoading ? "Preparing answer..." : "Ask AI"}
              </button>
            </form>
          </section>
        )}
      </main>
    </div>
  );
}
