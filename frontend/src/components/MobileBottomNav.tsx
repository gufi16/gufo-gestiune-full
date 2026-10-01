import clsx from "clsx"
import { ArrowLeftRight, Ellipsis, House, PackageSearch, ReceiptText } from "lucide-react"
import { useLocation, useNavigate } from "react-router-dom"

const navItems = [
  { label: "Acasa", to: "/dashboard", icon: House, match: ["/dashboard"] },
  { label: "Stoc", to: "/gestiune/stoc", icon: PackageSearch, match: ["/gestiune/stoc"] },
  { label: "NIR", to: "/inregistrare-document/nir/new", icon: ReceiptText, match: ["/inregistrare-document/nir"] },
  { label: "Transfer", to: "/transfer/new", icon: ArrowLeftRight, match: ["/transfer"] },
] as const

export default function MobileBottomNav({ onOpenMenu }: { onOpenMenu?: () => void }) {
  const location = useLocation()
  const navigate = useNavigate()

  return (
    <nav className="fixed inset-x-0 bottom-0 z-40 border-t border-[#e6ddcf] bg-[#f7f1e9]/95 px-3 pb-[calc(env(safe-area-inset-bottom,0px)+0.75rem)] pt-2 shadow-[0_-14px_40px_rgba(71,56,38,0.10)] backdrop-blur xl:hidden">
      <div className="mx-auto grid max-w-md grid-cols-5 gap-2 rounded-[24px] border border-[#e6ddcf] bg-[#fffdf9] px-2 py-2 shadow-sm">
        {navItems.map((item) => {
          const Icon = item.icon
          const isActive = item.match.some((prefix) => location.pathname.startsWith(prefix))

          return (
            <button
              key={item.label}
              type="button"
              onClick={() => navigate(item.to)}
              className={clsx(
                "flex min-h-[64px] flex-col items-center justify-center gap-1 rounded-[18px] px-2 py-2 text-center transition",
                isActive
                  ? "bg-[#dfe9dc] text-[#334036]"
                  : "text-slate-500 hover:bg-[#f7f1e7] hover:text-[#334036]"
              )}
            >
              <Icon size={20} />
              <span className="text-[11px] font-semibold">{item.label}</span>
            </button>
          )
        })}

        <button
          type="button"
          onClick={onOpenMenu}
          className="flex min-h-[64px] flex-col items-center justify-center gap-1 rounded-[18px] px-2 py-2 text-center text-slate-500 transition hover:bg-[#f7f1e7] hover:text-[#334036]"
        >
          <Ellipsis size={20} />
          <span className="text-[11px] font-semibold">Meniu</span>
        </button>
      </div>
    </nav>
  )
}
