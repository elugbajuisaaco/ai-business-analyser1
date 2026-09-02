"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";

export function Navbar({ userName = "Upper" }) {
  const [isApiOnline, setIsApiOnline] = useState(true);

  useEffect(() => {
    // Optional ping check to backend endpoint
    const checkApiStatus = async () => {
      try {
        const baseUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api";
        const res = await fetch(`${baseUrl}/analytics/status`, { method: "HEAD" }).catch(() => null);
        setIsApiOnline(!!res?.ok);
      } catch {
        setIsApiOnline(false);
      }
    };

    checkApiStatus();
  }, []);

  return (
    <header className="w-full border-b border-slate-200/80 bg-white/80 backdrop-blur-md px-8 py-4 flex items-center justify-between sticky top-0 z-30">
      <Link href="/" className="flex items-center gap-2.5 group">
        <div className="h-8 w-8 rounded-lg bg-blue-600 flex items-center justify-center text-white font-bold text-sm shadow-sm transition-transform group-hover:scale-105">
          B
        </div>
        <span className="font-bold text-lg text-slate-900 tracking-tight">
          Ai Business Analyser
        </span>
      </Link>

      <div className="flex items-center gap-6 text-sm text-slate-600">
        <Link href="#" className="hover:text-slate-900 transition-colors">
          About
        </Link>
        <Link href="#" className="hover:text-slate-900 transition-colors">
          Contact
        </Link>

        {/* API Status Badge */}
        <div className="flex items-center gap-2 text-xs font-medium px-2.5 py-1 rounded-full bg-slate-100 text-slate-600">
          <span
            className={`w-2 h-2 rounded-full ${
              isApiOnline ? "bg-emerald-500 animate-pulse" : "bg-amber-500"
            }`}
          />
          {isApiOnline ? "API Connected" : "Local Mode"}
        </div>

        <div className="flex items-center gap-3 pl-4 border-l border-slate-200">
          <span className="font-semibold text-slate-800 text-xs">
            {userName}
          </span>
        </div>
      </div>
    </header>
  );
}