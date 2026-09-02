"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { Navbar } from "@/components/navbar";
import { Dropzone } from "@/components/upload/dropzone";
import { uploadCsvToBackend } from "@/services/api";

const MAX_FILE_SIZE = 100 * 1024 * 1024; // 100MB Limit

export default function UploadPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const handleFileUpload = async (file) => {
    setErrorMessage("");

    // 1. Client-Side Extension Validation
    if (!file.name.toLowerCase().endsWith(".csv")) {
      setErrorMessage("Invalid file format. Please select a valid .csv file.");
      return;
    }

    // 2. Client-Side File Size Validation (100MB)
    if (file.size > MAX_FILE_SIZE) {
      setErrorMessage("File size exceeds the 100MB maximum limit.");
      return;
    }

    setIsLoading(true);

    try {
      // 3. Send CSV to API (or fallback service)
      const response = await uploadCsvToBackend(file);
      fetch()
      // Extract payload based on backend structure
      const payload = response.data || response;

      // Cache processing payload for Dashboard render
      sessionStorage.setItem("biz_data", JSON.stringify(payload));

      router.push("/dashboard");
    } catch (err) {
      console.error("Upload error:", err);
      setErrorMessage(
        err.message || "Failed to process the CSV file. Please try again."
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] text-slate-900 flex flex-col justify-between">
      <Navbar />

      <main className="max-w-3xl w-full mx-auto px-6 py-12 flex flex-col items-center">
        <div className="text-center max-w-xl mb-8">
          <h1 className="text-3xl font-extrabold tracking-tight text-slate-900 mb-2">
            Import Business Data
          </h1>
          <p className="text-slate-500 text-xs">
            Upload your sales CSV file to view real-time revenue metrics, trends, and interactive AI insights.
          </p>
        </div>

        <div className="w-full bg-white border border-slate-200 rounded-2xl p-8 shadow-sm">
          {/* Error Banner */}
          {errorMessage && (
            <div className="mb-4 p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-medium text-center">
              {errorMessage}
            </div>
          )}

          {/* Uploading Loading Banner */}
          {isLoading && (
            <div className="mt-4 flex items-center justify-center gap-3 p-4 bg-blue-50/80 border border-blue-100 rounded-xl">
              <div className="w-4 h-4 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
              <span className="text-xs font-semibold text-blue-700">
                Uploading & analyzing business metrics...
              </span>
            </div>
          )}

          <Dropzone onFileSelect={handleFileUpload} isLoading={isLoading} />
        </div>
      </main>

      <footer className="text-center py-6 text-xs text-slate-400">
        © 2026 BizIntel. Built for instant data analytics.
      </footer>
    </div>
  );
}