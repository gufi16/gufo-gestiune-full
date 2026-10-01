type Props = {
  columns: string[]
  children: React.ReactNode
}

export default function Table({ columns, children }: Props) {

  return (
    <div className="workspace-simple-table overflow-x-auto border border-slate-200">

      <table className="w-full text-sm">

        <thead className="bg-slate-50 text-slate-500">
          <tr>
            {columns.map((c, i) => (
              <th
                key={i}
                className="px-3 py-2 text-left text-xs font-semibold"
              >
                {c}
              </th>
            ))}
          </tr>
        </thead>

        <tbody className="bg-white">

          {children}

        </tbody>

      </table>

    </div>
  )
}
