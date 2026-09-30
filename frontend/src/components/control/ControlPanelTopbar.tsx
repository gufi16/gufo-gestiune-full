import { FormEvent, useMemo, useState } from "react"
import { Bell, LogOut, Menu, Search, ShieldCheck } from "lucide-react"
import { useLocation, useNavigate } from "react-router-dom"
import { controlLogout } from "../../lib/controlAuth"

function pageTitle(pathname: string) {
  if (pathname.includes("/clienti/")) return "Fisa client"
  if (pathname.endsWith("/clienti")) return "Clienti"
  if (pathname.endsWith("/licente")) return "Licente"
  if (pathname.endsWith("/facturare")) return "Facturare"
  if (pathname.endsWith("/integrari")) return "Integrari platforma"
  if (pathname.endsWith("/noutati")) return "Anunturi Delivery"
  if (pathname.endsWith("/audit")) return "Evenimente si audit"
  return "Tablou de bord"
}

export default function ControlPanelTopbar({ onOpenMenu }: { onOpenMenu?: () => void }) {
  const navigate = useNavigate()
  const location = useLocation()
  const [query, setQuery] = useState("")
  const title = useMemo(() => pageTitle(location.pathname), [location.pathname])

  async function handleLogout() {
    await controlLogout()
    navigate("/cp/login")
  }

  function submitSearch(event: FormEvent) {
    event.preventDefault()
    const term = query.trim()
    navigate(term ? `/control-panel/clienti?q=${encodeURIComponent(term)}` : "/control-panel/clienti")
  }

  return (
    <header className="sticky top-0 z-30 border-b border-black/20 bg-[#34353d] text-white shadow-sm">
      <div className="flex h-14 items-center gap-3 px-3 md:px-5 xl:px-6">
        <button type="button" onClick={onOpenMenu} className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-md text-slate-300 hover:bg-white/10 hover:text-white xl:hidden">
          <Menu size={18} />
        </button>

        <div className="hidden min-w-0 items-center gap-3 border-r border-white/10 pr-5 md:flex">
          <ShieldCheck size={17} className="text-[#f39c12]" />
          <div>
            <div className="text-[10px] font-bold uppercase tracking-[0.16em] text-slate-400">Control Panel</div>
            <div className="text-sm font-semibold text-white">{title}</div>
          </div>
        </div>

        <form onSubmit={submitSearch} className="hidden min-w-0 flex-1 md:block">
          <div className="relative max-w-xl">
            <Search size={15} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Cauta client, CUI, email sau licenta" className="h-9 w-full rounded-md border border-white/10 bg-[#27282f] pl-9 pr-3 text-sm text-white outline-none placeholder:text-slate-500 focus:border-[#f39c12]/70" />
          </div>
        </form>

        <div className="min-w-0 flex-1 md:hidden"><div className="truncate text-sm font-semibold">{title}</div></div>
        <button type="button" onClick={() => navigate("/control-panel/audit")} className="inline-flex h-9 w-9 items-center justify-center rounded-md text-slate-300 hover:bg-white/10 hover:text-white" aria-label="Evenimente si audit">
          <Bell size={17} />
        </button>
        <button type="button" onClick={handleLogout} className="inline-flex h-9 items-center justify-center gap-2 rounded-md border border-white/10 px-3 text-xs font-semibold text-slate-200 transition hover:bg-white/10 hover:text-white">
          <LogOut size={15} />
          <span className="hidden sm:inline">Iesire</span>
        </button>
      </div>
    </header>
  )
}
