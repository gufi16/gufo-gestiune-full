import { useEffect, useMemo, useState, type ReactNode } from "react"
import {
  Activity,
  ArrowRight,
  Building2,
  CheckCircle2,
  CircleAlert,
  CreditCard,
  Database,
  HardDriveDownload,
  PlugZap,
  RefreshCw,
  Server,
  ShieldAlert,
  ShieldCheck,
  Store,
  Users,
} from "lucide-react"
import { Link, useLocation } from "react-router-dom"
import { api } from "../../lib/api"
import { formatAuditDateTime, getAuditActionLabel, getAuditArea } from "../../lib/auditFormat"

type OverviewResponse = {
  ok?: boolean
  item?: {
    metrics?: { tenants?: number; activeTenants?: number; suspendedTenants?: number; expiredTenants?: number; users?: number; locations?: number; terminals?: number; protectedTenants?: number; riskyTenants?: number }
    platform?: { efacturaConfigured?: boolean; efacturaEnvironment?: string }
    expiringLicenses?: Array<{ id: string; name: string; status: string; expiresAt?: string | null; subdomain?: string | null; portalUrl?: string | null }>
    backupRisks?: Array<{ id: string; name: string; status: string; backupStatus: string; latestBackupAt?: string | null; backupsCount?: number; portalUrl?: string | null }>
    subscriptionAlerts?: Array<{ id: string; tenantId: string; clientName: string; status: string; billingStatus: string; billingCycle?: string; price?: number; currency?: string; nextBillingDate?: string | null; plan?: { id: string; code: string; name: string } | null }>
    recentAuditLogs?: Array<{ id: string; tenantId?: string | null; actorType?: string; actorId?: string | null; action: string; entityType: string; entityId?: string | null; createdAt: string }>
    recentBackups?: Array<{ id: string; tenantId: string; clientName: string; label?: string | null; fileName: string; fileSizeBytes?: number; createdAt: string }>
  }
}

type Mode = "overview" | "licenses" | "billing" | "audit"

function formatDate(value?: string | null) {
  if (!value) return "-"
  const date = new Date(value)
  return Number.isNaN(date.getTime()) ? "-" : date.toLocaleDateString("ro-RO", { day: "2-digit", month: "2-digit", year: "numeric" })
}

function formatDateTime(value?: string | null) {
  if (!value) return "-"
  const date = new Date(value)
  return Number.isNaN(date.getTime()) ? "-" : date.toLocaleString("ro-RO", { day: "2-digit", month: "2-digit", year: "numeric", hour: "2-digit", minute: "2-digit" })
}

function formatBytes(value?: number) {
  const size = Number(value || 0)
  if (!Number.isFinite(size) || size <= 0) return "0 B"
  if (size < 1024) return `${size} B`
  if (size < 1024 * 1024) return `${(size / 1024).toFixed(1)} KB`
  return `${(size / (1024 * 1024)).toFixed(1)} MB`
}

function Status({ tone, children }: { tone: "good" | "warn" | "bad" | "neutral"; children: ReactNode }) {
  const theme = tone === "good" ? "border-emerald-200 bg-emerald-50 text-emerald-700" : tone === "warn" ? "border-amber-200 bg-amber-50 text-amber-800" : tone === "bad" ? "border-rose-200 bg-rose-50 text-rose-700" : "border-slate-200 bg-slate-50 text-slate-600"
  return <span className={`inline-flex rounded-md border px-2 py-1 text-[11px] font-bold ${theme}`}>{children}</span>
}

