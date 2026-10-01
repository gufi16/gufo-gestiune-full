import PDFDocument from "pdfkit"
import { pdfFmt, pdfNum, pdfText, registerPdfFonts } from "./professionalPdf"

type Party = {
  name?: unknown
  cui?: unknown
  regNo?: unknown
  address?: unknown
  county?: unknown
  iban?: unknown
  bank?: unknown
  phone?: unknown
  email?: unknown
}

type InvoiceLine = {
  name?: unknown
  qty?: unknown
  unitPrice?: unknown
  discount?: unknown
  net?: unknown
  vat?: unknown
}

export function drawReferenceInvoicePdf(doc: PDFKit.PDFDocument, input: {
  supplier: Party
  customer: Party
  number: string
  issueDate: Date | string
  dueDate?: Date | string | null
  currency: string
  vatRate?: number | null
  lines: InvoiceLine[]
  totalNet: unknown
  totalDiscount?: unknown
  totalVat: unknown
  totalGross: unknown
  note?: string | null
  spvDownloadId?: string | null
}) {
  const fonts = registerPdfFonts(doc)
  const margin = 30
  const width = doc.page.width - margin * 2
  const dark = "#000000"
  const line = "#161616"
  const leftW = 170
  const centerW = width - leftW * 2
  const centerX = margin + leftW
  const rightX = centerX + centerW
  const lineHeight = 15

  const drawParty = (title: string, party: Party, x: number, align: "left" | "right") => {
    const entries = [
      { value: title, bold: true },
      { value: pdfText(party.name), bold: true },
      { value: `CUI: ${pdfText(party.cui)}`, bold: false },
      { value: `Nr. ord. reg. com.: ${pdfText(party.regNo)}`, bold: false },
      { value: `Sediu: ${pdfText(party.address)}`, bold: false },
      party.county ? { value: `Judetul ${pdfText(party.county)}`, bold: false } : null,
      party.iban ? { value: `IBAN: ${pdfText(party.iban)}`, bold: false } : null,
      party.bank ? { value: `Banca: ${pdfText(party.bank)}`, bold: false } : null,
      party.phone ? { value: `Telefon: ${pdfText(party.phone)}`, bold: false } : null,
      party.email ? { value: `Email: ${pdfText(party.email)}`, bold: false } : null,
    ].filter(Boolean) as Array<{ value: string; bold: boolean }>
    let y = margin + 3
    entries.forEach((entry) => {
      const size = entry.bold ? 10 : 8.8
      doc.font(entry.bold ? fonts.bold : fonts.regular).fontSize(size).fillColor(dark)
      const height = doc.heightOfString(entry.value, { width: leftW - 4, align })
      doc.text(entry.value, x, y, { width: leftW - 4, align })
      y += Math.max(entry.bold ? 12 : lineHeight, height + 2)
    })
    return y
  }

  const supplierEnd = drawParty("Furnizor:", input.supplier, margin, "left")
  const customerEnd = drawParty("Cumparator:", input.customer, rightX + 4, "left")
  doc.font(fonts.bold).fontSize(28).fillColor(dark).text("FACTURA", centerX, margin + 16, { width: centerW, align: "center" })
  const seriesText = `Seria: ${pdfText(input.number)} din ${new Date(input.issueDate).toLocaleDateString("ro-RO")}`
  const dueText = `Termen de plata: ${input.dueDate ? new Date(input.dueDate).toLocaleDateString("ro-RO") : "-"}`
  const headerTextY = margin + 54
  doc.font(fonts.regular).fontSize(10.5)
  const seriesHeight = doc.heightOfString(seriesText, { width: centerW, align: "center" })
  doc.text(seriesText, centerX, headerTextY, { width: centerW, align: "center" })
  const dueY = headerTextY + seriesHeight + 3
  const dueHeight = doc.heightOfString(dueText, { width: centerW, align: "center" })
  doc.text(dueText, centerX, dueY, { width: centerW, align: "center" })
  const vatY = Math.max(140, dueY + dueHeight + 5)
  doc.text(`Cota de TVA: ${pdfFmt(input.vatRate || 0, 0)}%`, centerX, vatY, { width: centerW, align: "center" })

  let y = Math.max(167, supplierEnd + 10, customerEnd + 10, vatY + lineHeight + 10)
  const cols = [238, 59, 60, 59, 60, 59]
  const headers = ["Produs", "Cantitate", "Pret unitar", "Discount", `Valoare ${input.currency}, fara TVA`, "Valoare TVA"]
  const cellTextHeight = (value: string, colWidth: number, bold = false, size = 8.5, align: "left" | "center" | "right" = "left") => {
    doc.font(bold ? fonts.bold : fonts.regular).fontSize(size)
    return doc.heightOfString(value, { width: colWidth - 8, align })
  }
  const drawCell = (x: number, top: number, colWidth: number, height: number, value: string, align: "left" | "center" | "right", bold = false, size = 8.5) => {
    doc.lineWidth(0.55).strokeColor(line).rect(x, top, colWidth, height).stroke()
    const textHeight = cellTextHeight(value, colWidth, bold, size, align)
    const textY = top + Math.max(4, (height - textHeight) / 2)
    doc.font(bold ? fonts.bold : fonts.regular).fontSize(size).fillColor(dark).text(value, x + 4, textY, { width: colWidth - 8, align })
  }
  const headerHeight = Math.max(32, ...headers.map((header, index) => cellTextHeight(header, cols[index], true, 8.5, index === 0 ? "left" : "center") + 10))
  let x = margin
  headers.forEach((header, index) => { drawCell(x, y, cols[index], headerHeight, header, index === 0 ? "left" : "center", true, 8.5); x += cols[index] })
  y += headerHeight
  input.lines.forEach((item) => {
    const itemName = pdfText(item.name)
    const values = [itemName, pdfFmt(item.qty, 0), pdfFmt(item.unitPrice), pdfNum(item.discount) > 0 ? pdfFmt(item.discount) : "-", pdfFmt(item.net), pdfFmt(item.vat)]
    const rowHeight = Math.max(20, ...values.map((value, index) => cellTextHeight(value, cols[index], index === 0, 8.5, index === 0 ? "left" : "right") + 10))
    if (y + rowHeight + 160 > doc.page.height - margin) {
      doc.addPage({ size: "A4", margin })
      y = margin
    }
    x = margin
    values.forEach((value, index) => { drawCell(x, y, cols[index], rowHeight, value, index === 0 ? "left" : "right", index === 0, 8.5); x += cols[index] })
    y += rowHeight
  })

  const totalsLabelWidth = cols.slice(0, 4).reduce((sum, value) => sum + value, 0)
  const drawSummaryRow = (label: string, netValue: string, vatValue: string, bold = false) => {
    drawCell(margin, y, totalsLabelWidth, 24, label, "right", bold, bold ? 10 : 9)
    drawCell(margin + totalsLabelWidth, y, cols[4], 24, netValue, "right", bold, bold ? 10 : 9)
    drawCell(margin + totalsLabelWidth + cols[4], y, cols[5], 24, vatValue, "right", bold, bold ? 10 : 9)
    y += 24
  }
  drawSummaryRow("Total, fara TVA", pdfFmt(input.totalNet), pdfFmt(input.totalVat), true)
  drawSummaryRow("Total de plata", pdfFmt(input.totalGross), "", true)

  y += 26
  const footerH = 60
  doc.lineWidth(0.55).strokeColor(line).rect(margin, y, width, footerH).stroke()
  doc.lineWidth(0.55).moveTo(margin + 160, y).lineTo(margin + 160, y + footerH).stroke()
  doc.font(fonts.regular).fontSize(8.7).fillColor(dark).text("Factura circula fara semnatura si stampila conform art 319 alin. 29 din Codul Fiscal", margin + 5, y + 8, { width: 148 })
  doc.font(fonts.regular).fontSize(8.7).text(input.note ? pdfText(input.note) : "Date privind expeditia\nNumele delegatului\nMijlocul de transport", margin + 167, y + 8, { width: width - 174 })
  if (input.spvDownloadId) {
    doc.font(fonts.regular).fontSize(8.5).fillColor(dark).text(`ID descarcare SPV: ${pdfText(input.spvDownloadId)}`, margin, y + footerH + 7, { width })
  }
}
