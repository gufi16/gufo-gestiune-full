import { AlertTriangle, Boxes, FileText, ShoppingCart, Store, Wallet } from "lucide-react"

const cards = [
  { title: "Vanzari azi", value: "12.480 RON", hint: "+12% fata de ieri", icon: ShoppingCart, tone: "blue" },
  { title: "Stoc critic", value: "18 produse", hint: "Necesita reaprovizionare", icon: AlertTriangle, tone: "amber" },
  { title: "Documente recente", value: "7", hint: "Receptii, transferuri, inventare", icon: FileText, tone: "slate" },
  { title: "Produse active", value: "1.284", hint: "In toate locatiile", icon: Boxes, tone: "blue-soft" },
  { title: "Locatii online", value: "4 / 4", hint: "Sincronizare activa", icon: Store, tone: "slate" },
  { title: "Marja estimata", value: "32%", hint: "Pe baza documentelor curente", icon: Wallet, tone: "amber-soft" },
] as const

export default function PlaceholderGrid() {
  return (
    <div className="grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-3">
      {cards.map((card) => {
        const Icon = card.icon
        return (
          <div key={card.title} className="rounded-2xl border border-slate-200 bg-white p-3.5 shadow-sm">
            <div className="flex items-start justify-between gap-3">
              <div>
                <div className="text-xs font-medium text-slate-500">{card.title}</div>
                <div className="mt-1.5 text-2xl font-semibold tracking-tight text-slate-900">{card.value}</div>
                <div className="mt-1 text-xs text-slate-500">{card.hint}</div>
              </div>

              <span
                className={[
                  "flex h-9 w-9 items-center justify-center rounded-xl",
                  card.tone === "blue" && "bg-blue-600 text-white",
                  card.tone === "amber" && "bg-amber-500 text-white",
                  card.tone === "slate" && "bg-slate-900 text-white",
                  card.tone === "blue-soft" && "bg-blue-50 text-blue-700",
                  card.tone === "amber-soft" && "bg-amber-50 text-amber-700",
                ]
                  .filter(Boolean)
                  .join(" ")}
              >
                <Icon size={17} />
              </span>
            </div>
          </div>
        )
      })}
    </div>
  )
}

