import {
  Activity,
  AlertTriangle,
  ArrowRightLeft,
  BarChart3,
  Boxes,
  Check,
  Clock3,
  CircleDollarSign,
  CreditCard,
  FileText,
  FolderSymlink,
  PackagePlus,
  Receipt,
  ScanLine,
  Search,
  ShoppingCart,
  TrendingUp,
  PackageSearch,
} from "lucide-react"
import { useEffect, useMemo, useState } from "react"
import { useNavigate, useSearchParams } from "react-router-dom"
import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts"
import QuickActions from "../components/QuickActions"
import PosReceiptsView from "../components/PosReceiptsView"
import { API_BASE as API, getToken, authHeaders } from "../lib/api"
import { getActiveLocationId, subscribeToActiveLocation } from "../lib/location"
import { getActiveTerminalId, subscribeToActiveTerminal } from "../lib/terminal"
import { formatMoneyRo, formatQtyRo } from "../lib/format"


type GlobalStockItem = {
  productId?: string
  id?: string
  name?: string
  sku?: string
  uom?: string
  totalQty?: number
  qty?: number
}

type SalesPoint = {
  date: string
  label: string
  value: number
}

type DashboardApiResponse = {
  ok?: boolean
  sales?: number
  receipts?: number
  avgReceipt?: number
  cash?: number
  card?: number
  salesPerDay?: Array<{
    day: string
    total: number | string
  }>
  topProducts?: Array<{
    name: string
    qty: number | string
    profit?: number | string
  }>
  lowStock?: Array<{
    product: string
    location: string
    qty: number
  }>
  recentActivity?: RecentActivityItem[]
  updatedAt?: string
}

type LowStockItem = {
  product: string
  location: string
  qty: number
}

type TopProductItem = {
  name: string
  qty: number
  profit: number
}

type RecentActivityItem = {
  type: "sale" | "purchase" | "transfer" | "consumption" | "production" | "inventory" | "minutes"
  title: string
  meta: string
  at: string
}

type MeResponse = {
  ok?: boolean
  tenant_id?: string
  user_id?: string
  role?: string
  modules?: string[]
}

const DASHBOARD_REFRESH_MS = 15000

const ACTIVITY_ICON_MAP = {
  sale: Receipt,
  purchase: ShoppingCart,
  transfer: ArrowRightLeft,
  consumption: FileText,
  production: TrendingUp,
  inventory: PackageSearch,
  minutes: AlertTriangle,
} as const

function formatRon(value: number) {
  return formatMoneyRo(value, "RON")
}

function formatDisplayDate(value: string) {
  if (!value) return "-"
  const parts = value.slice(0, 10).split("-")
  if (parts.length !== 3) return value
  return `${parts[2]}.${parts[1]}.${parts[0]}`
}

function formatRangeLabel(dateFrom: string, dateTo: string) {
  return `${formatDisplayDate(dateFrom)} - ${formatDisplayDate(dateTo)}`
}

function toInputDate(value: Date) {
  const year = value.getFullYear()
  const month = `${value.getMonth() + 1}`.padStart(2, "0")
  const day = `${value.getDate()}`.padStart(2, "0")
  return `${year}-${month}-${day}`
}

function toChartLabel(dateString: string) {
  if (!dateString) return "-"
  const raw = dateString.slice(0, 10)
  const parts = raw.split("-")
  if (parts.length !== 3) return raw
  return `${parts[2]}.${parts[1]}`
}

function normalizeSalesPerDay(data: DashboardApiResponse["salesPerDay"]): SalesPoint[] {
  if (!Array.isArray(data)) return []

  return data.map((item) => {
    const rawDate = String(item.day || "").slice(0, 10)
    return {
      date: rawDate,
      label: toChartLabel(rawDate),
      value: Number(item.total || 0),
    }
  })
}

function formatRelativeTime(value: string) {
  if (!value) return "acum"

  const diffMs = Date.now() - new Date(value).getTime()
  if (!Number.isFinite(diffMs)) return "acum"

  const diffMinutes = Math.max(0, Math.round(diffMs / 60000))
  if (diffMinutes < 1) return "acum"
  if (diffMinutes < 60) return `acum ${diffMinutes} min`

  const diffHours = Math.round(diffMinutes / 60)
  if (diffHours < 24) return `acum ${diffHours} h`

  const diffDays = Math.round(diffHours / 24)
  return `acum ${diffDays} zile`
}

async function getTenantIdFromSession(token: string): Promise<string> {
  const storedTenantId =
    localStorage.getItem("tenant_id") ||
    localStorage.getItem("tenantId") ||
    ""

  if (storedTenantId) {
    return storedTenantId
  }

  const res = await fetch(`${API}/api/v1/me`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  })

  const data: MeResponse = await res.json().catch(() => ({}))

  if (!res.ok || !data?.ok || !data?.tenant_id) {
    throw new Error("Nu am putut determina tenant-ul din sesiunea curenta.")
  }

  localStorage.setItem("tenant_id", data.tenant_id)

  if (data.user_id) localStorage.setItem("user_id", data.user_id)
  if (data.role) localStorage.setItem("role", data.role)
  if (Array.isArray(data.modules)) {
    localStorage.setItem("modules", JSON.stringify(data.modules))
  }

  return data.tenant_id
}

