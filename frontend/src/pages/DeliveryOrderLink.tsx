import { useEffect } from "react"
import { Link, useParams } from "react-router-dom"

export default function DeliveryOrderLink() {
  const { orderId = "" } = useParams()

  useEffect(() => {
    if (!orderId || !/Android/i.test(navigator.userAgent)) return
    const timer = window.setTimeout(() => {
      window.location.href = `gufo-delivery://order/${encodeURIComponent(orderId)}`
    }, 250)
    return () => window.clearTimeout(timer)
  }, [orderId])

  const openApp = () => {
    window.location.href = `gufo-delivery://order/${encodeURIComponent(orderId)}`
  }

  return <main className="min-h-screen bg-[radial-gradient(circle_at_top,#e3f5ed,transparent_42%),#f7faf8] px-5 py-16 text-slate-900"><section className="mx-auto max-w-md rounded-[28px] border border-emerald-100 bg-white p-8 text-center shadow-xl shadow-emerald-950/10"><div className="mx-auto grid h-14 w-14 place-items-center rounded-2xl bg-emerald-700 text-2xl font-bold text-white">G</div><h1 className="mt-5 text-2xl font-bold">Deschide comanda în Gufo Delivery</h1><p className="mt-3 text-sm leading-6 text-slate-600">Dacă aplicația este instalată, aceasta se va deschide automat. Pentru siguranța datelor, detaliile comenzii sunt vizibile doar după autentificare.</p><button type="button" onClick={openApp} className="mt-7 w-full rounded-2xl bg-emerald-700 px-5 py-3.5 font-semibold text-white">Deschide aplicația</button><a className="mt-3 block text-sm font-semibold text-emerald-800 underline" href="https://play.google.com/store/apps/details?id=ro.poshard.gufodelivery">Instalează Gufo Delivery</a><Link className="mt-6 block text-sm text-slate-500" to="/privacy">Confidențialitate</Link></section></main>
}
