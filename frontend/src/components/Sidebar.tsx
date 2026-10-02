import { useEffect, useMemo, useState } from "react"
import { NavLink, useLocation } from "react-router-dom"
import clsx from "clsx"
import {
  BarChart3,
  BookOpen,
  Boxes,
  Building2,
  CalendarCheck,
  ChevronDown,
  ChevronLeft,
  FilePlus2,
  FileSpreadsheet,
  FileText,
  FolderTree,
  Inbox,
  LayoutDashboard,
  Package2,
  Receipt,
  Ruler,
  Settings,
  Store,
  Truck,
  UtensilsCrossed,
  Warehouse,
} from "lucide-react"
import { hasModule } from "../lib/modules"

const APP_VERSION = "V1.5"

type NavItem = {
  to: string
  label: string
  icon: any
  module?: string
}

type NavGroup = {
  label: string
  icon?: NavItem["icon"]
  module?: string
  items: NavItem[]
}

const navigation: NavGroup[] = [
  { label: "PANOU", items: [{ to: "/dashboard", label: "Dashboard", icon: LayoutDashboard, module: "dashboard" }] },
  {
    label: "Operațiuni",
    icon: FilePlus2,
    items: [
      { to: "/inregistrare-document", label: "Înregistrare documente", icon: FilePlus2, module: "documents" },
      { to: "/documente", label: "Documente", icon: FileText, module: "documents" },
    ],
  },
  {
    label: "Inventar",
    icon: Warehouse,
    items: [
      { to: "/gestiune/stoc", label: "Stoc", icon: Warehouse, module: "inventory" },
      { to: "/gestiune/gestiuni", label: "Gestiuni", icon: Building2, module: "inventory" },
      { to: "/gestiune/productie", label: "Producție", icon: Receipt, module: "inventory" },
    ],
  },
  {
    label: "Documente",
    icon: Truck,
    items: [
      { to: "/documente/facturi-primite-spv", label: "Facturi primite SPV", icon: Inbox, module: "documents" },
      { to: "/e-transport", label: "Registru e-Transport", icon: Truck, module: "documents" },
    ],
  },
  {
    label: "Rapoarte",
    icon: BarChart3,
    items: [
      { to: "/rapoarte", label: "Rapoarte", icon: BarChart3, module: "reports" },
      { to: "/rapoarte/export-contabilitate", label: "Export contabilitate", icon: FileSpreadsheet, module: "reports" },
    ],
  },
  {
    label: "Financiar",
    icon: CalendarCheck,
    items: [
      { to: "/financiar/vanzari-bon", label: "Vânzări / Bon", icon: Receipt },
      { to: "/financiar/inchideri-zilnice", label: "Închideri zilnice", icon: CalendarCheck },
    ],
  },
  {
    label: "Catalog",
    icon: BookOpen,
    items: [
      { to: "/nomenclator/produse", label: "Produse", icon: Package2, module: "nomenclature" },
      { to: "/nomenclator/categorii", label: "Categorii", icon: FolderTree, module: "nomenclature" },
      { to: "/nomenclator/subcategorii", label: "Subcategorii", icon: FolderTree, module: "nomenclature" },
      { to: "/nomenclator/departamente", label: "Departamente", icon: BookOpen, module: "nomenclature" },
      { to: "/nomenclator/uom", label: "Unități de măsură", icon: Ruler, module: "nomenclature" },
      { to: "/nomenclator/materii-prime", label: "Materii prime", icon: Boxes, module: "nomenclature" },
      { to: "/nomenclator/semifabricate", label: "Semifabricate", icon: Boxes, module: "nomenclature" },
      { to: "/nomenclator/meniuri", label: "Meniuri", icon: UtensilsCrossed, module: "nomenclature" },
      { to: "/nomenclator/furnizori", label: "Furnizori", icon: Building2, module: "nomenclature" },
      { to: "/nomenclator/clienti", label: "Clienți", icon: Building2, module: "nomenclature" },
    ],
  },
  {
    label: "Setări",
    icon: Settings,
    items: [
      { to: "/setari", label: "Setări", icon: Settings, module: "settings" },
      { to: "/setari/gufo-ai", label: "Gufo AI", icon: Store, module: "settings" },
      { to: "/setari/marketplace", label: "Marketplace", icon: Store, module: "settings" },
    ],
  },
]

function SidebarLink({ item, nested = false, onNavigate }: { item: NavItem; nested?: boolean; onNavigate?: () => void }) {
  const Icon = item.icon
  return (
    <NavLink
      to={item.to}
      onClick={onNavigate}
      className={({ isActive }) => clsx(
        "group flex items-center gap-3 border-l-2 px-3 py-2 text-[13px] transition",
        nested ? "ml-3" : "",
        isActive
          ? "border-[#f39c12] bg-[#3b3d47] font-semibold text-white"
          : "border-transparent text-slate-300 hover:bg-white/5 hover:text-white",
      )}
    >
      {({ isActive }) => <><Icon size={nested ? 15 : 17} className={isActive ? "text-[#f39c12]" : "text-slate-500 group-hover:text-slate-300"} /><span className="min-w-0 flex-1 truncate">{item.label}</span></>}
    </NavLink>
  )
}

