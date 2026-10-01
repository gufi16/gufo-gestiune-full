type PageHeaderProps = {
  title: string
  subtitle?: string
  badge?: string
}

export default function PageHeader({ title, subtitle, badge }: PageHeaderProps) {
  return (
    <header className="workspace-page-header w-full border border-[#d8e0e7] bg-white px-4 py-3 md:px-5 md:py-3.5">
      {badge ? (
        <div className="mb-1.5 inline-flex rounded-full border border-[#d7e4e7] bg-[#f2f8f8] px-2 py-0.5 text-[9px] font-semibold uppercase tracking-[0.16em] text-[#3d6875] shadow-sm shadow-slate-900/[0.02]">
          {badge}
        </div>
      ) : null}

      <h1 className="text-[22px] font-semibold tracking-[-0.015em] text-[#243342] md:text-[24px]">{title}</h1>
      {subtitle ? (
        <p className="mt-1 max-w-4xl text-[13px] leading-5 text-slate-500">{subtitle}</p>
      ) : null}
    </header>
  )
}
