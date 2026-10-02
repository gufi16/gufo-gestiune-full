import PDFDocument from "pdfkit"
import { pdfFmt, pdfText, registerPdfFonts } from "./professionalPdf"

type Party = {
  name?: unknown
  cui?: unknown
  regNo?: unknown
  address?: unknown
  county?: unknown
  iban?: unknown
  bank?: unknown
}

const units = ["", "unu", "doi", "trei", "patru", "cinci", "sase", "sapte", "opt", "noua", "zece", "unsprezece", "doisprezece", "treisprezece", "paisprezece", "cincisprezece", "saisprezece", "saptesprezece", "optsprezece", "nouasprezece"]
const tens = ["", "", "douazeci", "treizeci", "patruzeci", "cincizeci", "saizeci", "saptezeci", "optzeci", "nouazeci"]

function numberToWordsUnderThousand(value: number): string {
  const number = Math.max(0, Math.floor(value))
  if (number < 20) return units[number]
  if (number < 100) return `${tens[Math.floor(number / 10)]}${number % 10 ? ` si ${units[number % 10]}` : ""}`
  const hundreds = Math.floor(number / 100)
  const hundredLabel = hundreds === 1 ? "o suta" : hundreds === 2 ? "doua sute" : `${units[hundreds]} sute`
  return `${hundredLabel}${number % 100 ? ` ${numberToWordsUnderThousand(number % 100)}` : ""}`
}

function amountToRomanianWords(amount: unknown, currency: string) {
  const safe = Math.max(0, Number(amount) || 0)
  const integer = Math.floor(safe)
  const pennies = Math.round((safe - integer) * 100)
  const millions = Math.floor(integer / 1_000_000)
  const thousands = Math.floor((integer % 1_000_000) / 1000)
  const rest = integer % 1000
  const fragments: string[] = []

  if (millions) fragments.push(`${numberToWordsUnderThousand(millions)} ${millions === 1 ? "milion" : "milioane"}`)
  if (thousands) fragments.push(`${numberToWordsUnderThousand(thousands)} ${thousands === 1 ? "mie" : "mii"}`)
  if (rest || fragments.length === 0) fragments.push(numberToWordsUnderThousand(rest) || "zero")

  const moneyLabel = String(currency || "RON").toUpperCase() === "RON" ? "lei" : String(currency || "RON").toUpperCase()
  return `${fragments.join(" ")} ${moneyLabel} si ${String(pennies).padStart(2, "0")} bani`
}

export function drawCashReceiptPdf(doc: PDFKit.PDFDocument, input: {
  supplier: Party
  payer: Party
  receiptNo: string
  receiptDate: Date | string
  amount: unknown
  currency: string
  invoiceDocNo: string
}) {
  const fonts = registerPdfFonts(doc)
  const pageMargin = 34
  const contentWidth = doc.page.width - pageMargin * 2
  const copyHeight = 348
  const drawCopy = (top: number) => {
    const leftX = pageMargin
    const rightX = pageMargin + contentWidth - 168
    const lineHeight = 13
    const supplierLines = [
      ["Furnizor:", true],
      [pdfText(input.supplier.name), true],
      [`CUI: ${pdfText(input.supplier.cui)}`, false],
      [`Nr. ord. reg. com.: ${pdfText(input.supplier.regNo)}`, false],
      [`Sediu: ${pdfText(input.supplier.address)}`, false],
      input.supplier.county ? [`Judet: ${pdfText(input.supplier.county)}`, false] : null,
      input.supplier.iban ? [`IBAN: ${pdfText(input.supplier.iban)}`, false] : null,
      input.supplier.bank ? [`Banca: ${pdfText(input.supplier.bank)}`, false] : null,
    ].filter(Boolean) as Array<[string, boolean]>

    let supplierY = top
    supplierLines.forEach(([text, bold]) => {
      doc.font(bold ? fonts.bold : fonts.regular).fontSize(bold ? 9.5 : 8.2).fillColor("#111111")
      doc.text(text, leftX, supplierY, { width: 250 })
      supplierY += bold ? 13 : lineHeight
    })

    doc.font(fonts.bold).fontSize(18).fillColor("#111111").text("CHITANTA", rightX, top + 4, { width: 168, align: "right" })
    doc.font(fonts.regular).fontSize(9.5).text(`Numar ${pdfText(input.receiptNo)}`, rightX, top + 30, { width: 168, align: "right" })
    doc.text(`Data ${new Date(input.receiptDate).toLocaleDateString("ro-RO")}`, rightX, top + 44, { width: 168, align: "right" })

    const fields = [
      ["Am primit de la:", pdfText(input.payer.name)],
      ["CIF:", pdfText(input.payer.cui)],
      ["Adresa:", pdfText(input.payer.address)],
      ["Suma de:", `${pdfFmt(input.amount)} ${pdfText(input.currency)}`],
      ["adica:", amountToRomanianWords(input.amount, input.currency)],
      ["Reprezentand:", `Contravaloare factura ${pdfText(input.invoiceDocNo)}`],
    ]
    let y = Math.max(top + 122, supplierY + 12)
    fields.forEach(([label, value], index) => {
      doc.font(fonts.bold).fontSize(9).fillColor("#111111").text(label, leftX, y, { width: 102 })
      doc.font(fonts.regular).fontSize(index === 4 ? 8.4 : 9).text(value || "-", leftX + 104, y, { width: contentWidth - 104 })
      y += index === 4 ? 25 : 20
    })

    doc.font(fonts.regular).fontSize(9).text("Semnatura: ...............................", rightX - 8, top + 264, { width: 176, align: "right" })
  }

  drawCopy(pageMargin)
  const dividerY = pageMargin + copyHeight - 4
  doc.save().dash(2, { space: 3 }).strokeColor("#666666").lineWidth(0.5).moveTo(pageMargin, dividerY).lineTo(pageMargin + contentWidth, dividerY).stroke().undash().restore()
  drawCopy(pageMargin + copyHeight + 12)
}
