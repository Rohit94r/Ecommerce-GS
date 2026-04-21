export function AdminTable({
  title,
  headers,
  rows,
}: {
  title: string;
  headers: string[];
  rows: Array<Array<React.ReactNode>>;
}) {
  return (
    <div className="overflow-hidden rounded-md border border-[#047068]/15 bg-white shadow-sm">
      <div className="border-b border-[#047068]/15 p-5">
        <h1 className="text-2xl font-black text-slate-950">{title}</h1>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full min-w-[680px] text-left text-sm">
          <thead className="bg-slate-50 text-xs uppercase tracking-[0.14em] text-slate-500">
            <tr>
              {headers.map((header) => (
                <th key={header} className="px-5 py-3 font-black">{header}</th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {rows.map((row, index) => (
              <tr key={index} className="text-slate-700">
                {row.map((cell, cellIndex) => (
                  <td key={cellIndex} className="px-5 py-4">{cell}</td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
