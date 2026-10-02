import type { CSSProperties, ReactNode } from "react"

export function DocumentSection({
  title,
  description,
  actions,
  children,
}: {
  title: string
  description?: string
  actions?: ReactNode
  children: ReactNode
}) {
  return (
    <section className="workspace-document-section border border-[#dce3e8] bg-white px-3.5 py-3 md:px-4">
      <div className="mb-2.5 flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
        <div>
          <h2 className="text-[15px] font-semibold tracking-[-0.01em] text-[#294b5a]">{title}</h2>
          {description ? <p className="mt-0.5 text-[13px] leading-5 text-slate-500">{description}</p> : null}
        </div>
        {actions ? <div className="flex flex-wrap gap-2">{actions}</div> : null}
      </div>
      {children}
    </section>
  )
}

export function DocumentField({
  label,
  children,
}: {
  label: string
  children: ReactNode
  hint?: string
}) {
  return (
    <div className="space-y-1">
      <label className="block text-xs font-medium text-[#17324D]">{label}</label>
      {children}
    </div>
  )
}

export function DocumentMetric({
  title,
  value,
  tone = "slate",
}: {
  title: string
  value: ReactNode
  tone?: "slate" | "blue" | "emerald" | "amber"
}) {
  const toneClasses: Record<string, string> = {
    slate: "border-l-slate-400",
    blue: "border-l-sky-500",
    emerald: "border-l-emerald-500",
    amber: "border-l-amber-500",
  }

  return (
    <div className={`workspace-document-metric border border-slate-200 border-l-[3px] bg-white px-3 py-2 shadow-sm shadow-slate-900/[0.03] ${toneClasses[tone] || toneClasses.slate}`}>
      <div className="text-[9px] font-semibold uppercase tracking-[0.13em] text-slate-500">{title}</div>
      <div className="mt-1 text-sm font-semibold text-[#17324D]">{value}</div>
    </div>
  )
}

export function DocumentStatusPill({ status }: { status: string }) {
  const normalized = String(status || "").toUpperCase()
  const className =
    normalized === "POSTED" || normalized === "FINALIZED" || normalized === "ISSUED"
      ? "bg-[#E5F3E8] text-[#215D2A]"
      : normalized === "CANCELLED"
        ? "bg-red-100 text-red-700"
        : "bg-slate-100 text-slate-700"

  return (
    <span className={`inline-flex rounded-full px-2.5 py-1 text-[11px] font-semibold uppercase tracking-[0.14em] ${className}`}>
      {status}
    </span>
  )
}

export function InlineNotice({
  tone = "info",
  children,
}: {
  tone?: "info" | "error" | "success"
  children: ReactNode
}) {
  const className =
    tone === "error"
      ? "border-red-200 bg-red-50 text-red-700"
      : tone === "success"
        ? "border-[#CFE6D4] bg-[#E5F3E8] text-[#215D2A]"
        : "border-slate-200 bg-slate-50 text-slate-700"

  return <div className={`rounded-[14px] border px-3 py-2 text-sm ${className}`}>{children}</div>
}

export function DocumentPageHeader({
  badge = "Operatiuni",
  title,
  subtitle,
  actions,
}: {
  badge?: string
  title: string
  subtitle?: string
  actions?: ReactNode
}) {
  return (
    <header className="workspace-page-header border border-[#d8e0e7] bg-white px-4 py-3 md:px-5 md:py-3.5">
      <div className="flex flex-col gap-2.5 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <div className="inline-flex rounded-full border border-[#d7e4e7] bg-[#f2f8f8] px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.18em] text-[#3d6875] shadow-sm shadow-slate-900/[0.02]">
            {badge}
          </div>
          <h1 className="mt-1.5 text-[22px] font-semibold tracking-[-0.015em] text-[#243342]">{title}</h1>
          {subtitle ? <p className="mt-1 max-w-4xl text-[13px] leading-5 text-slate-500">{subtitle}</p> : null}
        </div>

        {actions ? <div className="flex flex-wrap justify-end gap-2">{actions}</div> : null}
      </div>
    </header>
  )
}

export function DocumentTabs<T extends string>({
  items,
  activeId,
  onChange,
}: {
  items: Array<{ id: T; title: string }>
  activeId: T
  onChange: (id: T) => void
}) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-2 shadow-sm shadow-slate-900/[0.03]">
      <div className="flex flex-nowrap gap-1.5 overflow-x-auto">
        {items.map((item, index) => {
          const isActive = activeId === item.id
          return (
            <button
              key={item.id}
              type="button"
              onClick={() => onChange(item.id)}
              className={[
                "inline-flex h-9 shrink-0 items-center gap-1.5 rounded-xl border px-2.5 text-xs font-semibold transition",
                isActive
                  ? "border-[#17324D] bg-[#17324D] text-white shadow-sm shadow-[#17324D]/20"
                  : "border-transparent bg-slate-50 text-[#17324D] hover:border-slate-200 hover:bg-slate-100",
              ].join(" ")}
            >
              <span
                className={[
                  "inline-flex h-5 w-5 items-center justify-center rounded-full text-[11px] font-bold",
                  isActive ? "bg-white/15 text-white" : "bg-slate-100 text-[#17324D]",
                ].join(" ")}
              >
                {index + 1}
              </span>
              {item.title}
            </button>
          )
        })}
      </div>
    </div>
  )
}

export const documentInputClass =
  "h-9 w-full border border-slate-300 bg-white px-3 text-[13px] text-[#17324D] outline-none transition focus:border-[#0b888a] focus:bg-white focus:ring-2 focus:ring-[#d9f2f1]"

export const documentTextareaClass =
  "w-full border border-slate-300 bg-white px-3 py-2.5 text-[13px] text-[#17324D] outline-none transition focus:border-[#0b888a] focus:bg-white focus:ring-2 focus:ring-[#d9f2f1]"

export const documentButtonPrimaryClass =
  "inline-flex h-9 items-center justify-center bg-[#123d59] px-3 text-[13px] font-semibold text-white transition hover:bg-[#0b888a] disabled:cursor-not-allowed disabled:opacity-60"

export const documentButtonSecondaryClass =
  "inline-flex h-9 items-center justify-center border border-slate-300 bg-white px-3 text-[13px] font-semibold text-slate-700 transition hover:border-slate-400 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-60"

export const documentButtonDangerClass =
  "inline-flex h-9 items-center justify-center rounded-xl border border-red-200 bg-red-50 px-3 text-[13px] font-semibold text-red-700 transition hover:bg-red-100 disabled:cursor-not-allowed disabled:opacity-60"

export const readonlyInputStyle: CSSProperties = {
  backgroundColor: "#f8fafc",
  fontWeight: 600,
}
