import { useEffect, useState } from "react"
import { Mail, Megaphone, Pencil, Plus, RefreshCw, Send, Trash2 } from "lucide-react"
import { api } from "../../lib/api"

type Announcement = {
  id: string
  title: string
  body: string
  isPublished: boolean
  sendEmail: boolean
  emailSentAt?: string | null
  emailRecipientCount?: number
  emailFailureCount?: number
  publishedAt: string
  expiresAt?: string | null
  _count?: { reads?: number }
}

const emptyForm = { title: "", body: "", isPublished: true, sendEmail: false, expiresAt: "" }

function localDateTime(value?: string | null) {
  if (!value) return ""
  const date = new Date(value)
  const offset = date.getTimezoneOffset() * 60_000
  return new Date(date.getTime() - offset).toISOString().slice(0, 16)
}

export default function ControlPanelDeliveryAnnouncements() {
  const [items, setItems] = useState<Announcement[]>([])
  const [emailAudience, setEmailAudience] = useState(0)
  const [form, setForm] = useState(emptyForm)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [message, setMessage] = useState<string | null>(null)

  async function load() {
    setLoading(true)
    try {
      const data = await api<{ ok: boolean; items: Announcement[]; emailAudience?: number }>("/api/v1/admin/platform/delivery-announcements")
      setItems(Array.isArray(data.items) ? data.items : [])
      setEmailAudience(Number(data.emailAudience || 0))
      setError(null)
    } catch (err: any) {
      setError(err?.message || "Nu am putut încărca noutățile.")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { void load() }, [])

  function edit(item: Announcement) {
    setEditingId(item.id)
    setForm({ title: item.title, body: item.body, isPublished: item.isPublished, sendEmail: item.sendEmail, expiresAt: localDateTime(item.expiresAt) })
    setMessage(null)
  }

  async function save() {
    if (form.title.trim().length < 3 || form.body.trim().length < 3) {
      setError("Completează un titlu și mesajul pentru client.")
      return
    }
    setSaving(true)
    setError(null)
    try {
      await api(editingId ? `/api/v1/admin/platform/delivery-announcements/${editingId}` : "/api/v1/admin/platform/delivery-announcements", {
        method: editingId ? "PATCH" : "POST",
        body: JSON.stringify({
          title: form.title.trim(),
          body: form.body.trim(),
          isPublished: form.isPublished,
          sendEmail: form.sendEmail,
          expiresAt: form.expiresAt ? new Date(form.expiresAt).toISOString() : null,
        }),
      })
      setForm(emptyForm)
      setEditingId(null)
      setMessage(editingId ? "Noutatea a fost actualizată." : form.sendEmail && form.isPublished ? "Noutatea a fost publicată; emailurile sunt trimise în fundal." : "Noutatea a fost publicată în Gufo Delivery.")
      await load()
    } catch (err: any) {
      setError(err?.message || "Nu am putut salva noutatea.")
    } finally {
      setSaving(false)
    }
  }

  async function remove(id: string) {
    if (!window.confirm("Ștergi această noutate din Gufo Delivery?")) return
    try {
      await api(`/api/v1/admin/platform/delivery-announcements/${id}`, { method: "DELETE" })
      if (editingId === id) { setEditingId(null); setForm(emptyForm) }
      setMessage("Noutatea a fost ștearsă.")
      await load()
    } catch (err: any) {
      setError(err?.message || "Nu am putut șterge noutatea.")
    }
  }

  return (
    <div className="space-y-4">
      <section className="border border-[#2b2c33] bg-[#34353d] px-4 py-4 text-white shadow-sm">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <div className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-[0.14em] text-[#f0ad3d]"><Megaphone size={14} /> Gufo Delivery / Comunicare</div>
            <h1 className="mt-1 text-2xl font-semibold tracking-tight">Anunțuri delivery</h1>
            <p className="mt-1 max-w-2xl text-sm text-slate-300">Mesaje în aplicație și emailuri opționale pentru clienții Gufo Delivery.</p>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <div className="border border-white/15 px-3 py-2 text-sm"><span className="text-slate-300">Publicate </span><span className="font-semibold">{items.filter((item) => item.isPublished).length}</span></div>
            <div className="border border-white/15 px-3 py-2 text-sm"><span className="text-slate-300">Audiență email </span><span className="font-semibold">{emailAudience}</span></div>
            <button type="button" onClick={() => void load()} disabled={loading || saving} className="inline-flex items-center gap-2 border border-white/20 bg-white/10 px-3 py-2 text-sm font-medium transition hover:bg-white/20 disabled:opacity-60"><RefreshCw size={15} /> Reîncarcă</button>
            <button type="button" onClick={() => { setEditingId(null); setForm(emptyForm); setError(null); setMessage(null) }} className="inline-flex items-center gap-2 bg-[#e7981f] px-3 py-2 text-sm font-semibold text-slate-950"><Plus size={15} /> Anunț nou</button>
          </div>
        </div>
      </section>

      {error ? <div className="rounded-[20px] border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">{error}</div> : null}
      {message ? <div className="rounded-[20px] border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">{message}</div> : null}

      <section className="border border-slate-200 bg-white p-4 shadow-sm">
        <div className="flex items-center justify-between gap-3"><div><div className="text-[11px] font-bold uppercase tracking-[0.14em] text-slate-400">Editor anunț</div><div className="mt-1 text-lg font-semibold text-slate-950">{editingId ? "Editează anunțul" : "Anunț nou"}</div></div>{editingId ? <button type="button" onClick={() => { setEditingId(null); setForm(emptyForm) }} className="border border-slate-200 px-3 py-2 text-sm font-medium text-slate-600">Anulează editarea</button> : null}</div>
        <div className="mt-4 grid grid-cols-1 gap-4 xl:grid-cols-2">
          <label className="space-y-2 text-sm font-medium text-slate-700"><span>Titlu</span><input value={form.title} onChange={(e) => setForm((prev) => ({ ...prev, title: e.target.value }))} maxLength={120} className="h-10 w-full border border-slate-200 bg-slate-50 px-3 outline-none focus:border-[#17324D] focus:bg-white" placeholder="De exemplu: Meniul de toamnă a sosit" /></label>
          <label className="space-y-2 text-sm font-medium text-slate-700"><span>Expiră la (opțional)</span><input type="datetime-local" value={form.expiresAt} onChange={(e) => setForm((prev) => ({ ...prev, expiresAt: e.target.value }))} className="h-10 w-full border border-slate-200 bg-slate-50 px-3 outline-none focus:border-[#17324D] focus:bg-white" /></label>
          <label className="space-y-2 text-sm font-medium text-slate-700 xl:col-span-2"><span>Mesaj</span><textarea value={form.body} onChange={(e) => setForm((prev) => ({ ...prev, body: e.target.value }))} maxLength={1200} rows={4} className="w-full border border-slate-200 bg-slate-50 px-3 py-3 outline-none focus:border-[#17324D] focus:bg-white" placeholder="Scrie mesajul care apare pentru clienți..." /></label>
        </div>
        <div className="mt-4 flex flex-wrap items-center justify-between gap-3 border-t border-slate-100 pt-4"><div className="flex flex-col gap-2"><label className="flex items-center gap-2 text-sm font-medium text-slate-700"><input type="checkbox" checked={form.isPublished} onChange={(e) => setForm((prev) => ({ ...prev, isPublished: e.target.checked }))} /> Publică imediat</label><label className="flex items-start gap-2 text-sm font-medium text-slate-700"><input type="checkbox" checked={form.sendEmail} onChange={(e) => setForm((prev) => ({ ...prev, sendEmail: e.target.checked }))} className="mt-1" /> <span><span className="flex items-center gap-1"><Mail size={15} /> Trimite și email clienților</span><span className="block text-xs font-normal text-slate-500">Doar când publici; audiență curentă: {emailAudience} conturi active cu email.</span></span></label></div><button type="button" onClick={save} disabled={saving} className="inline-flex items-center gap-2 bg-[#17324D] px-4 py-2.5 text-sm font-semibold text-white disabled:opacity-60"><Send size={16} />{saving ? "Se salvează..." : editingId ? "Salvează modificările" : "Publică anunțul"}</button></div>
      </section>

      <section className="border border-slate-200 bg-white p-4 shadow-sm">
        <div className="mb-3"><div className="text-[11px] font-bold uppercase tracking-[0.14em] text-slate-400">Arhivă comunicare</div><div className="mt-1 text-lg font-semibold text-slate-950">Istoric anunțuri</div></div>
        <div className="space-y-3">
          {loading ? <div className="py-8 text-center text-sm text-slate-500">Se încarcă...</div> : null}
          {!loading && !items.length ? <div className="border border-dashed border-slate-200 bg-slate-50 px-4 py-8 text-center text-sm text-slate-500">Nu ai publicat încă niciun anunț.</div> : null}
          {items.map((item) => <article key={item.id} className="flex flex-col gap-3 border border-slate-200 bg-slate-50 p-3 lg:flex-row lg:items-start lg:justify-between"><div><div className="flex flex-wrap items-center gap-2"><h2 className="font-semibold text-slate-950">{item.title}</h2><span className={item.isPublished ? "bg-emerald-100 px-2 py-0.5 text-xs font-semibold text-emerald-700" : "bg-slate-200 px-2 py-0.5 text-xs font-semibold text-slate-600"}>{item.isPublished ? "Publicat" : "Ciornă"}</span>{item.sendEmail ? <span className="inline-flex items-center gap-1 bg-sky-100 px-2 py-0.5 text-xs font-semibold text-sky-700"><Mail size={12} /> Email</span> : null}</div><p className="mt-2 whitespace-pre-wrap text-sm leading-6 text-slate-600">{item.body}</p><div className="mt-3 text-xs text-slate-500">Citit de {item._count?.reads || 0} clienți{item.sendEmail ? ` · email: ${item.emailRecipientCount || 0} destinatari${item.emailFailureCount ? `, ${item.emailFailureCount} eșuate` : ""}` : ""}{item.expiresAt ? ` · expiră ${new Date(item.expiresAt).toLocaleString("ro-RO")}` : ""}</div></div><div className="flex gap-2"><button type="button" onClick={() => edit(item)} className="border border-slate-200 bg-white p-2 text-slate-600"><Pencil size={16} /></button><button type="button" onClick={() => remove(item.id)} className="border border-rose-200 bg-white p-2 text-rose-600"><Trash2 size={16} /></button></div></article>)}
        </div>
      </section>
    </div>
  )
}
