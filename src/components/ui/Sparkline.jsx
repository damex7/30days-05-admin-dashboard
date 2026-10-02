import { useId } from 'react'
import { cx } from '../../lib/cx.js'

/*
  A sparkline drawn by hand in SVG: map each value to an x/y point in a
  100×32 box and join them with a polyline. No axes and no tooltips, which
  is why it doesn't need a chart library. Compare it with the Recharts
  charts, which also need scales, ticks, tooltips and resizing.

  It is decorative: the StatCard next to it states the value in text.
*/
const WIDTH = 100
const HEIGHT = 32
const PAD = 2

export default function Sparkline({ data = [], color = 'var(--color-chart-1)', className }) {
  const gradientId = useId()
  if (data.length < 2) return null

  const min = Math.min(...data)
  const max = Math.max(...data)
  const span = max - min || 1
  const points = data.map((value, i) => {
    const x = (i / (data.length - 1)) * WIDTH
    const y = PAD + (1 - (value - min) / span) * (HEIGHT - PAD * 2) // SVG y grows downwards
    return `${x.toFixed(2)},${y.toFixed(2)}`
  })
  const line = points.join(' ')
  const area = `0,${HEIGHT} ${line} ${WIDTH},${HEIGHT}`

  return (
    <svg
      viewBox={`0 0 ${WIDTH} ${HEIGHT}`}
      preserveAspectRatio="none"
      aria-hidden="true"
      focusable="false"
      className={cx('h-8 w-full overflow-visible', className)}
    >
      <defs>
        <linearGradient id={gradientId} x1="0" x2="0" y1="0" y2="1">
          <stop offset="0%" stopColor={color} stopOpacity="0.22" />
          <stop offset="100%" stopColor={color} stopOpacity="0" />
        </linearGradient>
      </defs>
      <polygon points={area} fill={`url(#${gradientId})`} />
      {/* non-scaling-stroke keeps the line 2px even though the SVG is stretched */}
      <polyline
        points={line}
        fill="none"
        stroke={color}
        strokeWidth="2"
        strokeLinejoin="round"
        strokeLinecap="round"
        vectorEffect="non-scaling-stroke"
      />
    </svg>
  )
}
