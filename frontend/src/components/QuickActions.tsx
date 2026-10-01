import { ArrowLeftRight, ChevronRight, PackageSearch, Plus, Receipt } from "lucide-react"
import { useNavigate } from "react-router-dom"

const actions = [
  {
    label: "Receptie marfa",
    helper: "NIR nou",
    icon: Plus,
    path: "/inregistrare-document/nir/new",
    tone: "blue",
  },
  {
    label: "Transfer intre locatii",
    helper: "Mutare stoc",
    icon: ArrowLeftRight,
    path: "/transfer/new",
    tone: "slate",
  },
  {
    label: "Vanzare / Bon",
    helper: "Bonuri emise",
    icon: Receipt,
    path: "",
    action: "receipts",
    tone: "amber",
  },
  {
    label: "Cauta produs",
    helper: "Cautare rapida",
    icon: PackageSearch,
    path: "/nomenclator/produse",
    tone: "slate",
  },
] as const

export default function QuickActions({ onOpenReceipts, compact = false }: { onOpenReceipts?: () => void; compact?: boolean }) {
  const navigate = useNavigate()

  return (
    <div className={`dashboard-quick-actions-panel flex min-h-0 flex-col border border-slate-200/90 bg-white p-4 shadow-sm shadow-slate-900/[0.03] ${compact ? "h-full" : "md:p-3.5"}`}>
      <div className={`${compact ? "mb-2" : "mb-3"} flex items-center justify-between gap-3`}>
        <div>
          <div className="text-base font-semibold tracking-[-0.01em] text-[#17324D]">Acțiuni rapide</div>
          <div className="mt-0.5 text-xs text-slate-500">Instrumentele cele mai folosite.</div>
        </div>
      </div>

      <div className={`grid min-h-0 flex-1 grid-cols-2 gap-2 ${compact ? "" : "xl:grid-cols-4"}`}>
      {actions.map((action) => {
        const Icon = action.icon
        return (
          <button
            key={action.label}
            type="button"
            onClick={() => {
              if ("action" in action && action.action === "receipts") {
                onOpenReceipts?.()
                return
              }
              if (action.path) navigate(action.path)
            }}
            className={`dashboard-quick-action group border border-slate-200 bg-white text-left shadow-sm shadow-slate-900/[0.03] transition hover:border-slate-300 hover:bg-slate-50 ${compact ? "p-3" : "p-3"}`}
          >
            <div className="flex items-start justify-between gap-2">
              <span
                className={[
                  "flex h-9 w-9 items-center justify-center rounded-xl",
                  action.tone === "blue" && "bg-blue-600 text-white",
                  action.tone === "amber" && "bg-amber-500 text-white",
                  action.tone === "slate" && "bg-slate-900 text-white",
                ]
                  .filter(Boolean)
                  .join(" ")}
              >
                <Icon size={17} />
              </span>

              <ChevronRight size={17} className="text-slate-400 transition group-hover:translate-x-0.5 group-hover:text-slate-700" />
            </div>

            <div className={compact ? "mt-2" : "mt-3"}>
              <div className="text-sm font-semibold text-slate-900">{action.label}</div>
              <div className="mt-0.5 text-xs leading-5 text-slate-500">{action.helper}</div>
            </div>
          </button>
        )
      })}
      </div>
    </div>
  )
}