function SalesChart({
  data,
  loading,
  total,
  average,
  cash,
  card,
  receipts,
}: {
  data: SalesPoint[]
  loading?: boolean
  total: number
  average: number
  cash: number
  card: number
  receipts: number
}) {
  const [hoveredIndex, setHoveredIndex] = useState<number>(data.length ? data.length - 1 : 0)
  const hovered = data[Math.min(hoveredIndex, Math.max(data.length - 1, 0))]
  const hasData = data.some((item) => item.value > 0)
  const chartData = data.map((item) => ({
    ...item,
    amount: Number(item.value || 0),
    average,
  }))

  return (
    <div className="dashboard-sales-panel flex h-full min-h-0 flex-col border border-[#d8e0e7] bg-white p-3 shadow-sm">
      <div className="mb-3 grid shrink-0 gap-2 xl:grid-cols-[1.35fr_1fr]">
        <div className="px-3 py-1 text-[#17324D]">
          <div className="flex items-center gap-2 text-[11px] font-bold uppercase tracking-[0.16em] text-slate-500">
            <span className="flex h-8 w-8 items-center justify-center bg-[#f39c12] text-white"><BarChart3 size={16} /></span>
            Vânzări pe interval
          </div>
          <div className="mt-2 text-[27px] font-bold tracking-tight text-slate-950">{formatRon(total)}</div>
          <div className="mt-0.5 text-xs text-slate-500">Totalul real al perioadei selectate</div>
        </div>
        <div className="grid grid-cols-3 gap-2">
          <div className="border border-[#edf0f3] bg-[#fafbfc] px-3 py-2">
            <div className="text-[10px] font-bold uppercase tracking-[0.12em] text-slate-500">Bonuri</div>
            <div className="mt-0.5 text-sm font-bold text-slate-900">{receipts}</div>
          </div>
          <div className="border border-[#edf0f3] bg-[#fafbfc] px-3 py-2">
            <div className="text-[10px] font-bold uppercase tracking-[0.12em] text-slate-500">Medie / zi</div>
            <div className="mt-0.5 text-sm font-bold text-slate-900">{formatRon(average)}</div>
          </div>
          <div className="border border-[#edf0f3] bg-[#fafbfc] px-3 py-2">
            <div className="text-[10px] font-bold uppercase tracking-[0.12em] text-slate-500">Cash / Card</div>
            <div className="mt-0.5 text-xs font-bold text-slate-900">{formatRon(cash)} / {formatRon(card)}</div>
          </div>
        </div>
      </div>

      <div className="relative min-h-0 flex-1 overflow-hidden border border-[#e6ebef] bg-white px-3 py-3">
        {!hasData && !loading ? (
          <div className="border border-dashed border-[#d8cbb9] bg-[#f8f3ea] px-4 py-4 text-center text-sm text-slate-500">
            Nu exista vanzari pentru intervalul selectat.
          </div>
        ) : null}

        {hasData ? (
          <>
            <div className="mb-2 flex items-center justify-between gap-3 text-[11px] font-semibold text-slate-500">
              <div className="flex items-center gap-3"><span className="inline-flex items-center gap-1.5"><i className="h-2 w-2 rounded-full bg-emerald-700" />Vânzări zilnice</span><span className="inline-flex items-center gap-1.5"><i className="h-0.5 w-3 bg-[#f39c12]" />Medie zilnică</span></div>
              {hovered ? <span>{hovered.label}: <strong className="text-slate-800">{formatRon(hovered.value)}</strong></span> : null}
            </div>

            <div className="h-[calc(100%-1.7rem)] border-t border-dashed border-slate-200 px-3 pt-2">
              <div className="h-full min-h-[155px]">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart
                    data={chartData}
                    margin={{ top: 12, right: 12, left: -18, bottom: 0 }}
                    onMouseMove={(state) => {
                      if (typeof state?.activeTooltipIndex === "number") {
                        setHoveredIndex(state.activeTooltipIndex)
                      }
                    }}
                  >
                    <defs>
                      <linearGradient id="dashboard-sales-area" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#20a486" stopOpacity={0.34} />
                        <stop offset="55%" stopColor="#20a486" stopOpacity={0.11} />
                        <stop offset="100%" stopColor="#20a486" stopOpacity={0.01} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid vertical={false} stroke="#dce5ea" strokeDasharray="3 5" />
                    <XAxis
                      dataKey="label"
                      axisLine={false}
                      tickLine={false}
                      tick={{ fill: "#728092", fontSize: 11, fontWeight: 600 }}
                    />
                    <YAxis
                      axisLine={false}
                      tickLine={false}
                      width={62}
                      tick={{ fill: "#8794a3", fontSize: 10 }}
                      tickFormatter={(value) => `${Math.round(Number(value || 0))}`}
                    />
                    <Tooltip
                      cursor={{ stroke: "#f39c12", strokeWidth: 1.5, strokeDasharray: "3 5" }}
                      content={({ active, payload, label }) => {
                        if (!active || !payload?.length) return null
                        const value = Number(payload[0]?.value || 0)
                        return (
                          <div className="rounded-[16px] border border-slate-200 bg-white px-3 py-2 shadow-[0_16px_32px_rgba(15,23,42,0.12)]">
                            <div className="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-400">{label}</div>
                            <div className="mt-1 text-base font-semibold text-slate-950">{formatRon(value)}</div>
                          </div>
                        )
                      }}
                    />
                    <Area
                      type="monotone"
                      dataKey="amount"
                      stroke="#08765e"
                      strokeWidth={3}
                      fill="url(#dashboard-sales-area)"
                      dot={{ r: 0 }}
                      activeDot={{
                        r: 6,
                        fill: "#ffffff",
                        stroke: "#08765e",
                        strokeWidth: 3,
                      }}
                    />
                    <Area type="monotone" dataKey="average" stroke="#f39c12" strokeWidth={1.5} strokeDasharray="5 5" fill="transparent" dot={false} activeDot={false} />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>
          </>
        ) : null}
        {loading ? (
          <div className="animate-pulse rounded-[18px] border border-slate-200 bg-slate-50/70 px-4 py-4">
            <div className="h-3 w-16 rounded bg-slate-200" />
            <div className="mt-2 h-5 w-28 rounded bg-slate-200" />
            <div className="mt-4 h-[220px] rounded-[14px] bg-slate-200" />
          </div>
        ) : null}
      </div>
    </div>
  )
}

