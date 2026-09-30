import { NavLink } from "react-router-dom"
import clsx from "clsx"
import {
  Activity,
  Building2,
  ChevronLeft,
  CreditCard,
  LayoutDashboard,
  Megaphone,
  PlugZap,
  ShieldCheck,
} from "lucide-react"

const navigationGroups = [
  {
    label: "OPERARE",
    items: [
      { to: "/control-panel", label: "Tablou de bord", icon: LayoutDashboard, exact: true },
      { to: "/control-panel/clienti", label: "Clienti", icon: Building2 },
      { to: "/control-panel/licente", label: "Licente", icon: ShieldCheck },
      { to: "/control-panel/facturare", label: "Facturare", icon: CreditCard },
    ],
  },
  {
    label: "SISTEM",
    items: [
      { to: "/control-panel/integrari", label: "Integrari platforma", icon: PlugZap },
      { to: "/control-panel/noutati", label: "Anunturi Delivery", icon: Megaphone },
      { to: "/control-panel/audit", label: "Evenimente si audit", icon: Activity },
    ],
  },
]

function SidebarContent({ mobile = false, onCloseMobile }: { mobile?: boolean; onCloseMobile?: () => void }) {
  return (
    <div className="flex h-full w-full flex-col overflow-hidden bg-[#292a31] px-3 py-4 text-slate-100">
      <div className="flex items-center gap-3 border-b border-white/10 px-2 pb-4">
        <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-[#f39c12] text-sm font-black text-[#292a31]">G</div>
        <div className="min-w-0 flex-1">
          <div className="text-sm font-bold tracking-[0.08em] text-white">GUFO CONTROL</div>
          <div className="mt-0.5 text-[10px] font-semibold uppercase tracking-[0.16em] text-slate-400">Owner workspace</div>
        </div>
        {mobile ? (
          <button type="button" onClick={onCloseMobile} className="inline-flex h-8 w-8 items-center justify-center rounded-md text-slate-300 hover:bg-white/10 hover:text-white">
            <ChevronLeft size={17} />
          </button>
        ) : null}
      </div>

      <nav className="mt-4 flex-1 overflow-y-auto">
        {navigationGroups.map((group, groupIndex) => (
          <div key={group.label} className={groupIndex ? "mt-6" : ""}>
            <div className="mb-2 px-2 text-[10px] font-bold tracking-[0.18em] text-slate-500">{group.label}</div>
            <div className="space-y-1">
              {group.items.map((item) => {
                const Icon = item.icon
                return (
                  <NavLink
                    key={item.to}
                    to={item.to}
                    end={item.exact}
                    onClick={onCloseMobile}
                    className={({ isActive }) => clsx(
                      "flex items-center gap-3 rounded-md px-3 py-2.5 text-sm font-medium transition",
                      isActive ? "bg-[#3b3d47] text-white shadow-sm" : "text-slate-300 hover:bg-white/5 hover:text-white",
                    )}
                  >
                    {({ isActive }) => (
                      <>
                        <Icon size={17} className={isActive ? "text-[#f39c12]" : "text-slate-500"} />
                        <span className="min-w-0 flex-1 truncate">{item.label}</span>
                        {isActive ? <span className="h-1.5 w-1.5 rounded-full bg-[#f39c12]" /> : null}
                      </>
                    )}
                  </NavLink>
                )
              })}
            </div>
          </div>
        ))}
      </nav>

      <div className="mt-4 border-t border-white/10 px-2 pt-4 text-[11px] text-slate-500">
        <div className="font-semibold text-slate-300">GUFO Ecosystem</div>
        <div className="mt-1">ERP, POS, KDS, Delivery si Kiosk</div>
      </div>
    </div>
  )
}

export default function ControlPanelSidebar({ mobileOpen = false, onCloseMobile }: { mobileOpen?: boolean; onCloseMobile?: () => void }) {
  return (
    <>
      {mobileOpen ? <div className="fixed inset-0 z-50 bg-slate-950/60 xl:hidden" onClick={onCloseMobile} /> : null}
      <aside className="hidden xl:block xl:w-64 xl:shrink-0">
        <div className="fixed left-0 top-0 z-40 hidden h-screen w-64 border-r border-black/30 xl:flex"><SidebarContent /></div>
      </aside>
      <div className={clsx("fixed inset-y-0 left-0 z-[60] w-[86vw] max-w-64 border-r border-black/30 shadow-2xl transition-transform xl:hidden", mobileOpen ? "translate-x-0" : "-translate-x-full")}>
        <SidebarContent mobile onCloseMobile={onCloseMobile} />
      </div>
    </>
  )
}
