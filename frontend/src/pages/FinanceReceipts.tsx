import PageHeader from "../components/PageHeader"
import PosReceiptsView from "../components/PosReceiptsView"

export default function FinanceReceipts() {
  return (
    <div className="space-y-3">
      <PageHeader
        badge="financiar"
        title="Vanzari / Bon"
        subtitle="Monitorizezi bonurile emise din Android POS intr-un registru clar, potrivit pentru verificarea rapida a incasarilor, produselor si documentelor fiscale."
      />
      <div className="rounded-2xl border border-slate-200 bg-white p-3 shadow-sm shadow-slate-900/[0.03] md:p-3.5">
        <PosReceiptsView />
      </div>
    </div>
  )
}
