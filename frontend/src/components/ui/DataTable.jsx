export function DataTable({ headers, rows }) {
  if (!rows || rows.length === 0) return <p className="text-slate-500">No data available.</p>;

  return (
    <div className="overflow-x-auto rounded-xl border border-slate-200 shadow-sm bg-white">
      <table className="w-full text-left text-sm text-slate-600">
        <thead className="bg-slate-50 text-slate-700 uppercase font-semibold text-xs border-b border-slate-200">
          <tr>
            {headers.map((h, i) => (
              <th key={i} className="px-6 py-3">{h}</th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-200">
          {rows.map((row, idx) => (
            <tr key={idx} className="hover:bg-slate-50 transition-colors">
              {Object.values(row).map((val, cellIdx) => (
                <td key={cellIdx} className="px-6 py-4">{val}</td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}