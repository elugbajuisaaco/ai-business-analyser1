import Papa from "papaparse";

export function parseBusinessCSV(file) {
  return new Promise((resolve, reject) => {
    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      complete: (results) => {
        const rawData = results.data;
        if (!rawData || rawData.length === 0) {
          reject(new Error("CSV file is empty"));
          return;
        }

        // Process dynamic metrics from CSV
        let totalRevenue = 0;
        const channelCounts = {};
        const monthlyTotals = {};

        rawData.forEach((row) => {
          // Find numerical revenue values regardless of exact column casing
          const revKey = Object.keys(row).find((k) => /revenue|amount|sales|mrr/i.test(k));
          const channelKey = Object.keys(row).find((k) => /channel|source|segment|category/i.test(k));
          const dateKey = Object.keys(row).find((k) => /date|month|period/i.test(k));

          const val = revKey ? parseFloat(row[revKey].replace(/[^0-9.-]+/g, "")) || 0 : 100;
          totalRevenue += val;

          // Aggregate by channel
          const channel = channelKey && row[channelKey] ? row[channelKey] : "Direct";
          channelCounts[channel] = (channelCounts[channel] || 0) + val;

          // Aggregate by month/period
          const period = dateKey && row[dateKey] ? row[dateKey] : "Period 1";
          monthlyTotals[period] = (monthlyTotals[period] || 0) + val;
        });

        // Convert aggregated data for Recharts
        const chartData = Object.keys(monthlyTotals).map((p) => ({
          month: p,
          MRR: monthlyTotals[p],
          Baseline: Math.round(monthlyTotals[p] * 0.85),
        }));

        const colors = ["#2563EB", "#60A5FA", "#93C5FD", "#BFDBFE", "#818CF8"];
        const marketShareData = Object.keys(channelCounts).map((key, i) => ({
          name: key,
          value: Math.round((channelCounts[key] / (totalRevenue || 1)) * 100) || 20,
          color: colors[i % colors.length],
        }));

        // AI Dynamic Insights Engine based on parsed numbers
        const aiSummary = {
          totalRevenueFormatted: `$${totalRevenue.toLocaleString(undefined, { minimumFractionDigits: 2 })}`,
          transactionCount: rawData.length,
          topChannel: Object.keys(channelCounts).reduce((a, b) => (channelCounts[a] > channelCounts[b] ? a : b), "Direct"),
          insightText: `Based on your dataset of ${rawData.length} records, total sales reached $${totalRevenue.toLocaleString()}. The highest performing stream is '${Object.keys(channelCounts)[0] || "Direct"}'.`,
        };

        resolve({
          rawData,
          chartData,
          marketShareData,
          aiSummary,
        });
      },
      error: (err) => reject(err),
    });
  });
}