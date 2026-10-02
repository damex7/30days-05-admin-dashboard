/** Join class names, skipping false/null/undefined: cx('a', isOn && 'b'). */
export const cx = (...classes) => classes.filter(Boolean).join(' ')
