"use client";

import React, { useState } from "react";
import { CloudUpload } from "lucide-react";

export function Dropzone({ onFileSelect, isLoading }) {
  const [isDragging, setIsDragging] = useState(false);

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files?.[0]) {
      onFileSelect(e.dataTransfer.files[0]);
    }
  };

  return (
    <div
      onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
      onDragLeave={() => setIsDragging(false)}
      onDrop={handleDrop}
      className={`border-2 border-dashed rounded-2xl p-10 flex flex-col items-center justify-center text-center transition-all ${
        isDragging ? "border-blue-500 bg-blue-50/50 scale-[0.99]" : "border-slate-200 bg-slate-50/40 hover:bg-slate-50/80"
      }`}
    >
      <div className="w-14 h-14 rounded-2xl bg-blue-50 border border-blue-100 flex items-center justify-center text-blue-600 mb-4 shadow-sm">
        <CloudUpload className="w-6 h-6" />
      </div>
      <h3 className="text-base font-bold text-slate-800 mb-1">
        Drag and drop your sales CSV dataset
      </h3>
      <p className="text-xs text-slate-400 mb-6">
        CSV files supported (Max 100MB)
      </p>

      <label className="cursor-pointer">
        <input
          type="file"
          accept=".csv"
          className="hidden"
          disabled={isLoading}
          onChange={(e) => e.target.files?.[0] && onFileSelect(e.target.files[0])}
        />
        <span className="inline-flex items-center justify-center bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold px-6 py-2.5 rounded-xl shadow-sm transition-all active:scale-95 min-w-[140px]">
          {isLoading ? "Parsing CSV..." : "Select File"}
        </span>
      </label>
    </div>
  );
}