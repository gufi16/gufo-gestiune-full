import PageHeader from "../components/PageHeader"
import PosClosuresView from "../components/PosClosuresView"

export default function FinanceClosures() {
  return (
    <div className="space-y-3">
      <PageHeader
        badge="financiar"
        title="Inchideri zilnice"
        subtitle="Verifici rapoartele Z si inchiderile salvate din Android POS intr-un registru disciplinat, usor de parcurs pentru controlul financiar zilnic."
      />
      <div className="rounded-2xl border border-slate-200 bg-white p-3 shadow-sm shadow-slate-900/[0.03] md:p-3.5">
        <PosClosuresView />
      </div>
    </div>
  )
}
