import { ChevronDown, ChevronUp, Search } from "lucide-react"
import { useMemo, useState } from "react"

type Column<T> = {
  key: keyof T | string
  label: string
  sortable?: boolean
  className?: string
  render?: (row: T) => React.ReactNode
  type?: "status"
}

type DataTableProps<T> = {
  title?: string
  subtitle?: string
  columns: Column<T>[]
  rows: T[]
  rowKey: (row: T, index: number) => string
  searchPlaceholder?: string
  pageSizeOptions?: number[]
  initialPageSize?: number
  emptyText?: string
}

function normalize(value: unknown) {
  if (value === null || value === undefined) return ""
  if (typeof value === "boolean") return value ? "activ" : "inactiv"
  return String(value)
}

function StatusBadge({ value }: { value: unknown }) {
  const normalized = normalize(value).toLowerCase()

  const isActive =
    normalized === "activ" ||
    normalized === "active" ||
    normalized === "final" ||
    normalized === "posted" ||
    normalized === "true"

  const isWarning =
    normalized === "draft" ||
    normalized === "inactiv" ||
    normalized === "inactive" ||
    normalized === "false"

  const cls = isActive
    ? "bg-[#E5F3E8] text-[#215D2A]"
    : isWarning
      ? "bg-slate-100 text-slate-700"
      : "bg-[#F8F5EF] text-[#17324D]"

  return (
    <span className={`inline-flex rounded-full px-2.5 py-1 text-xs font-semibold ${cls}`}>
      {normalize(value)}
    </span>
  )
}

export default function DataTable<T>({
  title,
  subtitle,
  columns,
  rows,
  rowKey,
  searchPlaceholder = "Cauta in tabel...",
  pageSizeOptions = [10, 25, 50],
  initialPageSize = 10,
  emptyText = "Nu exista date."
}: DataTableProps<T>) {
  const [query, setQuery] = useState("")
  const [pageSize, setPageSize] = useState(initialPageSize)
  const [page, setPage] = useState(1)
  const [sortKey, setSortKey] = useState<string>("")
  const [sortDir, setSortDir] = useState<"asc" | "desc">("asc")

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase()
    if (!q) return rows

    return rows.filter((row) =>
      columns.some((col) => {
        if (col.render) return false
        const value = normalize((row as Record<string, unknown>)[String(col.key)]).toLowerCase()
        return value.includes(q)
      })
    )
  }, [rows, columns, query])

  const sorted = useMemo(() => {
    if (!sortKey) return filtered

    return [...filtered].sort((a, b) => {
      const av = normalize((a as Record<string, unknown>)[sortKey]).toLowerCase()
      const bv = normalize((b as Record<string, unknown>)[sortKey]).toLowerCase()
      if (av < bv) return sortDir === "asc" ? -1 : 1
      if (av > bv) return sortDir === "asc" ? 1 : -1
      return 0
    })
  }, [filtered, sortKey, sortDir])

  const totalPages = Math.max(1, Math.ceil(sorted.length / pageSize))
  const currentPage = Math.min(page, totalPages)

  const paged = useMemo(() => {
    const start = (currentPage - 1) * pageSize
    return sorted.slice(start, start + pageSize)
  }, [sorted, currentPage, pageSize])

  function toggleSort(key: string) {
    if (sortKey === key) {
      setSortDir((prev) => (prev === "asc" ? "desc" : "asc"))
    } else {
      setSortKey(key)
      setSortDir("asc")
    }
    setPage(1)
  }

  return (
    <div className="rounded-2xl border border-slate-200/90 bg-white p-3 shadow-sm shadow-slate-900/[0.03] md:p-3.5">
      {(title || subtitle) && (
        <div className="mb-3 border-b border-slate-100 pb-2.5">
          {title ? <div className="text-base font-semibold tracking-[-0.01em] text-[#17324D]">{title}</div> : null}
          {subtitle ? <div className="mt-0.5 text-xs leading-5 text-slate-500">{subtitle}</div> : null}
        </div>
      )}

      <div className="mb-3 flex flex-col gap-2 lg:flex-row lg:items-center lg:justify-between">
        <div className="relative w-full max-w-md">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            value={query}
            onChange={(e) => {
              setQuery(e.target.value)
              setPage(1)
            }}
            placeholder={searchPlaceholder}
            className="h-9 w-full rounded-xl border border-slate-200 bg-slate-50/80 pl-9 pr-3 text-[13px] text-[#17324D] outline-none transition focus:border-[#244A7C] focus:bg-white focus:ring-2 focus:ring-[#DCE7F5]"
          />
        </div>

        <div className="flex items-center gap-2 text-xs text-slate-500">
          <span>Randuri:</span>
          <select
            value={pageSize}
            onChange={(e) => {
              setPageSize(Number(e.target.value))
              setPage(1)
            }}
            className="h-9 rounded-xl border border-slate-200 bg-white px-2.5 text-xs text-[#17324D] outline-none"
          >
            {pageSizeOptions.map((size) => (
              <option key={size} value={size}>
                {size} / pagina
              </option>
            ))}
          </select>
        </div>
      </div>

      {paged.length === 0 ? (
        <div className="rounded-[14px] border border-dashed border-slate-200 bg-slate-50 p-8 text-center text-sm text-slate-500">
          {emptyText}
        </div>
      ) : (
        <>
          <div className="max-h-[58vh] overflow-auto rounded-xl border border-slate-200">
            <table className="w-full text-[13px]">
              <thead className="bg-slate-50/90 text-slate-500">
                <tr>
                  {columns.map((col) => (
                    <th
                      key={String(col.key)}
                      className={`px-3 py-2 text-left text-[11px] font-semibold uppercase tracking-[0.08em] ${col.className || ""}`}
                    >
                      {col.sortable === false || col.render ? (
                        col.label
                      ) : (
                        <button
                          type="button"
                          onClick={() => toggleSort(String(col.key))}
                          className="inline-flex items-center gap-1 font-semibold text-[#6C7A89]"
                        >
                          {col.label}
                          {sortKey === String(col.key) ? (
                            sortDir === "asc" ? <ChevronUp size={14} /> : <ChevronDown size={14} />
                          ) : null}
                        </button>
                      )}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {paged.map((row, index) => (
                  <tr key={rowKey(row, index)} className="border-t border-slate-100 transition hover:bg-slate-50/80">
                    {columns.map((col) => (
                      <td key={String(col.key)} className={`px-3 py-2 align-middle text-[13px] ${col.className || ""}`}>
                        {col.render ? (
                          col.render(row)
                        ) : col.type === "status" ? (
                          <StatusBadge value={(row as Record<string, unknown>)[String(col.key)]} />
                        ) : (
                          normalize((row as Record<string, unknown>)[String(col.key)])
                        )}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="mt-2.5 flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
            <div className="text-xs text-slate-500">
              {sorted.length} rezultate • pagina {currentPage} din {totalPages}
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={currentPage === 1}
                className="h-8 rounded-xl border border-slate-200 bg-white px-2.5 text-xs font-semibold text-[#17324D] disabled:cursor-not-allowed disabled:opacity-50"
              >
                Inapoi
              </button>

              <button
                type="button"
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                disabled={currentPage === totalPages}
                className="h-8 rounded-xl border border-slate-200 bg-white px-2.5 text-xs font-semibold text-[#17324D] disabled:cursor-not-allowed disabled:opacity-50"
              >
                Inainte
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  )
}
