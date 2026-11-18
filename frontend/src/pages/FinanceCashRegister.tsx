import { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "react-router-dom";
import PageHeader from "../components/PageHeader";
import { API_BASE as API, authHeaders } from "../lib/api";
import { formatMoneyRo } from "../lib/format";
import {
  getActiveLocationId,
  subscribeToActiveLocation,
} from "../lib/location";
import {
  getActiveTerminalId,
  subscribeToActiveTerminal,
} from "../lib/terminal";
type Row = {
  id: string;
  type: string;
  occurredAt: string;
  amountIn: number;
  amountOut: number;
  description?: string;
  documentNo?: string;
  operatorName?: string;
  balance?: number;
};
const today = () => new Date().toISOString().slice(0, 10),
  pretty = (v: string) =>
    new Intl.DateTimeFormat("ro-RO", {
      dateStyle: "short",
      timeStyle: "short",
    }).format(new Date(v)),
  labels: any = {
    SALE: "Vânzare cash",
    DEPOSIT: "Încasare",
    OPENING: "Sold inițial",
    WITHDRAWAL: "Plată / retragere",
    TRANSFER_IN: "Transfer primit",
    TRANSFER_OUT: "Transfer trimis",
    REPORT_Z: "Raport Z",
  };
export default function FinanceCashRegister() {
  const [params, setParams] = useSearchParams(),
    from = params.get("dateFrom") || today(),
    to = params.get("dateTo") || today(),
    [locationId, setLocationId] = useState(getActiveLocationId()),
    [terminalId, setTerminalId] = useState(getActiveTerminalId()),
    [rows, setRows] = useState<Row[]>([]),
    [error, setError] = useState(""),
    [busy, setBusy] = useState(false),
    [form, setForm] = useState<"in" | "out" | "transfer" | "z" | null>(null),
    [amount, setAmount] = useState(""),
    [currency, setCurrency] = useState("RON"),
    [documentType, setDocumentType] = useState("Chitanță"),
    [documentDate, setDocumentDate] = useState(today()),
    [partner, setPartner] = useState(""),
    [partnerCode, setPartnerCode] = useState(""),
    [partnerAddress, setPartnerAddress] = useState(""),
    [invoiceNo, setInvoiceNo] = useState(""),
    [invoiceDate, setInvoiceDate] = useState(today()),
    [description, setDescription] = useState(""),
    [documentNo, setDocumentNo] = useState(""),
    [fromLocation, setFromLocation] = useState(""),
    [toLocation, setToLocation] = useState(""),
    [locations, setLocations] = useState<any[]>([]),
    [partners, setPartners] = useState<any[]>([]),
    [partnerType, setPartnerType] = useState<"customer" | "supplier">("customer"),
    [partnerModal, setPartnerModal] = useState(false);
  const load = async () => {
    setBusy(true);
    try {
      const q = new URLSearchParams({ dateFrom: from, dateTo: to });
      if (locationId) q.set("locationId", locationId);
      if (terminalId) q.set("terminalId", terminalId);
      const r = await fetch(`${API}/api/v1/finance/cash-register?${q}`, {
          headers: authHeaders(),
          cache: "no-store",
        }),
        d = await r.json();
      if (!r.ok || !d.ok) throw Error(d.error);
      setRows(d.items || []);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Eroare registru");
    } finally {
      setBusy(false);
    }
  };
  useEffect(() => subscribeToActiveLocation(setLocationId), []);
  useEffect(() => subscribeToActiveTerminal(setTerminalId), []);
  useEffect(() => {
    void load();
  }, [from, to, locationId, terminalId]);
  useEffect(() => {
    fetch(`${API}/api/v1/meta/locations`, { headers: authHeaders() })
      .then((r) => r.json())
      .then((d) => setLocations(d.locations || []))
      .catch(() => {});
  }, []);
  useEffect(() => {
    if (partner.trim().length < 3 || form === "z" || form === "transfer") { setPartners([]); return; }
    const timer = window.setTimeout(async () => {
      try {
        const endpoint = partnerType === "supplier" ? "/api/v1/meta/suppliers" : "/api/v1/customers";
        const r = await fetch(`${API}${endpoint}?q=${encodeURIComponent(partner.trim())}`, { headers: authHeaders() });
        const d = await r.json(); setPartners(d.suppliers || d.customers || []);
      } catch { setPartners([]); }
    }, 250);
    return () => window.clearTimeout(timer);
  }, [partner, partnerType, form]);
  const ordered = [...rows].sort(
    (a, b) => +new Date(a.occurredAt) - +new Date(b.occurredAt),
  );
  let bal = 0;
  const display = ordered
      .map((r) => ({ ...r, balance: (bal += r.amountIn - r.amountOut) }))
      .reverse(),
    ins = rows.reduce((s, r) => s + r.amountIn, 0),
    outs = rows.reduce((s, r) => s + r.amountOut, 0);
  const close = () => {
    setForm(null);
    setAmount("");
    setCurrency("RON");
    setDocumentType("Chitanță");
    setDocumentDate(today());
    setPartner("");
    setPartnerCode("");
    setPartnerAddress("");
    setInvoiceNo("");
    setInvoiceDate(today());
    setDescription("");
    setDocumentNo("");
    setFromLocation("");
    setToLocation("");
  };
  const exportCsv = () => {
    const header = [
      "Data",
      "Tip",
      "Explicație",
      "Document",
      "Operator",
      "Intrare",
      "Ieșire",
      "Sold",
    ];
    const lines = [
      header,
      ...display.map((r) => [
        pretty(r.occurredAt),
        labels[r.type] || r.type,
        r.description || "",
        r.documentNo || "",
        r.operatorName || "",
        r.amountIn || 0,
        r.amountOut || 0,
        r.balance || 0,
      ]),
    ].map((row) =>
      row.map((v) => `"${String(v).replaceAll('"', '""')}"`).join(","),
    );
    const blob = new Blob(["\ufeff" + lines.join("\n")], {
      type: "text/csv;charset=utf-8",
    });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = `registru-casa-${from}-${to}.csv`;
    a.click();
    URL.revokeObjectURL(a.href);
  };
  async function submit() {
    const n = Number(amount);
    if (form !== "z" && (!n || n <= 0)) return setError("Introdu o sumă validă.");
    try {
      let url = `${API}/api/v1/finance/cash-register/transactions`,
        body: any = {
          amount: n,
          description: [`Data document: ${documentDate}`, `Valută: ${currency}`, partner && `${form === "in" ? "Plătitor" : "Beneficiar"}: ${partner}`, partnerCode && `CIF/CNP: ${partnerCode}`, partnerAddress && `Adresă: ${partnerAddress}`, description, invoiceNo && `Factură furnizor: ${invoiceNo}`, invoiceDate && `Data factură: ${invoiceDate}`].filter(Boolean).join(" | "),
          documentNo: [documentType, documentNo].filter(Boolean).join(" "),
          locationId,
          terminalId,
        };
      if (form === "in") body.type = "DEPOSIT";
      if (form === "out") body.type = "WITHDRAWAL";
      if (form === "z") body.type = "REPORT_Z";
      if (form === "transfer") {
        url = `${API}/api/v1/finance/cash-register/transfer`;
        body = {
          amount: n,
          description,
          fromLocationId: fromLocation,
          toLocationId: toLocation,
        };
      }
      const r = await fetch(url, {
          method: "POST",
          headers: { ...authHeaders(), "Content-Type": "application/json" },
          body: JSON.stringify(body),
        }),
        d = await r.json();
      if (!r.ok || !d.ok) throw Error(d.error);
      close();
      await load();
    } catch (e) {
      setError(
        e instanceof Error ? e.message : "Nu am putut salva operațiunea",
      );
    }
  }
  const setDate = (k: string, v: string) => {
    const p = new URLSearchParams(params);
    p.set(k, v);
    setParams(p, { replace: true });
  };
  return (
    <div className="space-y-3">
      <PageHeader
        badge="financiar"
        title="Registru de casă"
        subtitle="Încasări, plăți, transferuri și soldul numerarului."
      />
      <div className="rounded-xl border bg-white p-4">
        <div className="flex flex-wrap items-end justify-between gap-3">
          <div className="flex gap-2">
            <label>
              De la
              <input
                className="ml-2 rounded border p-2"
                type="date"
                value={from}
                onChange={(e) => setDate("dateFrom", e.target.value)}
              />
            </label>
            <label>
              Până la
              <input
                className="ml-2 rounded border p-2"
                type="date"
                value={to}
                onChange={(e) => setDate("dateTo", e.target.value)}
              />
            </label>
            <button
              onClick={() => void load()}
              className="rounded bg-slate-900 px-4 py-2 text-white"
            >
              Caută
            </button>
          </div>
          <div className="flex flex-wrap gap-2">
            <button onClick={exportCsv} className="rounded border px-4 py-2 font-semibold">Exportă CSV</button>
            <button onClick={() => setForm("z")} className="rounded border border-amber-300 bg-amber-50 px-4 py-2 font-semibold text-amber-800">Registru Z</button>
            <button
              onClick={() => setForm("in")}
              className="rounded bg-emerald-600 px-4 py-2 font-semibold text-white"
            >
              + Dispoziție încasare
            </button>
            <button
              onClick={() => setForm("out")}
              className="rounded bg-rose-600 px-4 py-2 font-semibold text-white"
            >
              − Dispoziție plată
            </button>
            <button
              onClick={() => setForm("transfer")}
              className="rounded border px-4 py-2 font-semibold"
            >
              Transfer registru
            </button>
          </div>
        </div>
      </div>
      <div className="grid gap-3 sm:grid-cols-4">
        <Card t="Intrări cash" v={formatMoneyRo(ins)} />
        <Card t="Ieșiri cash" v={formatMoneyRo(outs)} />
        <Card t="Sold curent" v={formatMoneyRo(ins - outs)} />
        <Card t="Operațiuni" v={String(rows.length)} />
      </div>
      {error && (
        <div className="rounded border border-red-200 bg-red-50 p-3 text-red-700">
          {error}
        </div>
      )}
      <div className="overflow-x-auto rounded-xl border bg-white">
        <table className="min-w-full text-sm">
          <thead className="bg-slate-50">
            <tr>
              {[
                "Data",
                "Tip",
                "Explicație",
                "Document",
                "Operator",
                "Intrare",
                "Ieșire",
                "Sold",
              ].map((x) => (
                <th className="px-3 py-3 text-left" key={x}>
                  {x}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {busy ? (
              <tr>
                <td className="p-5" colSpan={8}>
                  Se încarcă...
                </td>
              </tr>
            ) : (
              display.map((r) => (
                <tr className="border-t" key={r.id}>
                  <td className="px-3 py-3">{pretty(r.occurredAt)}</td>
                  <td className="px-3 py-3">{labels[r.type] || r.type}</td>
                  <td className="px-3 py-3">{r.description || "-"}</td>
                  <td className="px-3 py-3">{r.type === "REPORT_Z" && (!r.documentNo || r.documentNo.length > 12) ? "Raport Z" : r.documentNo || "-"}</td>
                  <td className="px-3 py-3">{r.operatorName || "-"}</td>
                  <td className="px-3 py-3 text-emerald-700">
                    {r.amountIn ? formatMoneyRo(r.amountIn) : "-"}
                  </td>
                  <td className="px-3 py-3 text-rose-700">
                    {r.amountOut ? formatMoneyRo(r.amountOut) : "-"}
                  </td>
                  <td className="px-3 py-3 font-semibold">
                    {formatMoneyRo(r.balance || 0)}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
      {form && (
        <div className="fixed inset-0 z-50 grid place-items-center bg-black/40 p-4">
          <div className="w-full max-w-lg rounded-2xl bg-white p-5">
            <h2 className="text-lg font-bold">
              {form === "in"
                ? "Dispoziție de încasare"
                : form === "out"
                  ? "Dispoziție de plată"
                  : form === "z"
                    ? "Înregistrare raport Z"
                  : "Transfer între registre"}
            </h2>
            <div className="mt-4 grid grid-cols-2 gap-3">
              <label>Tip document<select className="mt-1 w-full rounded border p-2" value={documentType} onChange={(e) => setDocumentType(e.target.value)}><option>Chitanță</option><option>Bon fiscal</option><option>Raport Z</option><option>Ordin de plată</option><option>Factură</option></select></label>
              <label>Valută<select className="mt-1 w-full rounded border p-2" value={currency} onChange={(e) => setCurrency(e.target.value)}><option>RON</option><option>EUR</option><option>USD</option></select></label>
            </div>
            {form !== "z" && <label className="mt-3 block">
              Sumă
              <input
                className="mt-1 w-full rounded border p-2"
                type="number"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
              />
            </label>}
            {form === "transfer" && (
              <div className="grid grid-cols-2 gap-2">
                <label>
                  Din
                  <select
                    className="mt-1 w-full rounded border p-2"
                    value={fromLocation}
                    onChange={(e) => setFromLocation(e.target.value)}
                  >
                    <option value="">Alege locația</option>
                    {locations.map((l) => (
                      <option key={l.id} value={l.id}>
                        {l.name}
                      </option>
                    ))}
                  </select>
                </label>
                <label>
                  În
                  <select
                    className="mt-1 w-full rounded border p-2"
                    value={toLocation}
                    onChange={(e) => setToLocation(e.target.value)}
                  >
                    <option value="">Alege locația</option>
                    {locations.map((l) => (
                      <option key={l.id} value={l.id}>
                        {l.name}
                      </option>
                    ))}
                  </select>
                </label>
              </div>
            )}
            {form !== "z" && form !== "transfer" && <div className="mt-3"><div className="flex items-end gap-2"><label className="flex-1">{form === "in" ? "Plătitor / client / furnizor" : "Beneficiar"}<input className="mt-1 w-full rounded border p-2" placeholder="Scrie minimum 3 litere pentru căutare" value={partner} onChange={(e) => setPartner(e.target.value)} /></label><select className="rounded border p-2" value={partnerType} onChange={(e) => setPartnerType(e.target.value as any)}><option value="customer">Client</option><option value="supplier">Furnizor</option></select><button type="button" onClick={() => setPartnerModal(true)} className="rounded border px-3 py-2 font-semibold">+ Adaugă</button></div>{partners.length > 0 && <div className="mt-1 max-h-32 overflow-auto rounded border bg-white shadow-sm">{partners.slice(0, 8).map((p) => <button type="button" key={p.id} className="block w-full px-3 py-2 text-left hover:bg-slate-50" onClick={() => { setPartner(p.name || p.companyName || ""); setPartnerCode(p.cui || p.cif || ""); setPartnerAddress(p.address || ""); setPartners([]); }}>{p.name || p.companyName}{(p.cui || p.cif) ? ` · ${p.cui || p.cif}` : ""}</button>)}</div>}</div>}
            {form !== "z" && <div className="mt-3 grid grid-cols-2 gap-3"><label>CIF / CNP<input className="mt-1 w-full rounded border p-2" value={partnerCode} onChange={(e) => setPartnerCode(e.target.value)} /></label><label>Adresă<input className="mt-1 w-full rounded border p-2" value={partnerAddress} onChange={(e) => setPartnerAddress(e.target.value)} /></label></div>}
            <label className="mt-3 block">Explicație / motiv<input className="mt-1 w-full rounded border p-2" value={description} onChange={(e) => setDescription(e.target.value)} /></label>
            <label className="mt-3 block">
              Număr document
              <input
                className="mt-1 w-full rounded border p-2"
                value={documentNo}
                onChange={(e) => setDocumentNo(e.target.value)}
              />
            </label>
            {form !== "z" && <label className="mt-3 block">Data documentului<input className="mt-1 w-full rounded border p-2" type="date" value={documentDate} onChange={(e) => setDocumentDate(e.target.value)} /></label>}
            {form !== "z" && <div className="mt-3 grid grid-cols-2 gap-3"><label>Nr. factură furnizor<input className="mt-1 w-full rounded border p-2" value={invoiceNo} onChange={(e) => setInvoiceNo(e.target.value)} /></label><label>Data facturii<input className="mt-1 w-full rounded border p-2" type="date" value={invoiceDate} onChange={(e) => setInvoiceDate(e.target.value)} /></label></div>}
            <div className="mt-5 flex justify-end gap-2">
              <button onClick={close} className="rounded border px-4 py-2">
                Anulează
              </button>
              <button
                onClick={() => void submit()}
                className="rounded bg-slate-900 px-4 py-2 text-white"
              >
                Salvează
              </button>
            </div>
          </div>
        </div>
      )}
      {partnerModal && <div className="fixed inset-0 z-[60] grid place-items-center bg-black/40 p-4"><div className="w-full max-w-lg rounded-2xl bg-white p-5"><h3 className="text-lg font-bold">Adaugă {partnerType === "supplier" ? "furnizor" : "client"}</h3><div className="mt-4 grid grid-cols-2 gap-3"><label className="col-span-2">Nume / denumire<input autoFocus className="mt-1 w-full rounded border p-2" value={partner} onChange={(e) => setPartner(e.target.value)} /></label><label>CUI / CNP<input className="mt-1 w-full rounded border p-2" value={partnerCode} onChange={(e) => setPartnerCode(e.target.value)} /></label><label>Telefon<input className="mt-1 w-full rounded border p-2" /></label><label className="col-span-2">Adresă<input className="mt-1 w-full rounded border p-2" value={partnerAddress} onChange={(e) => setPartnerAddress(e.target.value)} /></label></div><div className="mt-4 flex justify-end gap-2"><button type="button" onClick={() => setPartnerModal(false)} className="rounded border px-4 py-2">Anulează</button><button type="button" disabled={!partner.trim()} onClick={async () => { try { const endpoint = partnerType === "supplier" ? "/api/v1/meta/suppliers" : "/api/v1/customers"; const r = await fetch(`${API}${endpoint}`, { method: "POST", headers: { ...authHeaders(), "Content-Type": "application/json" }, body: JSON.stringify({ name: partner.trim(), cui: partnerCode.trim() || undefined, address: partnerAddress.trim() || undefined }) }); const d = await r.json(); if (!r.ok || d.ok === false) throw Error(d.error || "Nu am putut salva."); setPartner(d.supplier?.name || d.customer?.name || partner.trim()); setPartnerModal(false); } catch (e) { setError(e instanceof Error ? e.message : "Nu am putut salva partenerul."); } }} className="rounded bg-slate-900 px-4 py-2 text-white">Salvează și selectează</button></div></div></div>}
    </div>
  );
}
function Card({ t, v }: { t: string; v: string }) {
  return (
    <div className="rounded-xl border bg-white p-4">
      <div className="text-xs uppercase text-slate-500">{t}</div>
      <div className="mt-2 text-xl font-bold">{v}</div>
    </div>
  );
}
