const API_BASE_URL = (process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api").replace(/\/$/, "");
const ANALYZE_ENDPOINT = process.env.NEXT_PUBLIC_ANALYZE_ENDPOINT || `${API_BASE_URL}/analyze`;
const COPILOT_ENDPOINT = process.env.NEXT_PUBLIC_COPILOT_ENDPOINT || `${API_BASE_URL}/copilot`;

async function parseResponse(response) {
  const contentType = response.headers.get("content-type") || "";
  const body = contentType.includes("application/json")
    ? await response.json()
    : await response.text();

  if (!response.ok) {
    const detail =
      typeof body === "object" && body !== null
        ? body.detail || body.message || body.error
        : body;
    throw new Error(detail || `Backend request failed with status ${response.status}.`);
  }

  return body;
}

export async function uploadCsvToBackend(file) {
  const formData = new FormData();
  formData.append("file", file);

  return parseResponse(
    await fetch(ANALYZE_ENDPOINT, {
      method: "POST",
      body: formData,
    })
  );
}

export async function sendCopilotPrompt(prompt, context) {
  return parseResponse(
    await fetch(COPILOT_ENDPOINT, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ prompt, context }),
    })
  );
}
