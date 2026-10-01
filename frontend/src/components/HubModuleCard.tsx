import type { LucideIcon } from "lucide-react"
import { ArrowRight } from "lucide-react"

type HubModuleCardProps = {
  title: string
  description: string
  icon: LucideIcon
  onClick: () => void
  badge?: string
  iconClassName?: string
  ctaLabel?: string
  className?: string
  disabled?: boolean
}

export default function HubModuleCard({
  title,
  description,
  icon: Icon,
  onClick,
  badge = "modul",
  iconClassName = "bg-[#EAF0F6] text-[#17324D]",
  ctaLabel = "Deschide",
  className = "",
  disabled = false,
}: HubModuleCardProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className={`workspace-hub-card group border border-slate-200 bg-white p-3 text-left transition-all duration-200 ${disabled ? "cursor-not-allowed opacity-70" : "hover:-translate-y-0.5"} ${className}`.trim()}
    >
      <div className="flex items-start justify-between gap-3">
        <span className={`flex h-9 w-9 items-center justify-center rounded-xl ${iconClassName}`}>
          <Icon size={17} />
        </span>

        <span className="rounded-full bg-slate-100 px-2 py-0.5 text-[9px] font-semibold uppercase tracking-[0.14em] text-slate-500">
          {badge}
        </span>
      </div>

      <div className="mt-3">
        <div className="text-[15px] font-semibold text-slate-900">{title}</div>
        <div className="mt-1 text-[13px] leading-5 text-slate-500">{description}</div>
      </div>

      {disabled ? (
        <div className="mt-3 inline-flex items-center gap-2 text-xs font-semibold text-slate-400">In curand</div>
      ) : (
        <div className="mt-3 inline-flex items-center gap-1.5 text-xs font-semibold text-[#17324D]">
          {ctaLabel}
          <ArrowRight size={16} className="transition-transform duration-200 group-hover:translate-x-1" />
        </div>
      )}
    </button>
  )
}
