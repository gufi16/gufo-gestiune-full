import { useEffect, useState } from "react"
import { Building2, Search, Save } from "lucide-react"
import { api } from "../../lib/api"

type Profile = { name: string; cui: string; regNo: string; address: string; city: string; county: string; country: string; iban: string; bank: string; email: string; phone: string; invoiceSeries: string }
const empty: Profile = { name: "", cui: "", regNo: "", address: "", city: "", county: "", country: "Romania", iban: "", bank: "", email: "", phone: "", invoiceSeries: "GUF" }

export default function ControlPanelProfile() {
  const [form, setForm] = useState<Profile>(empty)
  const [saving, setSaving] = useState(false)
  const [lookupBusy, setLookupBusy] = useState(false)
  const [message, setMessage] = useState("")
  const [error, setError] = useState("")
  const set = (key: keyof Profile, value: string) => setForm((current) => ({ ...current, [key]: value }))

  useEffect(() => { void api<{ item?: Partial<Profile> | null }>("/api/v1/admin/platform/billing-profile").then((data) => setForm({ ...empty, ...(data.item || {}) })).catch((err) => setError(err.message || "Nu am putut încărca profilul.")) }, [])

  async function lookupByCui() {
    if (!form.cui.trim()) return setError("Introdu mai întâi CUI-ul.")
    try {
      setLookupBusy(true); setError(""); setMessage("")
      const data = await api<any>(`/api/v1/company/cui-lookup?cui=${encodeURIComponent(form.cui)}`)
      if (!data?.company) throw new Error(data?.error || "Nu am găsit firma după CUI.")
      const company = data.company
      setForm((current) => ({ ...current, name: company.name || current.name, cui: company.cui || current.cui, regNo: company.regNo || current.regNo, address: company.address || current.address, city: company.city || current.city, county: company.county || current.county, country: company.country || current.country }))
      setMessage("Datele firmei au fost completate după CUI.")
    } catch (err: any) { setError(err?.message || "Nu am putut căuta firma.") } finally { setLookupBusy(false) }
  }

  async function save() {
    try { setSaving(true); setError(""); await api("/api/v1/admin/platform/billing-profile", { method: "PUT", body: JSON.stringify(form) }); setMessage("Profilul firmei tale a fost salvat.") }
    catch (err: any) { setError(err?.message || "Nu am putut salva profilul.") }
    finally { setSaving(false) }
  }

  return <div className="space-y-4"><section className="border border-[#2b2c33] bg-[#34353d] px-5 py-5 text-white shadow-sm"><div className="flex flex-wrap items-center justify-between gap-3"><div><div className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-[0.14em] text-[#f0ad3d]"><Building2 size={14} />Profil owner</div><h1 className="mt-1 text-2xl font-semibold">Firma ta</h1><p className="mt-1 text-sm text-slate-300">Datele firmei emitente pentru facturile de abonament Gufo.</p></div><button onClick={() => void save()} disabled={saving || !form.name.trim() || !form.cui.trim()} className="inline-flex items-center gap-2 bg-[#f39c12] px-4 py-2.5 text-sm font-bold text-slate-950 disabled:opacity-60"><Save size={15} />{saving ? "Se salvează..." : "Salvează profilul"}</button></div></section>{error ? <div className="border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">{error}</div> : null}{message ? <div className="border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">{message}</div> : null}<section className="border border-slate-200 bg-white p-5 shadow-sm"><div className="mb-4"><h2 className="font-semibold text-[#17324D]">Date firmă emitentă</h2><p className="mt-1 text-sm text-slate-500">Introdu CUI-ul și completează automat datele publice; verifică apoi datele bancare și de contact.</p></div><div className="grid gap-4 md:grid-cols-2"><label className="block"><span className="text-xs font-bold text-slate-600">CUI *</span><div className="mt-1 flex"><input value={form.cui} onChange={(e) => set("cui", e.target.value)} className="min-w-0 flex-1 border border-slate-200 px-3 py-2.5 text-sm" /><button type="button" onClick={() => void lookupByCui()} disabled={lookupBusy} className="inline-flex items-center gap-2 border border-l-0 border-slate-200 bg-slate-50 px-3 text-xs font-bold text-[#17324D]"><Search size={14} />{lookupBusy ? "Caut..." : "Completează"}</button></div></label><label className="block"><span className="text-xs font-bold text-slate-600">Reg. Com.</span><input value={form.regNo} onChange={(e) => set("regNo", e.target.value)} className="mt-1 w-full border border-slate-200 px-3 py-2.5 text-sm" /></label><label className="block md:col-span-2"><span className="text-xs font-bold text-slate-600">Denumire firmă *</span><input value={form.name} onChange={(e) => set("name", e.target.value)} className="mt-1 w-full border border-slate-200 px-3 py-2.5 text-sm" /></label>{([['address','Adresă sediu'],['city','Localitate'],['county','Județ'],['country','Țară'],['email','Email'],['phone','Telefon'],['bank','Bancă'],['iban','IBAN'],['invoiceSeries','Serie facturi']] as Array<[keyof Profile,string]>).map(([key,label]) => <label key={key} className={key === "address" ? "block md:col-span-2" : "block"}><span className="text-xs font-bold text-slate-600">{label}</span><input value={form[key]} onChange={(e) => set(key, e.target.value)} className="mt-1 w-full border border-slate-200 px-3 py-2.5 text-sm" /></label>)}</div></section></div>
}
