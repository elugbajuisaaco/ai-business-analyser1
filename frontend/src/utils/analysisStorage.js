const HISTORY_KEY = "biz_history";
const ACTIVE_KEY = "biz_active_id";

export function getAnalysisHistory() {
  if (typeof window === "undefined") return [];

  try {
    const history = JSON.parse(localStorage.getItem(HISTORY_KEY) || "[]");
    return Array.isArray(history)
      ? history.map((record) => ({
          ...record,
          payload: record.payload ? {
            filename: record.payload.filename,
            summary: record.payload.summary,
            facts: record.payload.facts,
            headers: record.payload.headers,
            preview_rows: record.payload.preview_rows,
          } : record.payload,
        }))
      : [];
  } catch {
    return [];
  }
}

export function saveAnalysis(payload) {
  return saveAnalysisWithMetadata(payload);
}

export function saveAnalysisWithMetadata(payload, metadata = {}) {
  const safePayload = {
    filename: payload.filename,
    summary: payload.summary,
    facts: payload.facts,
    headers: payload.headers,
    preview_rows: payload.preview_rows,
  };
  const record = {
    id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    filename: payload.filename || "Untitled CSV",
    uploadedAt: new Date().toISOString(),
    fileHash: metadata.fileHash || null,
    payload: safePayload,
  };
  const history = [record, ...getAnalysisHistory()];

  localStorage.setItem(HISTORY_KEY, JSON.stringify(history));
  localStorage.setItem(ACTIVE_KEY, record.id);
  return record;
}

export async function hashFile(file) {
  const buffer = await file.arrayBuffer();
  const digest = await crypto.subtle.digest("SHA-256", buffer);
  return Array.from(new Uint8Array(digest))
    .map((byte) => byte.toString(16).padStart(2, "0"))
    .join("");
}

export function findDuplicate(fileHash) {
  if (!fileHash) return null;
  return getAnalysisHistory().find((record) => record.fileHash === fileHash) || null;
}

export function getActiveAnalysis() {
  if (typeof window === "undefined") return null;

  const history = getAnalysisHistory();
  if (!history.length) {
    try {
      const legacyData = sessionStorage.getItem("biz_data");
      if (legacyData) {
        const migratedRecord = saveAnalysis(JSON.parse(legacyData));
        sessionStorage.removeItem("biz_data");
        return migratedRecord;
      }
    } catch {
      return null;
    }
  }

  const activeId = localStorage.getItem(ACTIVE_KEY);
  const currentHistory = getAnalysisHistory();
  return currentHistory.find((record) => record.id === activeId) || currentHistory[0] || null;
}

export function setActiveAnalysis(id) {
  const record = getAnalysisHistory().find((item) => item.id === id);
  if (!record) return null;

  localStorage.setItem(ACTIVE_KEY, id);
  return record;
}

export function deleteAnalysis(id) {
  const history = getAnalysisHistory();
  const remaining = history.filter((record) => record.id !== id);
  localStorage.setItem(HISTORY_KEY, JSON.stringify(remaining));

  if (localStorage.getItem(ACTIVE_KEY) === id) {
    if (remaining[0]) localStorage.setItem(ACTIVE_KEY, remaining[0].id);
    else localStorage.removeItem(ACTIVE_KEY);
  }

  try {
    const savedResult = JSON.parse(sessionStorage.getItem("biz_result") || "null");
    const resultUsesDeletedAnalysis = savedResult?.analysisId === id
      || savedResult?.analysisIds?.includes(id);
    if (resultUsesDeletedAnalysis) sessionStorage.removeItem("biz_result");
  } catch {
    sessionStorage.removeItem("biz_result");
  }

  sessionStorage.removeItem("biz_data");

  return remaining;
}