function Metric({ label, value, helper, icon, tone = "neutral", to }: { label: string; value: string | number; helper: string; icon: ReactNode; tone?: "good" | "warn" | "bad" | "neutral"; to?: string }) {
  const accent = tone === "good" ? "border-emerald-200" : tone === "warn" ? "border-amber-200" : tone === "bad" ? "border-rose-200" : "border-slate-200"
  const content = <><div className="flex items-center justify-between gap-3"><div className="text-[10px] font-bold uppercase tracking-[0.14em] text-slate-400">{label}</div><span className="text-slate-400">{icon}</span></div><div className="mt-2 text-2xl font-bold tracking-tight text-slate-900">{value}</div><div className="mt-1 flex items-center justify-between gap-2 text-xs text-slate-500"><span className="truncate">{helper}</span>{to ? <ArrowRight size={13} className="shrink-0 text-slate-400" /> : null}</div></>
  return to ? <Link to={to} className={`block border bg-white px-4 py-3 shadow-sm transition hover:-translate-y-0.5 hover:border-[#17324D] hover:shadow-md ${accent}`}>{content}</Link> : <div className={`border bg-white px-4 py-3 shadow-sm ${accent}`}>{content}</div>
}

function Section({ title, description, action, children }: { title: string; description: string; action?: ReactNode; children: ReactNode }) {
  return <section className="border border-slate-200 bg-white shadow-sm"><div className="flex flex-wrap items-start justify-between gap-3 border-b border-slate-200 px-4 py-3"><div><h2 className="text-sm font-bold text-slate-900">{title}</h2><p className="mt-0.5 text-xs text-slate-500">{description}</p></div>{action}</div>{children}</section>
}

function getMode(pathname: string): Mode {
  if (pathname.endsWith("/licente")) return "licenses"
  if (pathname.endsWith("/facturare")) return "billing"
  if (pathname.endsWith("/audit")) return "audit"
  return "overview"
}