function SidebarGroup({ group, open, onToggle, onNavigate }: { group: NavGroup; open: boolean; onToggle: () => void; onNavigate?: () => void }) {
  const location = useLocation()
  const active = useMemo(() => group.items.some((item) => location.pathname.startsWith(item.to)), [group.items, location.pathname])

  if (!group.icon) return <SidebarLink item={group.items[0]} onNavigate={onNavigate} />
  const Icon = group.icon

  return (
    <div>
      <button
        type="button"
        onClick={onToggle}
        className={clsx(
          "flex w-full items-center gap-3 border-l-2 px-3 py-2 text-left text-[11px] font-bold tracking-[0.12em] transition",
          active ? "border-[#f39c12] bg-[#3b3d47] text-white" : "border-transparent text-slate-400 hover:bg-white/5 hover:text-slate-200",
        )}
      >
        <Icon size={16} className={active ? "text-[#f39c12]" : "text-slate-500"} />
        <span className="min-w-0 flex-1 truncate">{group.label}</span>
        <ChevronDown size={15} className={clsx("transition-transform", open ? "rotate-180" : "")} />
      </button>
      {open ? <div className="border-l border-white/10 py-1">{group.items.map((item) => <SidebarLink key={item.to} item={item} nested onNavigate={onNavigate} />)}</div> : null}
    </div>
  )
}

function SidebarContent({ groups, mobile, onCloseMobile }: { groups: NavGroup[]; mobile?: boolean; onCloseMobile?: () => void }) {
  const location = useLocation()
  const activeGroupLabel = useMemo(
    () => groups.find((group) => group.icon && group.items.some((item) => location.pathname.startsWith(item.to)))?.label ?? null,
    [groups, location.pathname],
  )
  const [openGroupLabel, setOpenGroupLabel] = useState<string | null>(activeGroupLabel)

  // Keep the active route visible while preventing several large menu groups from expanding together.
  useEffect(() => {
    setOpenGroupLabel(activeGroupLabel)
  }, [activeGroupLabel])

  return (
    <div className="erp-sidebar erp-sidebar--backoffice flex h-full flex-col bg-[#172534] text-slate-100">
      <div className="erp-sidebar-brand relative flex flex-col items-center border-b border-white/10 px-5 py-5 text-center">
        <img src="/gufo-logo.png?v=20260417-6" alt="Gufo" className="h-12 w-12 object-contain" />
        <div className="mt-1.5 text-sm font-bold tracking-[0.08em] text-white">GUFO</div>
        <div className="mt-0.5 text-xs font-medium text-[#a8b8cf]">BACKOFFICE</div>
        {mobile ? <button type="button" onClick={onCloseMobile} className="absolute right-3 top-3 inline-flex h-8 w-8 items-center justify-center text-slate-300 hover:bg-white/10 hover:text-white" aria-label="Închide meniul"><ChevronLeft size={17} /></button> : null}
      </div>

      <nav className="erp-sidebar-nav min-h-0 flex-1 overflow-y-auto px-3 py-4">
        <div className="space-y-1">{groups.map((group) => (
          <SidebarGroup
            key={group.label}
            group={group}
            open={openGroupLabel === group.label}
            onToggle={() => setOpenGroupLabel((current) => current === group.label ? null : group.label)}
            onNavigate={onCloseMobile}
          />
        ))}</div>
      </nav>

      <div className="erp-sidebar-footer border-t border-white/10 px-5 py-4 text-[11px] text-slate-500">
        <div className="font-mono text-[10px] uppercase tracking-[0.12em] text-slate-500">Versiunea {APP_VERSION}</div>
      </div>
    </div>
  )
}

export default function Sidebar({ mobileOpen = false, onCloseMobile }: { mobileOpen?: boolean; onCloseMobile?: () => void }) {
  const groups = navigation
    .map((group) => ({ ...group, items: group.items.filter((item) => !item.module || hasModule(item.module)) }))
    .filter((group) => group.items.length)

  return (
    <>
      {mobileOpen ? <div className="fixed inset-0 z-50 bg-slate-950/60 xl:hidden" onClick={onCloseMobile} /> : null}
      <aside className="hidden xl:block xl:w-[240px] xl:shrink-0"><div className="fixed left-0 top-0 z-40 hidden h-screen w-[240px] border-r border-black/30 xl:block"><SidebarContent groups={groups} /></div></aside>
      <div className={clsx("fixed inset-y-0 left-0 z-[60] w-[86vw] max-w-64 border-r border-black/30 shadow-2xl transition-transform xl:hidden", mobileOpen ? "translate-x-0" : "-translate-x-full")}><SidebarContent groups={groups} mobile onCloseMobile={onCloseMobile} /></div>
    </>
  )
}
