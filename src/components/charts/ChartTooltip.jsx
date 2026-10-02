/*
  Recharts' default tooltip is white with hard-coded styles; this one uses
  our tokens so it works in dark mode. Recharts passes `active` and
  `payload` (the hovered data points); `render` decides what to show.
*/
export default function ChartTooltip({ active, payload, render }) {
  if (!active || !payload?.length) return null
  return (
    <div className="min-w-40 rounded-lg border border-line bg-panel px-3 py-2 text-sm text-ink shadow-pop">
      {render(payload[0].payload, payload)}
    </div>
  )
}

/** One "● Label ....... value" row inside a tooltip. */
export function TooltipRow({ color, dashed, label, value }) {
  return (
    <div className="flex items-center justify-between gap-4 py-0.5">
      <span className="flex items-center gap-2 text-ink-soft">
        <span
          aria-hidden="true"
          className="inline-block h-0.5 w-3"
          style={{ background: dashed ? 'none' : color, borderTop: dashed ? `2px dashed ${color}` : undefined }}
        />
        {label}
      </span>
      <span className="font-medium tabular">{value}</span>
    </div>
  )
}
