import { useEffect, useState } from "react"
import { CircleAlert, CircleCheckBig, PlugZap, RefreshCw, Save, Server, ShieldCheck } from "lucide-react"
import { api } from "../../lib/api"

type PlatformEFacturaResponse = {
  ok?: boolean
  item?: {
    efacturaOauthClientId?: string
    efacturaOauthClientSecret?: string
    efacturaOauthRedirectUri?: string
    efacturaEnvironment?: string
    configured?: boolean
  }
}

type FormState = {
  efacturaOauthClientId: string
  efacturaOauthClientSecret: string
  efacturaOauthRedirectUri: string
  efacturaEnvironment: string
}

const emptyForm: FormState = {
  efacturaOauthClientId: "",
  efacturaOauthClientSecret: "",
  efacturaOauthRedirectUri: "",
  efacturaEnvironment: "test",
}

export default function ControlPanelIntegrations() {
  const [form, setForm] = useState<FormState>(emptyForm)
  const [configured, setConfigured] = useState(false)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [message, setMessage] = useState<string | null>(null)

  async function load() {
    try {
      setLoading(true)
      setError(null)
      const data = await api<PlatformEFacturaResponse>("/api/v1/admin/platform/efactura")
      setForm({
        efacturaOauthClientId: data?.item?.efacturaOauthClientId || "",
        efacturaOauthClientSecret: data?.item?.efacturaOauthClientSecret || "",
        efacturaOauthRedirectUri: data?.item?.efacturaOauthRedirectUri || "",
        efacturaEnvironment: data?.item?.efacturaEnvironment || "test",
      })
      setConfigured(Boolean(data?.item?.configured))
    } catch (err: any) {
      setError(err?.message || "Nu am putut incarca integrarea ANAF.")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    load()
  }, [])

  async function save() {
    try {
      setSaving(true)
      setError(null)
      setMessage(null)
      const data = await api<PlatformEFacturaResponse>("/api/v1/admin/platform/efactura", {
        method: "POST",
        body: JSON.stringify(form),
      })
      setConfigured(Boolean(data?.item?.configured))
      setMessage("Setarile au fost salvate.")
    } catch (err: any) {
      setError(err?.message || "Nu am putut salva setarile.")
    } finally {
      setSaving(false)
    }
  }

  function update<K extends keyof FormState>(key: K, value: FormState[K]) {
    setForm((prev) => ({ ...prev, [key]: value }))
  }

  return (
    <div className="space-y-4">
      <section className="border border-[#2b2c33] bg-[#34353d] px-4 py-4 text-white shadow-sm">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <div className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-[0.14em] text-[#f0ad3d]">
              <PlugZap size={14} />
              Platforma / Integrari
            </div>
            <h1 className="mt-1 text-2xl font-semibold tracking-tight">ANAF e-Factura</h1>
            <p className="mt-1 text-sm text-slate-300">Credentialele globale pentru conectarea firmelor din platforma la serviciile ANAF.</p>
          </div>

          <div className="grid border border-white/15 sm:grid-cols-2">
            <div className="flex items-center gap-2 border-b border-white/15 px-3 py-2 text-sm sm:border-b-0 sm:border-r">
              {configured ? <CircleCheckBig size={16} className="text-emerald-400" /> : <CircleAlert size={16} className="text-amber-300" />}
              <span className="text-slate-300">Conectare</span><span className="font-semibold">{configured ? "Configurata" : "Neconfigurata"}</span>
            </div>
            <div className="flex items-center gap-2 px-3 py-2 text-sm"><Server size={16} className="text-slate-300" /><span className="text-slate-300">Mediu</span><span className="font-semibold">{form.efacturaEnvironment === "prod" ? "Productie" : "Test"}</span>
            </div>
          </div>
        </div>
      </section>

      {error ? <div className="rounded-[22px] border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">{error}</div> : null}
      {message ? <div className="rounded-[22px] border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">{message}</div> : null}

      <section className="border border-slate-200 bg-white p-4 shadow-sm">
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-[0.14em] text-slate-500">
            <ShieldCheck size={14} />
            Configurare
          </div>

          <div className="flex gap-2">
            <button
              type="button"
              onClick={load}
              disabled={loading || saving}
              className="inline-flex items-center gap-2 border border-slate-200 bg-white px-3 py-2 text-sm font-medium text-slate-700"
            >
              <RefreshCw size={15} />
              Reincarca
            </button>
            <button
              type="button"
              onClick={save}
              disabled={loading || saving}
              className="inline-flex items-center gap-2 bg-[#17324D] px-4 py-2 text-sm font-semibold text-white disabled:opacity-60"
            >
              <Save size={15} />
              {saving ? "Se salveaza..." : "Salveaza"}
            </button>
          </div>
        </div>

        <div className="mt-5 grid grid-cols-1 gap-4 xl:grid-cols-2">
          <label className="space-y-2 text-sm text-slate-700">
            <span className="font-medium">Client ID</span>
            <input
              value={form.efacturaOauthClientId}
              onChange={(e) => update("efacturaOauthClientId", e.target.value)}
              className="h-10 w-full border border-slate-200 bg-slate-50 px-3 text-sm text-slate-700 outline-none focus:border-[#17324D] focus:bg-white"
              placeholder="Client ID"
            />
          </label>

          <label className="space-y-2 text-sm text-slate-700">
            <span className="font-medium">Client Secret</span>
            <input
              type="password"
              value={form.efacturaOauthClientSecret}
              onChange={(e) => update("efacturaOauthClientSecret", e.target.value)}
              className="h-10 w-full border border-slate-200 bg-slate-50 px-3 text-sm text-slate-700 outline-none focus:border-[#17324D] focus:bg-white"
              placeholder="Client Secret"
            />
          </label>

          <label className="space-y-2 text-sm text-slate-700 xl:col-span-2">
            <span className="font-medium">Redirect URI</span>
            <input
              value={form.efacturaOauthRedirectUri}
              onChange={(e) => update("efacturaOauthRedirectUri", e.target.value)}
              className="h-10 w-full border border-slate-200 bg-slate-50 px-3 text-sm text-slate-700 outline-none focus:border-[#17324D] focus:bg-white"
              placeholder="https://api.gufo.ink/api/v1/company/efactura/oauth/callback"
            />
          </label>

          <label className="space-y-2 text-sm text-slate-700">
            <span className="font-medium">Mediu</span>
            <select
              value={form.efacturaEnvironment}
              onChange={(e) => update("efacturaEnvironment", e.target.value)}
              className="h-10 w-full border border-slate-200 bg-slate-50 px-3 text-sm text-slate-700 outline-none focus:border-[#17324D] focus:bg-white"
            >
              <option value="test">Test</option>
              <option value="prod">Productie</option>
            </select>
          </label>
        </div>
      </section>
    </div>
  )
}