export default function ControlPanelDashboard() {
  const location = useLocation()
  const [data, setData] = useState<OverviewResponse["item"] | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const mode = getMode(location.pathname)

  async function load() {
    try {
      setLoading(true)
      setError(null)
      const response = await api<OverviewResponse>("/api/v1/admin/platform/overview")
      setData(response?.item || null)
    } catch (err: any) {
      setError(err?.message || "Nu am putut incarca centrul de control.")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { void load() }, [])

  const metrics = data?.metrics || {}
  const expiringLicenses = data?.expiringLicenses || []
  const backupRisks = data?.backupRisks || []
  const subscriptionAlerts = data?.subscriptionAlerts || []
  const recentAuditLogs = data?.recentAuditLogs || []
  const recentBackups = data?.recentBackups || []
  const totalAlerts = backupRisks.length + expiringLicenses.length + subscriptionAlerts.length
  const title = mode === "licenses" ? "Licente si acces" : mode === "billing" ? "Facturare si abonamente" : mode === "audit" ? "Evenimente si audit" : "Tablou de bord"
  const subtitle = mode === "licenses" ? "Expirari, suspendari si drepturi de folosire pe fiecare client." : mode === "billing" ? "Scadente si abonamente care necesita interventie." : mode === "audit" ? "Urmarire operationala si istoricul actiunilor din ultimele 24 de ore." : "Starea live a clientilor, platformei si operatiunilor care necesita atentie."

  const alertRows = useMemo(() => [
    ...backupRisks.map((item) => ({ id: `backup-${item.id}`, category: "BACKUP", title: item.name, detail: item.latestBackupAt ? `Ultimul backup: ${formatDateTime(item.latestBackupAt)}` : "Nu exista backup valid", tone: "bad" as const, href: `/control-panel/clienti/${item.id}` })),
    ...expiringLicenses.map((item) => ({ id: `license-${item.id}`, category: "LICENTA", title: item.name, detail: `Expira la ${formatDate(item.expiresAt)}`, tone: "warn" as const, href: `/control-panel/clienti/${item.id}` })),
    ...subscriptionAlerts.map((item) => ({ id: `billing-${item.id}`, category: "PLATA", title: item.clientName, detail: `Scadenta ${formatDate(item.nextBillingDate)} · ${item.billingStatus}`, tone: "warn" as const, href: `/control-panel/clienti/${item.tenantId}` })),
  ], [backupRisks, expiringLicenses, subscriptionAlerts])

  return (
    <div className="space-y-4">
      <section className="border border-[#2b2c33] bg-[#34353d] px-4 py-4 text-white shadow-sm">
        <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
          <div><div className="text-[10px] font-bold uppercase tracking-[0.18em] text-slate-400">Gufo Control / {mode === "overview" ? "Operare" : title}</div><h1 className="mt-1 text-2xl font-bold tracking-tight">{title}</h1><p className="mt-1 text-sm text-slate-300">{subtitle}</p></div>
          <div className="flex flex-wrap gap-2"><Link to="/control-panel/clienti" className="inline-flex items-center gap-2 border border-white/15 bg-white/5 px-3 py-2 text-xs font-bold text-white hover:bg-white/10"><Building2 size={14} />Clienti</Link><Link to="/control-panel/audit" className="inline-flex items-center gap-2 border border-white/15 bg-white/5 px-3 py-2 text-xs font-bold text-white hover:bg-white/10"><Activity size={14} />Audit</Link><button type="button" disabled={loading} onClick={() => void load()} className="inline-flex items-center gap-2 bg-[#f39c12] px-3 py-2 text-xs font-bold text-[#292a31] hover:bg-[#ffad2b] disabled:cursor-not-allowed disabled:opacity-60"><RefreshCw size={14} className={loading ? "animate-spin" : ""} />{loading ? "Se incarca..." : "Reincarca"}</button></div>
        </div>
      </section>

      {error ? <div className="border border-rose-200 bg-rose-50 px-4 py-3 text-sm font-medium text-rose-700">{error}</div> : null}

      {mode === "overview" ? <>
        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-6">
          <Metric label="Clienti" value={loading ? "..." : Number(metrics.tenants || 0)} helper={`${Number(metrics.activeTenants || 0)} activi`} icon={<Building2 size={16} />} to="/control-panel/clienti" />
          <Metric label="Alerte" value={loading ? "..." : totalAlerts} helper="backup, licente, plati" icon={<CircleAlert size={16} />} tone={totalAlerts ? "warn" : "good"} to="/control-panel/audit" />
          <Metric label="Backup valid" value={loading ? "..." : `${Number(metrics.protectedTenants || 0)}/${Number(metrics.tenants || 0)}`} helper="clienti protejati" icon={<Database size={16} />} tone={Number(metrics.riskyTenants || 0) ? "warn" : "good"} to="/control-panel/clienti" />
          <Metric label="Device-uri" value={loading ? "..." : Number(metrics.terminals || 0)} helper="POS, KDS, Go, Kiosk" icon={<Server size={16} />} to="/control-panel/clienti" />
          <Metric label="Locatii" value={loading ? "..." : Number(metrics.locations || 0)} helper="active in ERP" icon={<Store size={16} />} to="/control-panel/clienti" />
          <Metric label="Utilizatori" value={loading ? "..." : Number(metrics.users || 0)} helper="conturi active" icon={<Users size={16} />} to="/control-panel/clienti" />
        </div>

        <div className="grid gap-4 xl:grid-cols-[1.35fr_0.85fr]">
          <Section title="Necesita interventie" description="Ordoneaza ce trebuie verificat inainte sa afecteze un client." action={<Link to="/control-panel/clienti" className="inline-flex items-center gap-1 text-xs font-bold text-[#17324D]">Vezi clienti <ArrowRight size={13} /></Link>}>
            <div className="divide-y divide-slate-100">{alertRows.slice(0, 8).map((item) => <Link key={item.id} to={item.href} className="flex items-center gap-3 px-4 py-3 transition hover:bg-slate-50"><Status tone={item.tone}>{item.category}</Status><div className="min-w-0 flex-1"><div className="truncate text-sm font-bold text-slate-800">{item.title}</div><div className="mt-0.5 truncate text-xs text-slate-500">{item.detail}</div></div><ArrowRight size={15} className="text-slate-300" /></Link>)}{!loading && !alertRows.length ? <div className="px-4 py-10 text-center text-sm text-emerald-700"><CheckCircle2 className="mx-auto mb-2" size={20} />Nu exista alerte operationale.</div> : null}</div>
          </Section>
          <div className="space-y-4">
            <Section title="Sanatatea platformei" description="Servicii centrale care influenteaza toti clientii."><div className="divide-y divide-slate-100"><div className="flex items-center justify-between gap-3 px-4 py-3"><div><div className="text-sm font-bold text-slate-800">API si baza de date</div><div className="mt-0.5 text-xs text-slate-500">Datele de overview au fost incarcate cu succes.</div></div><Status tone={error ? "bad" : "good"}>{error ? "Eroare" : "Online"}</Status></div><div className="flex items-center justify-between gap-3 px-4 py-3"><div><div className="text-sm font-bold text-slate-800">ANAF e-Factura</div><div className="mt-0.5 text-xs text-slate-500">Mediu {data?.platform?.efacturaEnvironment === "prod" ? "Productie" : "Test"}</div></div><Status tone={data?.platform?.efacturaConfigured ? "good" : "warn"}>{data?.platform?.efacturaConfigured ? "Configurat" : "Lipsa config"}</Status></div></div></Section>
            <Section title="Acces rapid" description="Configurari frecvente ale platformei."><div className="grid grid-cols-2 gap-px bg-slate-200"><Link to="/control-panel/integrari" className="bg-white px-4 py-4 text-sm font-bold text-slate-700 hover:bg-slate-50"><PlugZap size={16} className="mb-2 text-[#17324D]" />Integrari</Link><Link to="/control-panel/licente" className="bg-white px-4 py-4 text-sm font-bold text-slate-700 hover:bg-slate-50"><ShieldCheck size={16} className="mb-2 text-[#17324D]" />Licente</Link><Link to="/control-panel/facturare" className="bg-white px-4 py-4 text-sm font-bold text-slate-700 hover:bg-slate-50"><CreditCard size={16} className="mb-2 text-[#17324D]" />Facturare</Link><Link to="/control-panel/audit" className="bg-white px-4 py-4 text-sm font-bold text-slate-700 hover:bg-slate-50"><Activity size={16} className="mb-2 text-[#17324D]" />Audit</Link></div></Section>
          </div>
        </div>
      </> : null}

      {mode === "licenses" ? <div className="grid gap-4 xl:grid-cols-[0.75fr_1.25fr]"><Section title="Status licente" description="Imagine rapida asupra accesului clientilor."><div className="grid grid-cols-2 gap-px bg-slate-200 sm:grid-cols-4"><div className="bg-white px-4 py-4"><div className="text-[10px] font-bold uppercase text-slate-400">Active</div><div className="mt-1 text-2xl font-bold">{loading ? "..." : Number(metrics.activeTenants || 0)}</div></div><div className="bg-white px-4 py-4"><div className="text-[10px] font-bold uppercase text-slate-400">Suspendate</div><div className="mt-1 text-2xl font-bold text-amber-700">{loading ? "..." : Number(metrics.suspendedTenants || 0)}</div></div><div className="bg-white px-4 py-4"><div className="text-[10px] font-bold uppercase text-slate-400">Expirate</div><div className="mt-1 text-2xl font-bold text-rose-700">{loading ? "..." : Number(metrics.expiredTenants || 0)}</div></div><div className="bg-white px-4 py-4"><div className="text-[10px] font-bold uppercase text-slate-400">Urmeaza</div><div className="mt-1 text-2xl font-bold text-amber-700">{loading ? "..." : expiringLicenses.length}</div></div></div></Section><Section title="Licente care expira" description="Intra direct in client pentru prelungire sau modificare module."><div className="divide-y divide-slate-100">{expiringLicenses.map((item) => <Link key={item.id} to={`/control-panel/clienti/${item.id}`} className="flex items-center gap-3 px-4 py-3 hover:bg-slate-50"><ShieldAlert size={17} className="text-amber-500" /><div className="min-w-0 flex-1"><div className="truncate text-sm font-bold">{item.name}</div><div className="text-xs text-slate-500">Expira la {formatDate(item.expiresAt)}</div></div><Status tone="warn">Atentie</Status></Link>)}{!loading && !expiringLicenses.length ? <div className="px-4 py-10 text-center text-sm text-emerald-700">Nu exista expirari apropiate.</div> : null}</div></Section></div> : null}

      {mode === "billing" ? <Section title="Abonamente de verificat" description="Statusul comercial este separat de drepturile tehnice ale licentei." action={<div className="flex gap-3"><Link to="/control-panel/facturare/date-emitent" className="text-xs font-bold text-[#17324D]">Date emitent</Link><Link to="/control-panel/clienti" className="text-xs font-bold text-[#17324D]">Deschide clienti</Link></div>}><div className="divide-y divide-slate-100">{subscriptionAlerts.map((item) => <Link key={item.id} to={`/control-panel/clienti/${item.tenantId}`} className="grid gap-3 px-4 py-3 md:grid-cols-[minmax(0,1fr)_160px_150px_100px] md:items-center hover:bg-slate-50"><div className="min-w-0"><div className="truncate text-sm font-bold">{item.clientName}</div><div className="truncate text-xs text-slate-500">{item.plan?.name || "Fara plan"}</div></div><div className="text-sm font-semibold text-slate-700">{Number(item.price || 0).toLocaleString("ro-RO")} {item.currency || "RON"}</div><div className="text-xs text-slate-500">Scadenta {formatDate(item.nextBillingDate)}</div><Status tone={item.billingStatus === "OK" ? "warn" : "bad"}>{item.billingStatus}</Status></Link>)}{!loading && !subscriptionAlerts.length ? <div className="px-4 py-10 text-center text-sm text-emerald-700">Nu exista abonamente cu risc.</div> : null}</div></Section> : null}

      {mode === "audit" ? <div className="grid gap-4 xl:grid-cols-[1.25fr_0.75fr]"><Section title="Activitate recenta" description="Actiuni inregistrate in ultimele 24 de ore."><div className="divide-y divide-slate-100">{recentAuditLogs.map((entry) => <div key={entry.id} className="flex items-start gap-3 px-4 py-3"><Activity size={16} className="mt-0.5 text-slate-400" /><div className="min-w-0 flex-1"><div className="text-sm font-bold text-slate-800">{getAuditActionLabel(entry as never)}</div><div className="mt-0.5 text-xs text-slate-500">{getAuditArea(entry as never)} · {formatAuditDateTime(entry.createdAt)}</div></div></div>)}{!loading && !recentAuditLogs.length ? <div className="px-4 py-10 text-center text-sm text-slate-500">Nu exista evenimente recente.</div> : null}</div></Section><Section title="Backup-uri recente" description="Ultimele snapshot-uri create."><div className="divide-y divide-slate-100">{recentBackups.map((item) => <div key={item.id} className="flex items-start gap-3 px-4 py-3"><HardDriveDownload size={16} className="mt-0.5 text-slate-400" /><div className="min-w-0 flex-1"><div className="truncate text-sm font-bold text-slate-800">{item.clientName}</div><div className="truncate text-xs text-slate-500">{item.label || item.fileName}</div></div><div className="text-right text-[11px] text-slate-500"><div>{formatBytes(item.fileSizeBytes)}</div><div>{formatDateTime(item.createdAt)}</div></div></div>)}{!loading && !recentBackups.length ? <div className="px-4 py-10 text-center text-sm text-slate-500">Nu exista backup-uri recente.</div> : null}</div></Section></div> : null}
    </div>
  )
}
