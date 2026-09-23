import { Link } from "react-router-dom"

export default function DeliveryLandingPublic() {
  return (
    <main className="min-h-screen bg-[radial-gradient(circle_at_top_left,#d9f7e8_0%,transparent_34%),radial-gradient(circle_at_bottom_right,#e0f2ec_0%,transparent_38%),#f8fbf9] px-5 py-10 text-[#16342c] sm:px-8">
      <section className="mx-auto flex min-h-[calc(100vh-5rem)] max-w-4xl flex-col justify-center">
        <div className="rounded-[32px] border border-emerald-100 bg-white px-7 py-12 shadow-[0_24px_70px_rgba(22,52,44,0.12)] sm:px-12 sm:py-16">
          <div className="inline-flex items-center gap-3 rounded-full bg-emerald-50 px-4 py-2 text-sm font-bold text-emerald-800">
            <span className="grid h-7 w-7 place-items-center rounded-lg bg-emerald-700 text-base text-white">G</span>
            Gufo Delivery
          </div>
          <h1 className="mt-7 max-w-2xl text-4xl font-black tracking-tight text-[#16342c] sm:text-6xl">Comanzi local, simplu și rapid.</h1>
          <p className="mt-6 max-w-xl text-lg leading-8 text-slate-600">Gufo Delivery te ajută să descoperi restaurante locale, să comanzi produsele preferate și să urmărești livrarea.</p>
          <p className="mt-4 text-sm leading-6 text-slate-500">Aplicația este disponibilă pe Google Play. Pagina completă de prezentare este în pregătire.</p>
          <div className="mt-10 flex flex-wrap gap-3">
            <a className="rounded-2xl bg-[#087f5b] px-5 py-3 font-bold text-white transition hover:bg-[#066b4c]" href="https://play.google.com/store/apps/details?id=ro.poshard.gufodelivery">Deschide în Google Play</a>
            <Link className="rounded-2xl border border-emerald-200 px-5 py-3 font-bold text-emerald-800 transition hover:bg-emerald-50" to="/privacy">Politica de confidențialitate</Link>
          </div>
          <nav className="mt-12 flex flex-wrap gap-x-5 gap-y-3 border-t border-slate-100 pt-6 text-sm font-semibold text-emerald-800">
            <Link to="/terms">Termeni și condiții</Link>
            <Link to="/delete-account">Ștergere cont</Link>
          </nav>
        </div>
      </section>
    </main>
  )
}
