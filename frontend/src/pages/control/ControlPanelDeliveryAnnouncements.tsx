import { useEffect, useState } from "react"
import { Mail, Megaphone, Pencil, Plus, Trash2 } from "lucide-react"
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
      <section className="rounded-[28px] border border-slate-200 bg-white px-5 py-5 shadow-sm">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full border border-emerald-100 bg-emerald-50 px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] text-emerald-700"><Megaphone size={14} /> Gufo Delivery</div>
            <h1 className="mt-3 text-3xl font-semibold tracking-tight text-slate-950">Noutăți pentru clienți</h1>
            <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-500">Comunici central în aplicație: promoții, lansări, mentenanță sau informații utile. Clienții văd mesajul în clopoțelul din Gufo Delivery, iar emailul este opțional.</p>
          </div>
          <div className="rounded-[20px] border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-600">Publicate: <span className="font-semibold text-slate-950">{items.filter((item) => item.isPublished).length}</span></div>
        </div>
      </section>

      {error ? <div className="rounded-[20px] border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">{error}</div> : null}
      {message ? <div className="rounded-[20px] border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">{message}</div> : null}

      <section className="rounded-[28px] border border-slate-200 bg-white p-5 shadow-sm">
        <div className="flex items-center justify-between gap-3"><div className="text-lg font-semibold text-slate-950">{editingId ? "Editează noutatea" : "Noutate nouă"}</div>{editingId ? <button type="button" onClick={() => { setEditingId(null); setForm(emptyForm) }} className="text-sm font-medium text-slate-500">Anulează editarea</button> : null}</div>
        <div className="mt-4 grid grid-cols-1 gap-4 xl:grid-cols-2">
          <label className="space-y-2 text-sm font-medium text-slate-700"><span>Titlu</span><input value={form.title} onChange={(e) => setForm((prev) => ({ ...prev, title: e.target.value }))} maxLength={120} className="h-11 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 outline-none focus:border-emerald-500 focus:bg-white focus:ring-4 focus:ring-emerald-100" placeholder="De exemplu: Meniul de toamnă a sosit" /></label>
          <label className="space-y-2 text-sm font-medium text-slate-700"><span>Expiră la (opțional)</span><input type="datetime-local" value={form.expiresAt} onChange={(e) => setForm((prev) => ({ ...prev, expiresAt: e.target.value }))} className="h-11 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 outline-none focus:border-emerald-500 focus:bg-white focus:ring-4 focus:ring-emerald-100" /></label>
          <label className="space-y-2 text-sm font-medium text-slate-700 xl:col-span-2"><span>Mesaj</span><textarea value={form.body} onChange={(e) => setForm((prev) => ({ ...prev, body: e.target.value }))} maxLength={1200} rows={4} className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 outline-none focus:border-emerald-500 focus:bg-white focus:ring-4 focus:ring-emerald-100" placeholder="Scrie mesajul care apare pentru clienți..." /></label>
        </div>
        <div className="mt-4 flex flex-wrap items-center justify-between gap-3"><div className="flex flex-col gap-2"><label className="flex items-center gap-2 text-sm font-medium text-slate-700"><input type="checkbox" checked={form.isPublished} onChange={(e) => setForm((prev) => ({ ...prev, isPublished: e.target.checked }))} /> Publică imediat</label><label className="flex items-start gap-2 text-sm font-medium text-slate-700"><input type="checkbox" checked={form.sendEmail} onChange={(e) => setForm((prev) => ({ ...prev, sendEmail: e.target.checked }))} className="mt-1" /> <span><span className="flex items-center gap-1"><Mail size={15} /> Trimite și email clienților</span><span className="block text-xs font-normal text-slate-500">Doar când publici; audiență curentă: {emailAudience} conturi active cu email.</span></span></label></div><button type="button" onClick={save} disabled={saving} className="inline-flex items-center gap-2 rounded-2xl bg-[#17324D] px-5 py-3 text-sm font-semibold text-white disabled:opacity-60">{editingId ? <Pencil size={16} /> : <Plus size={16} />}{saving ? "Se salvează..." : editingId ? "Salvează modificările" : "Publică noutatea"}</button></div>
      </section>

      <section className="rounded-[28px] border border-slate-200 bg-white p-5 shadow-sm">
        <div className="mb-4 text-lg font-semibold text-slate-950">Istoric noutăți</div>
        <div className="space-y-3">
          {loading ? <div className="py-8 text-center text-sm text-slate-500">Se încarcă...</div> : null}
          {!loading && !items.length ? <div className="rounded-2xl bg-slate-50 px-4 py-8 text-center text-sm text-slate-500">Nu ai publicat încă nicio noutate.</div> : null}
          {items.map((item) => <article key={item.id} className="flex flex-col gap-3 rounded-[20px] border border-slate-200 bg-slate-50 p-4 lg:flex-row lg:items-start lg:justify-between"><div><div className="flex flex-wrap items-center gap-2"><h2 className="font-semibold text-slate-950">{item.title}</h2><span className={item.isPublished ? "rounded-full bg-emerald-100 px-2 py-0.5 text-xs font-semibold text-emerald-700" : "rounded-full bg-slate-200 px-2 py-0.5 text-xs font-semibold text-slate-600"}>{item.isPublished ? "Publicată" : "Ciornă"}</span>{item.sendEmail ? <span className="inline-flex items-center gap-1 rounded-full bg-sky-100 px-2 py-0.5 text-xs font-semibold text-sky-700"><Mail size={12} /> Email</span> : null}</div><p className="mt-2 whitespace-pre-wrap text-sm leading-6 text-slate-600">{item.body}</p><div className="mt-3 text-xs text-slate-500">Citită de {item._count?.reads || 0} clienți{item.sendEmail ? ` · email: ${item.emailRecipientCount || 0} destinatari${item.emailFailureCount ? `, ${item.emailFailureCount} eșuate` : ""}` : ""}{item.expiresAt ? ` · expiră ${new Date(item.expiresAt).toLocaleString("ro-RO")}` : ""}</div></div><div className="flex gap-2"><button type="button" onClick={() => edit(item)} className="rounded-xl border border-slate-200 bg-white p-2 text-slate-600"><Pencil size={16} /></button><button type="button" onClick={() => remove(item.id)} className="rounded-xl border border-rose-200 bg-white p-2 text-rose-600"><Trash2 size={16} /></button></div></article>)}
        </div>
      </section>
    </div>
  )
}
