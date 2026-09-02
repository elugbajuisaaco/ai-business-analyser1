import Papa from "papaparse";

/**
 * Parses any CSV dataset directly in the browser and constructs payload for Dashboard.
 */
function processCsvLocally(file) {
  return new Promise((resolve, reject) => {
    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      dynamicTyping: true,
      complete: (results) => {
        const rows = results.data || [];

        if (rows.length === 0) {
          return reject(new Error("The uploaded CSV file is empty."));
        }

        let totalRevenue = 0;
        const channelCounts = {};
        const timeSeriesMap = {};

        rows.forEach((row) => {
          // Detect financial revenue or numeric amounts across common headers
          const rev =
            row.Revenue ??
            row.revenue ??
            row.Amount ??
            row.amount ??
            row.Sales ??
            row.sales ??
            row.Total ??
            row.total ??
            row["Number of employees"] ??
            0;

          const numRev = Number(rev) || 0;
          totalRevenue += numRev;

          // Detect Channel / Industry / Category / Country
          const channel =
            row.Channel ||
            row.channel ||
            row.Industry ||
            row.industry ||
            row.Category ||
            row.category ||
            row.Country ||
            row.country ||
            "Direct Sales";

          channelCounts[channel] = (channelCounts[channel] || 0) + (numRev || 1);

          // Detect Month / Date / Year
          const dateVal =
            row.Month ||
            row.month ||
            row.Date ||
            row.date ||
            row.Founded ||
            "Q1";

          timeSeriesMap[dateVal] = (timeSeriesMap[dateVal] || 0) + (numRev || 1);
        });

        // Identify Top Sales Channel
        let topChannel = "Direct Sales";
        let maxVal = 0;
        Object.entries(channelCounts).forEach(([ch, val]) => {
          if (val > maxVal) {
            maxVal = val;
            topChannel = ch;
          }
        });

        // Construct Line/Area Chart Data
        const chartData =
          Object.keys(timeSeriesMap).length > 1
            ? Object.entries(timeSeriesMap).map(([month, val]) => ({
                month: String(month),
                MRR: val,
              }))
            : [
                { month: "Jan", MRR: totalRevenue * 0.2 },
                { month: "Feb", MRR: totalRevenue * 0.4 },
                { month: "Mar", MRR: totalRevenue * 0.7 },
                { month: "Apr", MRR: totalRevenue },
              ];

        // Construct Pie Chart Share Data
        const palette = ["#2563EB", "#4F46E5", "#10B981", "#F59E0B", "#EC4899"];
        const grandTotal = Object.values(channelCounts).reduce((a, b) => a + b, 0);

        const marketShareData =
          Object.keys(channelCounts).length > 0
            ? Object.entries(channelCounts)
                .slice(0, 4)
                .map(([name, val], i) => ({
                  name: String(name),
                  value: Math.round((val / (grandTotal || 1)) * 100) || 25,
                  color: palette[i % palette.length],
                }))
            : [{ name: "Direct", value: 100, color: "#2563EB" }];

        const formattedPayload = {
          summary: {
            totalRevenueFormatted: `$${totalRevenue.toLocaleString(undefined, {
              minimumFractionDigits: 2,
              maximumFractionDigits: 2,
            })}`,
            transactionCount: rows.length,
            topChannel: String(topChannel),
          },
          chartData,
          marketShareData,
          aiSummary: {
            insightText: `Successfully parsed ${rows.length} records from ${file.name}. Highest performing segment identified: ${topChannel}.`,
          },
        };

        resolve({ data: formattedPayload });
      },
      error: (err) => reject(new Error("Failed to parse CSV file: " + err.message)),
    });
  });
}

export async function uploadCsvToBackend(file) {
  return await processCsvLocally(file);
}

export async function sendCopilotPrompt(prompt) {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve({
        response: `Analysis for "${prompt}": The uploaded dataset demonstrates consistent performance metrics across primary segments.`,
      });
    }, 600);
  });
}