import { useEffect, useState } from "react"
import { KeyRound, Save, Search, ShieldCheck } from "lucide-react"
import { api } from "../../lib/api"

type Profile = Record<"name" | "cui" | "regNo" | "address" | "city" | "county" | "country" | "postalCode" | "iban" | "bank" | "email" | "phone" | "invoiceSeries", string>
type Efactura = { hasToken: boolean; lastError?: string | null }

const empty: Profile = { name: "", cui: "", regNo: "", address: "", city: "", county: "", country: "Romania", postalCode: "", iban: "", bank: "", email: "", phone: "", invoiceSeries: "GUF" }
const fields: Array<[keyof Profile, string]> = [["name", "Denumire firmă *"], ["cui", "CUI *"], ["regNo", "Reg. Com."], ["address", "Adresă sediu *"], ["city", "Localitate *"], ["county", "Județ *"], ["country", "Țară *"], ["postalCode", "Cod poștal *"], ["email", "Email"], ["phone", "Telefon"], ["bank", "Bancă"], ["iban", "IBAN"], ["invoiceSeries", "Serie facturi"]]

export default function ControlPanelProfile() {
  const [form, setForm] = useState<Profile>(empty)
  const [ef, setEf] = useState<Efactura | null>(null)
  const [message, setMessage] = useState("")
  const [error, setError] = useState("")
  const [lookupBusy, setLookupBusy] = useState(false)

  const load = async () => {
    const [profile, state] = await Promise.all([
      api<{ item?: Partial<Profile> }>("/api/v1/admin/platform/billing-profile"),
      api<{ item?: Efactura }>("/api/v1/admin/platform/billing-efactura"),
    ])
    setForm({ ...empty, ...(profile.item || {}) })
    setEf(state.item || null)
  }

  useEffect(() => {
    void load().catch((cause) => setError(cause.message || "Nu am putut încărca profilul."))
    const onMessage = (event: MessageEvent) => {
      if (event.data?.type !== "gufo-control-anaf") return
      if (event.data.status === "success") {
        setMessage("Tokenul ANAF a fost conectat.")
        void load()
      } else {
        setError(event.data.message || "Nu am putut genera tokenul ANAF.")
      }
    }
    window.addEventListener("message", onMessage)
    return () => window.removeEventListener("message", onMessage)
  }, [])

  const set = (key: keyof Profile, value: string) => setForm((current) => ({ ...current, [key]: value }))

  const lookupCui = async () => {
    if (!form.cui.trim()) {
      setError("Introdu mai întâi CUI-ul firmei emitente.")
      return
    }
    try {
      setLookupBusy(true)
      setError("")
      const response = await api<{ company?: Partial<Profile>; error?: string }>(`/api/v1/company/cui-lookup?cui=${encodeURIComponent(form.cui)}`)
      if (!response.company) throw new Error(response.error || "Firma nu a fost găsită după CUI.")
      const company = response.company
      setForm((current) => ({
        ...current,
        name: company.name || current.name,
        cui: company.cui || current.cui,
        regNo: company.regNo || current.regNo,
        address: company.address || current.address,
        city: company.city || current.city,
        county: company.county || current.county,
        country: company.country || current.country,
        postalCode: company.postalCode || current.postalCode,
      }))
      setMessage(company.postalCode ? "Datele firmei, inclusiv codul poștal, au fost preluate după CUI." : "Datele firmei au fost preluate. ANAF nu a returnat cod poștal pentru acest CUI; completează-l manual.")
    } catch (cause: any) {
      setError(cause.message || "Nu am putut prelua firma după CUI.")
    } finally {
      setLookupBusy(false)
    }
  }

  const save = async () => {
    try {
      setError("")
      await api("/api/v1/admin/platform/billing-profile", { method: "PUT", body: JSON.stringify(form) })
      setMessage("Profil salvat.")
    } catch (cause: any) {
      setError(cause.message || "Nu am putut salva.")
    }
  }

  const connect = async () => {
    try {
      setError("")
      const response = await api<{ ok?: boolean; url?: string; freshSessionUrl?: string; error?: string }>("/api/v1/admin/platform/billing-efactura/oauth/start")
      if (!response.ok || !response.url) throw new Error(response.error)
      const popup = window.open(response.freshSessionUrl || response.url, "gufo-control-anaf", "popup,width=560,height=720")
      if (!popup) {
        window.location.assign(response.url)
        return
      }
      if (response.freshSessionUrl) window.setTimeout(() => {
        try { popup.location.replace(response.url!) } catch { window.location.assign(response.url!) }
      }, 1200)
    } catch (cause: any) {
      setError(cause.message || "Nu am putut porni generarea tokenului ANAF.")
    }
  }

  const test = async () => {
    try {
      const response = await api<{ ok?: boolean; message?: string; error?: string }>("/api/v1/admin/platform/billing-efactura/oauth/test", { method: "POST" })
      if (!response.ok) throw new Error(response.error)
      setMessage(response.message || "Conexiunea ANAF a răspuns corect.")
      await load()
    } catch (cause: any) {
      setError(cause.message || "Testul conexiunii ANAF a eșuat.")
    }
  }

  return <div className="space-y-4">
    <section className="border border-[#2b2c33] bg-[#34353d] px-5 py-5 text-white">
      <div className="flex items-center justify-between gap-3">
        <div><div className="text-xs font-bold uppercase tracking-widest text-[#f0ad3d]">Control Panel / Profil owner</div><h1 className="mt-1 text-2xl font-bold">Firma emitentă</h1><p className="mt-1 text-sm text-slate-300">Datele firmei tale pentru facturile Gufo și e-Factura.</p></div>
        <button onClick={() => void save()} className="inline-flex items-center gap-2 bg-[#f39c12] px-4 py-2.5 text-sm font-bold text-slate-950"><Save size={15} />Salvează</button>
      </div>
    </section>

    {error ? <div className="border border-rose-200 bg-rose-50 p-3 text-sm text-rose-700">{error}</div> : null}
    {message ? <div className="border border-emerald-200 bg-emerald-50 p-3 text-sm text-emerald-700">{message}</div> : null}

    <section className="border border-slate-200 bg-white p-5">
      <div className="flex flex-wrap items-center justify-between gap-3"><div><h2 className="font-bold text-[#17324D]">Date firmă</h2><p className="mt-1 text-sm text-slate-500">Preia automat datele publice ANAF după CUI, apoi verifică și salvează.</p></div><button type="button" onClick={() => void lookupCui()} disabled={lookupBusy} className="inline-flex items-center gap-2 border border-[#17324D] px-4 py-2.5 text-sm font-bold text-[#17324D] disabled:opacity-50"><Search size={15} />{lookupBusy ? "Se preia..." : "Preia după CUI"}</button></div>
      <div className="mt-4 grid gap-3 md:grid-cols-2">{fields.map(([key, label]) => <label key={key} className={key === "name" || key === "address" ? "md:col-span-2" : ""}><span className="text-xs font-bold text-slate-600">{label}</span><input value={form[key]} onChange={(event) => set(key, event.target.value)} className="mt-1 w-full border border-slate-200 px-3 py-2.5 text-sm" /></label>)}</div>
    </section>

    <section className="border border-slate-200 bg-white p-5">
      <div className="flex flex-wrap items-start justify-between gap-3"><div><div className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-[#17324D]"><ShieldCheck size={14} />ANAF e-Factura</div><h2 className="mt-1 font-bold text-[#17324D]">Conectare ANAF</h2><p className="mt-1 text-sm text-slate-500">Se alege certificatul în ANAF, apoi tokenul revine automat în Control Panel.</p></div><span className={`border px-2 py-1 text-xs font-bold ${ef?.hasToken ? "border-emerald-200 bg-emerald-50 text-emerald-700" : "border-amber-200 bg-amber-50 text-amber-800"}`}>{ef?.hasToken ? "ANAF conectat" : "Token lipsă"}</span></div>
      <div className="mt-5 flex gap-2"><button onClick={() => void connect()} className="inline-flex items-center gap-2 bg-[#17324D] px-4 py-2.5 text-sm font-bold text-white"><KeyRound size={15} />Generează token ANAF</button><button onClick={() => void test()} disabled={!ef?.hasToken} className="border border-[#17324D] px-4 py-2.5 text-sm font-bold text-[#17324D] disabled:opacity-40">Testează conexiunea</button></div>
      {ef?.lastError ? <p className="mt-3 text-xs text-rose-700">{ef.lastError}</p> : null}
    </section>
  </div>
}
