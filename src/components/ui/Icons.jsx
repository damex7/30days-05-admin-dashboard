/*
  A small inline SVG icon set (24×24, 2px stroke). Inline SVG inherits
  currentColor, so icons follow the text colour in both themes.
  Icons are decorative (aria-hidden); the button or label carries the meaning.
*/
function Icon({ size = 18, className, children, ...props }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      focusable="false"
      className={className}
      {...props}
    >
      {children}
    </svg>
  )
}

export const OverviewIcon = (p) => (
  <Icon {...p}>
    <path d="M3 13h8V3H3zM13 21h8V11h-8zM13 3v6h8V3zM3 21h8v-6H3z" />
  </Icon>
)
export const OrdersIcon = (p) => (
  <Icon {...p}>
    <path d="M6 2h12v20l-3-2-3 2-3-2-3 2z" />
    <path d="M9 7h6M9 11h6M9 15h4" />
  </Icon>
)
export const CustomersIcon = (p) => (
  <Icon {...p}>
    <circle cx="9" cy="8" r="4" />
    <path d="M2 21a7 7 0 0 1 14 0M16 3.5a4 4 0 0 1 0 9M22 21a7 7 0 0 0-4-6.3" />
  </Icon>
)
export const ProductsIcon = (p) => (
  <Icon {...p}>
    <path d="M21 8 12 3 3 8v8l9 5 9-5z" />
    <path d="m3 8 9 5 9-5M12 13v8" />
  </Icon>
)
export const SwatchIcon = (p) => (
  <Icon {...p}>
    <rect x="3" y="3" width="7" height="18" rx="2" />
    <path d="M10 8.5 14.5 4l5 5L10 18.5M10 21h10a1 1 0 0 0 1-1v-6h-4.5" />
  </Icon>
)
export const SearchIcon = (p) => (
  <Icon {...p}>
    <circle cx="11" cy="11" r="7" />
    <path d="m20 20-3.5-3.5" />
  </Icon>
)
export const CloseIcon = (p) => (
  <Icon {...p}>
    <path d="M18 6 6 18M6 6l12 12" />
  </Icon>
)
export const MenuIcon = (p) => (
  <Icon {...p}>
    <path d="M4 6h16M4 12h16M4 18h16" />
  </Icon>
)
export const ChevronLeftIcon = (p) => (
  <Icon {...p}>
    <path d="m15 18-6-6 6-6" />
  </Icon>
)
export const ChevronRightIcon = (p) => (
  <Icon {...p}>
    <path d="m9 18 6-6-6-6" />
  </Icon>
)
export const ChevronDownIcon = (p) => (
  <Icon {...p}>
    <path d="m6 9 6 6 6-6" />
  </Icon>
)
export const SortIcon = (p) => (
  <Icon {...p}>
    <path d="m7 9 5-5 5 5M7 15l5 5 5-5" />
  </Icon>
)
export const ArrowUpIcon = (p) => (
  <Icon {...p}>
    <path d="M12 19V5M5 12l7-7 7 7" />
  </Icon>
)
export const ArrowDownIcon = (p) => (
  <Icon {...p}>
    <path d="M12 5v14M19 12l-7 7-7-7" />
  </Icon>
)
export const SunIcon = (p) => (
  <Icon {...p}>
    <circle cx="12" cy="12" r="4" />
    <path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4" />
  </Icon>
)
export const MoonIcon = (p) => (
  <Icon {...p}>
    <path d="M21 12.8A9 9 0 1 1 11.2 3a7 7 0 0 0 9.8 9.8z" />
  </Icon>
)
export const DownloadIcon = (p) => (
  <Icon {...p}>
    <path d="M12 3v12M7 10l5 5 5-5M5 21h14" />
  </Icon>
)
export const RefreshIcon = (p) => (
  <Icon {...p}>
    <path d="M21 12a9 9 0 0 1-15.5 6.2L3 16M3 12A9 9 0 0 1 18.5 5.8L21 8" />
    <path d="M21 3v5h-5M3 21v-5h5" />
  </Icon>
)
export const AlertIcon = (p) => (
  <Icon {...p}>
    <path d="M10.3 3.9 1.8 18a2 2 0 0 0 1.7 3h17a2 2 0 0 0 1.7-3L13.7 3.9a2 2 0 0 0-3.4 0z" />
    <path d="M12 9v4M12 17h.01" />
  </Icon>
)
export const InboxIcon = (p) => (
  <Icon {...p}>
    <path d="M22 12h-6l-2 3h-4l-2-3H2" />
    <path d="M5.5 5.1 2 12v6a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-6l-3.5-6.9A2 2 0 0 0 16.8 4H7.2a2 2 0 0 0-1.7 1.1z" />
  </Icon>
)
export const PlusIcon = (p) => (
  <Icon {...p}>
    <path d="M12 5v14M5 12h14" />
  </Icon>
)
export const ExternalIcon = (p) => (
  <Icon {...p}>
    <path d="M15 3h6v6M10 14 21 3M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
  </Icon>
)
