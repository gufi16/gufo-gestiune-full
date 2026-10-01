type PageHeaderProps = {
  title: string
  subtitle?: string
  badge?: string
}

export default function PageHeader({ title, subtitle, badge }: PageHeaderProps) {
  return (
    <div className="w-full rounded-2xl border border-[#e5dccd] bg-[radial-gradient(circle_at_top_right,rgba(203,137,83,0.14),transparent_30%),linear-gradient(135deg,#fffdf8_0%,#f7f1e7_100%)] px-3.5 py-3 shadow-[0_12px_30px_rgba(71,56,38,0.07)] md:px-4 md:py-3.5">
      {badge ? (
        <div className="mb-1.5 inline-flex rounded-full border border-[#e4d7c4] bg-[#fffaf1] px-2 py-0.5 text-[9px] font-semibold uppercase tracking-[0.16em] text-[#745b3e] shadow-sm shadow-slate-900/[0.02]">
          {badge}
        </div>
      ) : null}

      <h1 className="text-[23px] font-semibold tracking-[-0.02em] text-[#334036] md:text-[25px]">{title}</h1>
      {subtitle ? (
        <p className="mt-1 max-w-4xl text-[13px] leading-5 text-slate-500">{subtitle}</p>
      ) : null}
    </div>
  )
}
