export function KpiCard({ title, value, change, isPositive }) {
  return (
    <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
      <p className="text-sm font-medium text-slate-500">{title}</p>
      <div className="mt-2 flex items-baseline justify-between">
        <span className="text-3xl font-bold text-slate-900">{value}</span>
        {change && (
          <span
            className={`text-xs font-semibold px-2 py-1 rounded-full ${
              isPositive ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"
            }`}
          >
            {change}
          </span>
        )}
      </div>
    </div>
  );
}