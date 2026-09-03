"use client";

import { startTransition, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  deleteAnalysis,
  getAnalysisHistory,
  getActiveAnalysis,
  setActiveAnalysis,
} from "@/utils/analysisStorage";

function formatDate(value) {
  return new Intl.DateTimeFormat(undefined, {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(value));
}

export function AnalysisHistory() {
  const router = useRouter();
  const [history, setHistory] = useState([]);
  const [activeId, setActiveId] = useState(null);

  useEffect(() => {
    const savedHistory = getAnalysisHistory();
    const savedActiveId = getActiveAnalysis()?.id || null;
    startTransition(() => {
      setHistory(savedHistory);
      setActiveId(savedActiveId);
    });
  }, []);

  const handleSelect = (id) => {
    setActiveAnalysis(id);
    setActiveId(id);
    router.push("/dashboard");
  };

  const handleDelete = (id) => {
    const record = history.find((item) => item.id === id);
    if (!record || !window.confirm(`Delete ${record.filename}? This cannot be undone.`)) return;

    const remaining = deleteAnalysis(id);
    setHistory(remaining);
    setActiveId(getActiveAnalysis()?.id || null);
  };

  const duplicateHashes = history.reduce((hashes, record) => {
    if (record.fileHash) hashes[record.fileHash] = (hashes[record.fileHash] || 0) + 1;
    return hashes;
  }, {});

  if (!history.length) return null;

  return (
    <section className="w-full mt-8">
      <div className="flex items-end justify-between mb-3">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">Saved analyses</p>
          <h2 className="text-xl font-bold text-slate-800 mt-1">Your uploaded CSV history</h2>
        </div>
        <span className="text-xs text-slate-400">{history.length} saved</span>
      </div>
      <div className="space-y-2">
        {history.map((record) => (
          <div key={record.id} className={`flex items-center gap-3 rounded-xl border bg-white px-4 py-3 shadow-sm ${record.id === activeId ? "border-blue-400 ring-1 ring-blue-100" : "border-slate-200"}`}>
            <button type="button" onClick={() => handleSelect(record.id)} className="min-w-0 flex-1 text-left">
              <span className="flex items-center gap-2 truncate text-sm font-semibold text-slate-800">
                <span className="truncate">{record.filename}</span>
                {record.fileHash && duplicateHashes[record.fileHash] > 1 && (
                  <span className="shrink-0 rounded-full bg-amber-100 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-amber-800">Duplicate</span>
                )}
              </span>
              <span className="block text-xs text-slate-400 mt-1">Uploaded {formatDate(record.uploadedAt)}{record.fileHash ? " · fingerprinted" : ""}</span>
            </button>
            <button type="button" onClick={() => handleDelete(record.id)} aria-label={`Delete ${record.filename}`} className="rounded-lg px-3 py-2 text-xs font-semibold text-rose-600 hover:bg-rose-50">Delete</button>
          </div>
        ))}
      </div>
    </section>
  );
}
