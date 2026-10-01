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
      <section className="workspace-registry-panel border border-slate-200 bg-white p-3 md:p-3.5">
        <PosReceiptsView />
      </section>
    </div>
  )
}