function MetricCard({
  title,
  value,
  hint,
  tone,
  icon: Icon,
}: {
  title: string
  value: string
  hint: string
  tone: "blue" | "slate" | "amber" | "blue-soft" | "emerald"
  icon: any
}) {
  return (
    <div className="dashboard-metric border border-[#dce5ea] bg-white p-3 shadow-sm transition hover:border-slate-300">
      <div className="flex items-start gap-3">
        <span
          className={[
            "flex h-11 w-11 shrink-0 items-center justify-center",
            tone === "blue" && "bg-[#fff0dd] text-[#e67e22]",
            tone === "slate" && "bg-[#eaf1fb] text-[#17324D]",
            tone === "amber" && "bg-[#fff0cf] text-[#f39c12]",
            tone === "blue-soft" && "bg-[#d9f3f7] text-[#14758d]",
            tone === "emerald" && "bg-[#16b889] text-white",
          ].filter(Boolean).join(" ")}
        ><Icon size={21} /></span>
        <div className="min-w-0">
          <div className="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-500">{title}</div>
          <div className="mt-1 break-words text-xl font-semibold tracking-tight text-slate-950">{value}</div>
          <div className="mt-0.5 text-xs text-slate-500">{hint}</div>
        </div>

      </div>
    </div>
  )
}

function SectionCard({
  title,
  subtitle,
  action,
  children,
}: {
  title: string
  subtitle?: string
  action?: React.ReactNode
  children: React.ReactNode
}) {
  return (
    <div className="flex h-full min-h-0 flex-col border border-[#dce5ea] bg-white p-3.5 shadow-sm">
      <div className="mb-3 flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <div className="text-[15px] font-semibold tracking-[0.01em] text-slate-950">{title}</div>
          {subtitle ? <div className="mt-0.5 text-[13px] text-slate-500">{subtitle}</div> : null}
        </div>
        {action}
      </div>
      <div className="min-h-0 flex-1 overflow-hidden">{children}</div>
    </div>
  )
}

