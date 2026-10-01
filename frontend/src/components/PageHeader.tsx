type PageHeaderProps = {
  title: string
  subtitle?: string
  badge?: string
}

export default function PageHeader({ title, subtitle, badge }: PageHeaderProps) {
  return (
    <div className="w-full rounded-2xl border border-[#dce3e8] bg-[radial-gradient(circle_at_top_right,rgba(89,163,176,0.13),transparent_30%),linear-gradient(135deg,#ffffff_0%,#f1f6f7_100%)] px-3.5 py-3 shadow-[0_12px_30px_rgba(37,58,70,0.07)] md:px-4 md:py-3.5">
      {badge ? (
        <div className="mb-1.5 inline-flex rounded-full border border-[#d7e4e7] bg-[#f2f8f8] px-2 py-0.5 text-[9px] font-semibold uppercase tracking-[0.16em] text-[#3d6875] shadow-sm shadow-slate-900/[0.02]">
          {badge}
        </div>
      ) : null}

      <h1 className="text-[23px] font-semibold tracking-[-0.02em] text-[#294b5a] md:text-[25px]">{title}</h1>
      {subtitle ? (
        <p className="mt-1 max-w-4xl text-[13px] leading-5 text-slate-500">{subtitle}</p>
      ) : null}
    </div>
  )
}
