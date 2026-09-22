import { Link } from "react-router-dom"

type LegalPage = "privacy" | "terms" | "delete-account"

const supportEmail = "support@gufo.ink"

const privacySections = [
  ["Cine gestionează aplicația", "Gufo Delivery este operată de POSHARD IMPEX SRL pentru facilitarea comenzilor de mâncare de la restaurantele disponibile în aplicație."],
  ["Date pe care le folosim", "Folosim numele, e-mailul sau telefonul contului, adresele de livrare, nota pentru curier, comenzile și preferințele tale. Locația este folosită numai când acorzi permisiunea, pentru alegerea adresei și afișarea restaurantelor care livrează în zonă."],
  ["Scopul folosirii datelor", "Datele sunt folosite pentru autentificare, plasarea și urmărirea comenzii, livrare, suport, prevenirea abuzurilor și respectarea obligațiilor legale."],
  ["Partajarea datelor", "Datele necesare comenzii sunt transmise restaurantului și, unde este cazul, persoanei care livrează. Pentru adresă și hartă sunt folosite serviciile Google Maps/Places. Plata online se desfășoară în pagina securizată a procesatorului de plăți; Gufo Delivery nu stochează numărul complet al cardului sau CVV-ul."],
  ["Păstrare și drepturi", "Păstrăm datele cât timp ai cont sau cât este necesar pentru comenzi, suport și obligații legale. Poți cere acces, corectare, ștergere sau informații suplimentare prin e-mailul de suport."],
]

const termsSections = [
  ["Folosirea serviciului", "Gufo Delivery permite descoperirea restaurantelor, alegerea produselor și transmiterea comenzilor. Folosește date de contact și o adresă corecte pentru ca restaurantul sau curierul să poată onora comanda."],
  ["Comenzi și disponibilitate", "Produsele, prețurile, programul, taxele și disponibilitatea sunt stabilite de restaurant și pot fi actualizate. Comanda devine activă după confirmarea ei în aplicație și conform fluxului de plată ales."],
  ["Plăți", "Pentru plata online, datele cardului sunt procesate de pagina securizată a procesatorului de plăți. Pentru numerar sau plata la livrare, plata se realizează conform opțiunii selectate la checkout."],
  ["Anulări și suport", "Pentru o comandă în lucru, contactează restaurantul sau suportul cât mai repede. Posibilitatea de anulare, rambursare sau modificare depinde de stadiul pregătirii și de situația concretă a comenzii."],
  ["Actualizări", "Putem actualiza aplicația și aceste informații pentru funcționare, securitate sau respectarea legii."],
]

export default function DeliveryLegalPublic({ page }: { page: LegalPage }) {
  const isPrivacy = page === "privacy"
  const isDeletion = page === "delete-account"
  const title = isDeletion ? "Solicită ștergerea contului" : isPrivacy ? "Politica de confidențialitate" : "Termeni și condiții"
  const sections = isPrivacy ? privacySections : termsSections
  const deletionMail = `mailto:${supportEmail}?subject=${encodeURIComponent("Solicitare ștergere cont Gufo Delivery")}&body=${encodeURIComponent("Te rog să ștergeți contul meu Gufo Delivery.\n\nE-mailul sau telefonul asociat contului: \n\n")}`

  return (
    <main className="min-h-screen bg-[#f4f7f5] px-5 py-10 text-[#16342c] sm:px-8">
      <section className="mx-auto max-w-3xl overflow-hidden rounded-[28px] border border-emerald-100 bg-white shadow-[0_24px_70px_rgba(22,52,44,0.12)]">
        <header className="bg-gradient-to-br from-[#087f5b] via-[#0c9d70] to-[#60c78d] px-7 py-10 text-white sm:px-10">
          <div className="text-sm font-bold uppercase tracking-[0.2em] text-emerald-100">Gufo Delivery</div>
          <h1 className="mt-3 text-3xl font-black tracking-tight sm:text-4xl">{title}</h1>
          <p className="mt-3 max-w-xl text-sm leading-6 text-emerald-50">Informații pentru utilizatorii aplicației Gufo Delivery.</p>
        </header>

        <div className="px-7 py-8 sm:px-10 sm:py-10">
          {isDeletion ? (
            <div className="space-y-6">
              <p className="text-base leading-7 text-slate-700">Poți solicita ștergerea contului Gufo Delivery și a datelor asociate care nu trebuie păstrate prin lege, inclusiv profilul, adresele salvate și preferințele.</p>
              <div className="rounded-2xl border border-amber-200 bg-amber-50 p-5 text-sm leading-6 text-amber-950">
                Istoricul comenzilor și documentele de plată pot fi păstrate numai în măsura necesară pentru obligații fiscale, contabile, reclamații sau prevenirea fraudei.
              </div>
              <a href={deletionMail} className="inline-flex w-full items-center justify-center rounded-2xl bg-[#087f5b] px-5 py-4 text-center font-bold text-white transition hover:bg-[#066b4c] sm:w-auto">
                Trimite cererea de ștergere
              </a>
              <p className="text-sm leading-6 text-slate-500">Dacă nu ai aplicație de e-mail configurată, trimite cererea manual la <a className="font-semibold text-[#087f5b]" href={`mailto:${supportEmail}`}>{supportEmail}</a>, menționând e-mailul sau telefonul asociat contului.</p>
            </div>
          ) : (
            <div className="space-y-7">
              {sections.map(([heading, body]) => (
                <article key={heading}>
                  <h2 className="text-lg font-extrabold text-[#16342c]">{heading}</h2>
                  <p className="mt-2 text-sm leading-7 text-slate-600">{body}</p>
                </article>
              ))}
            </div>
          )}

          <footer className="mt-10 border-t border-slate-100 pt-6 text-sm text-slate-500">
            <div>Ultima actualizare: 22 septembrie 2026</div>
            <nav className="mt-3 flex flex-wrap gap-x-4 gap-y-2 font-semibold text-[#087f5b]">
              <Link to="/privacy">Confidențialitate</Link>
              <Link to="/terms">Termeni</Link>
              <Link to="/delete-account">Ștergere cont</Link>
            </nav>
          </footer>
        </div>
      </section>
    </main>
  )
}