export default function Dashboard() {
  const [searchParams, setSearchParams] = useSearchParams()
  const navigate = useNavigate()
  const token =
    getToken() || ""

  const today = new Date()
  const defaultDateTo = toInputDate(today)
  const defaultDateFrom = toInputDate(new Date(today.getFullYear(), today.getMonth(), today.getDate() - 6))

  const [criticalStock, setCriticalStock] = useState<GlobalStockItem[]>([])
  const [criticalLoading, setCriticalLoading] = useState(true)

  const dateFrom = searchParams.get("dateFrom") || defaultDateFrom
  const dateTo = searchParams.get("dateTo") || defaultDateTo

  const [salesSeries, setSalesSeries] = useState<SalesPoint[]>([])
  const [dashboardLoading, setDashboardLoading] = useState(true)
  const [dashboardError, setDashboardError] = useState("")
  const [receiptsOpen, setReceiptsOpen] = useState(false)

  const [salesTotal, setSalesTotal] = useState(0)
  const [receiptsCount, setReceiptsCount] = useState(0)
  const [avgReceipt, setAvgReceipt] = useState(0)
  const [cashTotal, setCashTotal] = useState(0)
  const [cardTotal, setCardTotal] = useState(0)
  const [topProducts, setTopProducts] = useState<TopProductItem[]>([])
  const [lowStock, setLowStock] = useState<LowStockItem[]>([])
  const [recentActivity, setRecentActivity] = useState<RecentActivityItem[]>([])
  const [updatedAt, setUpdatedAt] = useState("")
  const [activeLocationId, setActiveLocationId] = useState(getActiveLocationId())
  const [activeTerminalId, setActiveTerminalId] = useState(getActiveTerminalId())

  function updateRange(nextDateFrom: string, nextDateTo: string) {
    const params = new URLSearchParams(searchParams)
    params.set("dateFrom", nextDateFrom)
    params.set("dateTo", nextDateTo)
    setSearchParams(params)
  }

  useEffect(() => {
    return subscribeToActiveLocation((nextLocationId) => {
      setActiveLocationId(nextLocationId)
    })
  }, [])

  useEffect(() => {
    return subscribeToActiveTerminal((nextTerminalId) => {
      setActiveTerminalId(nextTerminalId)
    })
  }, [])

  useEffect(() => {
    void loadCriticalStock(activeLocationId)

    const intervalId = window.setInterval(() => {
      void loadCriticalStock(activeLocationId, true)
    }, DASHBOARD_REFRESH_MS)

    return () => window.clearInterval(intervalId)
  }, [activeLocationId])

  useEffect(() => {
    void loadDashboard(activeLocationId, activeTerminalId)

    const intervalId = window.setInterval(() => {
      void loadDashboard(activeLocationId, activeTerminalId, true)
    }, DASHBOARD_REFRESH_MS)

    return () => window.clearInterval(intervalId)
  }, [dateFrom, dateTo, activeLocationId, activeTerminalId])

  useEffect(() => {
    const refreshNow = () => {
      if (document.visibilityState !== "visible") return
      void loadDashboard(activeLocationId, activeTerminalId, true)
      void loadCriticalStock(activeLocationId, true)
    }

    window.addEventListener("focus", refreshNow)
    document.addEventListener("visibilitychange", refreshNow)

    return () => {
      window.removeEventListener("focus", refreshNow)
      document.removeEventListener("visibilitychange", refreshNow)
    }
  }, [dateFrom, dateTo, activeLocationId, activeTerminalId])

  async function loadCriticalStock(selectedLocationId: string, silent = false) {
    if (!token) {
      setCriticalLoading(false)
      return
    }

    if (!silent) {
      setCriticalLoading(true)
    }

    try {
      const endpoint = selectedLocationId
        ? `${API}/api/v1/stock/by-location?locationId=${encodeURIComponent(selectedLocationId)}`
        : `${API}/api/v1/stock/global`

      const res = await fetch(endpoint, {
        headers: authHeaders(),
      })

      const data = await res.json().catch(() => ({}))
      const items = Array.isArray(data.items) ? data.items : []

      const sorted = [...items]
        .filter((item) => Number(selectedLocationId ? item.qty : item.totalQty || 0) <= 0)
        .sort((a, b) => Number(selectedLocationId ? a.qty : a.totalQty || 0) - Number(selectedLocationId ? b.qty : b.totalQty || 0))
        .slice(0, 6)

      setCriticalStock(sorted)
    } catch {
      setCriticalStock([])
    } finally {
      if (!silent) {
        setCriticalLoading(false)
      }
    }
  }

  async function loadDashboard(selectedLocationId: string, selectedTerminalId: string, silent = false) {
    if (!token) {
      setDashboardLoading(false)
      setDashboardError("Lipseste token-ul pentru dashboard.")
      return
    }

    if (!silent) {
      setDashboardLoading(true)
    }
    setDashboardError("")

    try {
      const tenantId = await getTenantIdFromSession(token)

      const params = new URLSearchParams()
      if (dateFrom) params.set("dateFrom", dateFrom)
      if (dateTo) params.set("dateTo", dateTo)
      if (selectedLocationId) params.set("locationId", selectedLocationId)
      if (selectedTerminalId) params.set("terminalId", selectedTerminalId)

      const res = await fetch(`${API}/api/v1/dashboard?${params.toString()}`, {
        headers: {
          Authorization: `Bearer ${token}`,
          "x-tenant-id": tenantId,
        },
      })

      const data: DashboardApiResponse = await res.json().catch(() => ({}))

      if (!res.ok || !data.ok) {
        throw new Error("Nu s-au putut incarca datele dashboard.")
      }

      const normalizedSeries = normalizeSalesPerDay(data.salesPerDay)

      setSalesSeries(normalizedSeries)
      setSalesTotal(Number(data.sales || 0))
      setReceiptsCount(Number(data.receipts || 0))
      setAvgReceipt(Number(data.avgReceipt || 0))
      setCashTotal(Number(data.cash || 0))
      setCardTotal(Number(data.card || 0))
      setTopProducts(
        Array.isArray(data.topProducts)
          ? data.topProducts.map((item) => ({
              name: item.name,
              qty: Number(item.qty || 0),
              profit: Number(item.profit || 0),
            }))
          : []
      )
      setLowStock(Array.isArray(data.lowStock) ? data.lowStock : [])
      setRecentActivity(Array.isArray(data.recentActivity) ? data.recentActivity : [])
      setUpdatedAt(typeof data.updatedAt === "string" ? data.updatedAt : "")
    } catch (error) {
      console.error("Dashboard load failed", error)
      setDashboardError("Nu am putut incarca dashboardul din backend.")
      setSalesSeries([])
      setSalesTotal(0)
      setReceiptsCount(0)
      setAvgReceipt(0)
      setCashTotal(0)
      setCardTotal(0)
      setTopProducts([])
      setLowStock([])
      setRecentActivity([])
    } finally {
      if (!silent) {
        setDashboardLoading(false)
      }
    }
  }

  const filteredSales = useMemo(() => {
    const from = dateFrom || "0000-01-01"
    const to = dateTo || "9999-12-31"
    return salesSeries.filter((item) => item.date >= from && item.date <= to)
  }, [dateFrom, dateTo, salesSeries])

  const safeSales = filteredSales.length ? filteredSales : [{ date: "0000-00-00", label: "-", value: 0 }]

  const criticalStockCount = lowStock.length || criticalStock.length
  const paymentTotal = cashTotal + cardTotal
  const cashShare = paymentTotal > 0 ? (cashTotal / paymentTotal) * 100 : 0
  const cardShare = paymentTotal > 0 ? (cardTotal / paymentTotal) * 100 : 0
  const totalTopProfit = topProducts.reduce((acc, item) => acc + item.profit, 0)
  const lastUpdatedLabel = updatedAt ? formatRelativeTime(updatedAt) : "nesincronizat"
  const rangeLabel = formatRangeLabel(dateFrom, dateTo)
  const scopeLabel = activeLocationId ? "Locatie selectata" : "Toate locatiile"
  const terminalLabel = activeTerminalId ? "Terminal selectat" : "Toate terminalele"
  const appVersion = "V1.1"
  const mobileQuickActions = [
    {
      title: "NIR rapid",
      subtitle: "NIR nou",
      badge: "scanare",
      icon: PackagePlus,
      iconClassName: "bg-[#17324D] text-white",
      action: () => navigate("/inregistrare-document/nir/new"),
    },
    {
      title: "Stoc produse",
      subtitle: "Cautare rapida",
      badge: "rapid",
      icon: PackageSearch,
      iconClassName: "bg-[#12806A] text-white",
      action: () => navigate("/gestiune/stoc"),
    },
    {
      title: "Transfer",
      subtitle: "Mutare stoc",
      badge: "",
      icon: ArrowRightLeft,
      iconClassName: "bg-[#7C3AED] text-white",
      action: () => navigate("/transfer/new"),
    },
    {
      title: "Inventar",
      subtitle: "Numarare stoc",
      badge: "offline",
      icon: Check,
      iconClassName: "bg-[#F76707] text-white",
      action: () => navigate("/inregistrare-document/inventar/new"),
    },
    {
      title: "Bon consum",
      subtitle: "Consum intern",
      badge: "",
      icon: FileText,
      iconClassName: "bg-[#C25A00] text-white",
      action: () => navigate("/inregistrare-document/bon-consum/new"),
    },
    {
      title: "Facturi SPV",
      subtitle: "Import ANAF",
      badge: "nou",
      icon: FolderSymlink,
      iconClassName: "bg-[#1D4E89] text-white",
      action: () => navigate("/documente/facturi-primite-spv"),
    },
  ]
  const stats = [
    {
      title: "Vanzari interval",
      value: formatRon(salesTotal),
      hint: `${filteredSales.length} zile selectate`,
      icon: CircleDollarSign,
      tone: "blue" as const,
    },
    {
      title: "Bonuri",
      value: receiptsCount.toString(),
      hint: `Medie bon ${formatRon(avgReceipt)}`,
      icon: ShoppingCart,
      tone: "slate" as const,
    },
    {
      title: "Cash / Card",
      value: `${cashShare.toFixed(0)}% / ${cardShare.toFixed(0)}%`,
      hint: `${formatRon(cashTotal)} / ${formatRon(cardTotal)}`,
      icon: CreditCard,
      tone: "blue-soft" as const,
    },
    {
      title: "Profit top produse",
      value: formatRon(totalTopProfit),
      hint: "sumat din produsele de top",
      icon: TrendingUp,
      tone: "emerald" as const,
    },
    {
      title: "Stoc critic",
      value: `${criticalStockCount}`,
      hint: "produse de urmarit",
      icon: AlertTriangle,
      tone: "amber" as const,
    },
  ]

  return (
    <div className="erp-dashboard w-full space-y-3">
      <div className="space-y-4 xl:hidden">
        <section className="overflow-hidden rounded-[28px] border border-[#D8E4F0] bg-[linear-gradient(180deg,#FFFFFF_0%,#EEF5FB_100%)] p-4 shadow-[0_20px_40px_rgba(15,23,42,0.08)]">
          <div className="flex items-start justify-between gap-3">
            <div>
              <div className="text-[16px] font-semibold uppercase tracking-[0.08em] text-[#17324D]">Gufo Mobile</div>
              <div className="mt-1 text-sm text-slate-500">Operare rapida</div>
            </div>
            <div className="rounded-full bg-[#17324D] px-4 py-2 text-sm font-semibold text-white">{appVersion}</div>
          </div>

          <div className="mt-4 rounded-[24px] bg-[#17324D] px-4 py-4 text-white shadow-[0_20px_44px_rgba(23,50,77,0.25)]">
            <div className="flex items-start justify-between gap-3">
              <div>
                <div className="text-sm text-white/70">Azi</div>
                <div className="mt-2 text-[24px] font-semibold tracking-tight">{formatRon(salesTotal)}</div>
              </div>
              <div className="rounded-[20px] bg-white/10 px-3 py-2 text-right">
                <div className="flex items-center gap-2 text-sm font-semibold text-[#7DE2BF]">
                  <span className="h-2.5 w-2.5 rounded-full bg-[#7DE2BF]" />
                  sincronizat
                </div>
                <div className="mt-0.5 text-xs text-white/70">Sistem activ</div>
              </div>
            </div>
          </div>

          <div className="mt-3 grid grid-cols-2 gap-3">
            <label className="rounded-[20px] border border-[#D8E4F0] bg-white px-3 py-2 shadow-sm">
              <div className="text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-500">De la</div>
              <input
                type="date"
                value={dateFrom}
                max={dateTo}
                onChange={(event) => updateRange(event.target.value, dateTo)}
                className="mt-1 w-full border-0 bg-transparent p-0 text-sm font-semibold text-[#17324D] outline-none"
              />
            </label>
            <label className="rounded-[20px] border border-[#D8E4F0] bg-white px-3 py-2 shadow-sm">
              <div className="text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-500">Pana la</div>
              <input
                type="date"
                value={dateTo}
                min={dateFrom}
                max={defaultDateTo}
                onChange={(event) => updateRange(dateFrom, event.target.value)}
                className="mt-1 w-full border-0 bg-transparent p-0 text-sm font-semibold text-[#17324D] outline-none"
              />
            </label>
          </div>
        </section>

        <section className="rounded-[28px] border border-[#D8E4F0] bg-white p-4 shadow-[0_20px_40px_rgba(15,23,42,0.05)]">
          <div>
            <div className="text-[28px] font-semibold tracking-tight text-slate-950">Alege ce vrei sa faci</div>
            <div className="mt-1 text-sm text-slate-500">Actiuni rapide</div>
          </div>

          <div className="mt-4 grid grid-cols-2 gap-3">
            {mobileQuickActions.map((action) => {
              const Icon = action.icon
              return (
                <button
                  key={action.title}
                  type="button"
                  onClick={action.action}
                  className="rounded-[24px] border border-[#D9E4EE] bg-[linear-gradient(180deg,#FFFFFF_0%,#F8FBFD_100%)] p-4 text-left shadow-sm"
                >
                  <div className="flex items-start justify-between gap-3">
                    <span className={`flex h-12 w-12 items-center justify-center rounded-[16px] ${action.iconClassName}`}>
                      <Icon size={23} />
                    </span>
                    {action.badge ? (
                      <span className="rounded-full border border-emerald-100 bg-emerald-50 px-2.5 py-1 text-[11px] font-semibold text-emerald-700">
                        {action.badge}
                      </span>
                    ) : null}
                  </div>
                  <div className="mt-4 text-[16px] font-semibold leading-tight text-slate-950">{action.title}</div>
                  <div className="mt-1 text-sm text-slate-500">{action.subtitle}</div>
                  <div className="mt-4 rounded-full border border-slate-200 bg-slate-50 px-3 py-2 text-center text-sm font-semibold text-[#17324D]">
                    Deschide
                  </div>
                </button>
              )
            })}
          </div>
        </section>

        <section className="rounded-[28px] border border-[#D8E4F0] bg-white p-4 shadow-[0_20px_40px_rgba(15,23,42,0.05)]">
          <div className="text-[18px] font-semibold text-slate-950">Pentru manager</div>
          <div className="mt-4 grid grid-cols-3 gap-3">
            <div className="rounded-[20px] border border-slate-200 bg-[#F8FBFD] px-3 py-3">
              <div className="text-xs uppercase tracking-[0.12em] text-slate-500">Cash</div>
              <div className="mt-2 text-xl font-semibold text-[#17324D]">{formatRon(cashTotal).replace(" RON", "")}</div>
            </div>
            <div className="rounded-[20px] border border-slate-200 bg-[#F8FBFD] px-3 py-3">
              <div className="text-xs uppercase tracking-[0.12em] text-slate-500">Card</div>
              <div className="mt-2 text-xl font-semibold text-[#17324D]">{formatRon(cardTotal).replace(" RON", "")}</div>
            </div>
            <div className="rounded-[20px] border border-slate-200 bg-[#F8FBFD] px-3 py-3">
              <div className="text-xs uppercase tracking-[0.12em] text-slate-500">Stoc critic</div>
              <div className="mt-2 text-xl font-semibold text-[#17324D]">{criticalStockCount}</div>
            </div>
          </div>
        </section>

        <button
          type="button"
          onClick={() => navigate("/nomenclator/produse")}
          className="flex w-full items-center gap-3 rounded-[24px] border border-[#D8E4F0] bg-white px-4 py-4 text-left shadow-[0_16px_30px_rgba(15,23,42,0.04)]"
        >
          <span className="flex h-11 w-11 items-center justify-center rounded-[16px] bg-[#EEF4FB] text-[#17324D]">
            <ScanLine size={22} />
          </span>
          <div className="min-w-0 flex-1">
            <div className="text-[18px] font-semibold text-slate-950">Scaneaza sau cauta produs</div>
            <div className="mt-1 text-sm text-slate-500">Cautare produs</div>
          </div>
          <Search size={20} className="text-slate-400" />
        </button>
      </div>

      <div className="hidden">
        <div className="flex items-center justify-between gap-6">
          <div className="min-w-0">
            <div className="flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.14em] text-[#176b87]">
              <Activity size={14} />
              Dashboard operational
            </div>
            <div className="mt-1.5 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-slate-500">
              <span className="inline-flex items-center gap-1.5"><Clock3 size={13} />{rangeLabel}</span>
              <span className="inline-flex items-center gap-1.5"><Boxes size={13} />{scopeLabel}</span>
              <span className="inline-flex items-center gap-1.5"><CreditCard size={13} />{terminalLabel}</span>
            </div>
          </div>
          <div className="shrink-0 border-l border-[#d8e0e7] pl-5 text-right">
            <div className="text-[10px] font-semibold uppercase tracking-[0.13em] text-slate-400">Actualizat</div>
            <div className="mt-0.5 text-sm font-semibold text-[#16876f]">{lastUpdatedLabel}</div>
          </div>
        </div>
      </div>

      {dashboardError ? (
        <div className="rounded-[18px] border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {dashboardError}
        </div>
      ) : null}

      <div className="dashboard-stats hidden grid-cols-1 gap-3 md:grid-cols-2 xl:grid xl:grid-cols-5">
        {stats.map((stat) => (
          <MetricCard key={stat.title} {...stat} />
        ))}
      </div>

      <div className="dashboard-primary hidden gap-3 xl:grid xl:grid-cols-[minmax(0,1.35fr)_minmax(320px,0.65fr)]">
        <SalesChart data={safeSales} loading={dashboardLoading} total={salesTotal} average={filteredSales.length ? salesTotal / filteredSales.length : 0} cash={cashTotal} card={cardTotal} receipts={receiptsCount} />
        <div className="dashboard-quick-actions"><QuickActions compact onOpenReceipts={() => setReceiptsOpen(true)} /></div>
      </div>

      {receiptsOpen ? (
        <div className="fixed inset-0 z-[80] flex items-center justify-center bg-slate-950/45 p-4 backdrop-blur-sm">
          <div className="max-h-[90vh] w-full max-w-6xl overflow-auto rounded-[24px] bg-white p-5 shadow-2xl">
            <div className="mb-4 flex items-start justify-between gap-4">
              <div>
                <div className="text-xl font-bold text-slate-900">Vanzari / Bon</div>
                <div className="mt-1 text-sm text-slate-500">Bonuri emise in Android POS.</div>
              </div>
              <button
                type="button"
                onClick={() => setReceiptsOpen(false)}
                className="rounded-[14px] border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-600 transition hover:bg-slate-50"
              >
                Inchide
              </button>
            </div>
            <PosReceiptsView compact />
          </div>
        </div>
      ) : null}

      <div className="dashboard-secondary hidden gap-3 xl:grid xl:grid-cols-3">
      <div className="contents">
        <SectionCard
          title="Top produse"
          action={
            <div className="rounded-full bg-[#FFF1D6] px-3 py-1 text-xs font-semibold uppercase tracking-[0.2em] text-[#B66A00]">
              top 5
            </div>
          }
        >
          <div className="space-y-2.5">
            {dashboardLoading ? (
              <div className="text-sm text-slate-500">Se incarca top produse...</div>
            ) : topProducts.length === 0 ? (
              <div className="rounded-[18px] border border-dashed border-slate-300 bg-slate-50 px-4 py-6 text-sm text-slate-500">
                Nu exista produse vandute in intervalul selectat.
              </div>
            ) : (
              topProducts.map((item, index) => (
                <div
                  key={`${item.name}-${index}`}
                  className={[
                "grid grid-cols-1 gap-2 rounded-[18px] border px-3 py-2.5 sm:grid-cols-[minmax(150px,1.4fr)_90px_130px] sm:items-center sm:gap-3",
                    item.profit <= 0
                      ? "border-red-200 bg-red-50"
                      : "border-slate-200 bg-slate-50",
                  ].join(" ")}
                >
                  <div className="min-w-0">
                    <div className="truncate pr-3 text-sm font-semibold text-slate-800">{item.name}</div>
                    {item.profit <= 0 ? (
                      <div className="mt-1 text-xs font-semibold text-red-600">neprofitabil</div>
                    ) : null}
                  </div>
                  <div className="w-fit rounded-full bg-[#17324D] px-3 py-1 text-center text-xs font-semibold text-white sm:justify-self-center">
                    {formatQtyRo(item.qty || 0)}
                  </div>
                  <div className={["text-sm font-semibold sm:text-right", item.profit <= 0 ? "text-red-600" : "text-emerald-700"].join(" ")}>
                    {formatRon(item.profit)}
                  </div>
                </div>
              ))
            )}
          </div>
        </SectionCard>

        <SectionCard
          title="Activitate recenta"
          action={
            <div className="rounded-full bg-[#FFF1D6] px-3 py-1 text-xs font-semibold uppercase tracking-[0.2em] text-[#B66A00]">
              {lastUpdatedLabel}
            </div>
          }
        >
          <div className="divide-y divide-slate-100">
            {dashboardLoading ? (
              <div className="text-sm text-slate-500">Se incarca activitatea recenta...</div>
            ) : recentActivity.length === 0 ? (
              <div className="rounded-[18px] border border-dashed border-slate-300 bg-slate-50 px-4 py-6 text-sm text-slate-500">
                Nu exista inca activitate recenta pentru locatia selectata.
              </div>
            ) : (
              recentActivity.slice(0, 5).map((item, index) => {
                const Icon = ACTIVITY_ICON_MAP[item.type] || FileText
                return (
                  <div key={`${item.type}-${item.at}-${index}`} className="flex items-center gap-3 py-2.5">
                    <div className="flex h-8 w-8 shrink-0 items-center justify-center border border-slate-200 bg-slate-50 text-slate-700">
                      <Icon size={18} />
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="truncate text-sm font-semibold text-slate-900">{item.title}</div>
                      <div className="mt-0.5 truncate text-xs text-slate-500">{item.meta}</div>
                    </div>
                    <div className="shrink-0 text-xs font-medium text-slate-400">{formatRelativeTime(item.at)}</div>
                  </div>
                )
              })
            )}
          </div>
        </SectionCard>
      </div>

      <div>
        <SectionCard
          title="Stoc critic automat"
        >
          <div className="divide-y divide-slate-100">
            {dashboardLoading || criticalLoading ? (
              <div className="text-sm text-slate-500">Se incarca produsele cu stoc mic...</div>
            ) : lowStock.length > 0 ? (
              lowStock.slice(0, 8).map((item, index) => (
                <div
                  key={`${item.product}-${item.location}-${index}`}
                  className="flex items-center justify-between gap-3 py-1.5"
                >
                  <div className="min-w-0">
                    <div className="truncate text-sm font-semibold text-slate-800">{item.product}</div>
                    <div className="text-xs text-slate-500">{item.location}</div>
                  </div>
                  <div className="ml-3 rounded-full bg-rose-50 px-3 py-1 text-xs font-semibold text-rose-600">
                    {formatQtyRo(item.qty || 0)}
                  </div>
                </div>
              ))
            ) : criticalStock.length === 0 ? (
              <div className="rounded-[18px] border border-dashed border-slate-300 bg-slate-50 px-4 py-6 text-sm text-slate-500">
                Nu exista suficiente date pentru alerta de stoc critic.
              </div>
            ) : (
              criticalStock.slice(0, 8).map((product, index) => (
                <div
                  key={`${product.productId || product.id || index}`}
                  className="flex items-center justify-between gap-3 py-1.5"
                >
                  <div className="min-w-0">
                    <div className="truncate text-sm font-semibold text-slate-800">{product.name || "Produs fara nume"}</div>
                    <div className="text-xs text-slate-500">{product.sku || "fara SKU"}</div>
                  </div>
                  <div className="ml-3 rounded-full bg-rose-50 px-3 py-1 text-xs font-semibold text-rose-600">
                    {formatQtyRo(activeLocationId ? product.qty : product.totalQty || 0)} {product.uom || ""}
                  </div>
                </div>
              ))
            )}
          </div>
        </SectionCard>
      </div>
      </div>
    </div>
  )
}



