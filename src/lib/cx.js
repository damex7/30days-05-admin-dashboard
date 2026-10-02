/** Join class names, skipping false/null/undefined: cx('a', isOn && 'b'). */
export const cx = (...classes) => classes.filter(Boolean).join(' ')

/** useId() can contain characters that break SVG url(#id) references; keep it plain. */
export const safeId = (id) => id.replace(/[^a-zA-Z0-9_-]/g, '')
