type PageHeaderProps = {
  title: string
  subtitle?: string
  badge?: string
}

export default function PageHeader({ title, subtitle, badge }: PageHeaderProps) {
  return (
    <div className="w-full rounded-2xl border border-slate-200/90 bg-[linear-gradient(180deg,#FFFFFF_0%,#F9FBFD_100%)] px-3.5 py-3 shadow-sm shadow-slate-900/[0.03] md:px-4 md:py-3.5">
      {badge ? (
        <div className="mb-1.5 inline-flex rounded-full border border-slate-200 bg-white px-2 py-0.5 text-[9px] font-semibold uppercase tracking-[0.16em] text-slate-600 shadow-sm shadow-slate-900/[0.02]">
          {badge}
        </div>
      ) : null}

      <h1 className="text-[23px] font-semibold tracking-[-0.02em] text-[#17324D] md:text-[25px]">{title}</h1>
      {subtitle ? (
        <p className="mt-1 max-w-4xl text-[13px] leading-5 text-slate-500">{subtitle}</p>
      ) : null}
    </div>
  )
}
