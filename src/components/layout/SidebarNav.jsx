import { NavLink } from 'react-router-dom'
import { cx } from '../../lib/cx.js'
import { CustomersIcon, OrdersIcon, OverviewIcon, ProductsIcon, SwatchIcon } from '../ui/Icons.jsx'

export const NAV_ITEMS = [
  { to: '/', label: 'Overview', icon: OverviewIcon, end: true },
  { to: '/orders', label: 'Orders', icon: OrdersIcon },
  { to: '/customers', label: 'Customers', icon: CustomersIcon },
  { to: '/products', label: 'Products', icon: ProductsIcon },
]

const SECONDARY_ITEMS = [{ to: '/ui', label: 'UI kit', icon: SwatchIcon }]

export function Brand() {
  return (
    <div className="flex items-center gap-2.5">
      <span
        aria-hidden="true"
        className="flex size-9 items-center justify-center rounded-lg bg-[#e0a43a] font-display text-lg font-bold text-[#0f3d2e]"
      >
        K
      </span>
      <span className="leading-tight">
        <span className="block font-display text-lg font-semibold tracking-tight">Kasuwa</span>
        <span className="block text-xs text-sidebar-soft">Store admin</span>
      </span>
    </div>
  )
}

function NavItem({ item, onNavigate }) {
  const Icon = item.icon
  return (
    <li>
      <NavLink
        to={item.to}
        end={item.end}
        onClick={onNavigate}
        className={({ isActive }) =>
          cx(
            'relative flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors',
            isActive
              ? 'bg-sidebar-active text-sidebar-ink before:absolute before:inset-y-2 before:-left-3 before:w-1 before:rounded-r before:bg-[#e0a43a]'
              : 'text-sidebar-soft hover:bg-sidebar-active/60 hover:text-sidebar-ink',
          )
        }
      >
        <Icon size={18} />
        {item.label}
      </NavLink>
    </li>
  )
}

/*
  The navigation itself. Used twice: in the fixed sidebar on desktop and
  inside a Drawer on phones (onNavigate closes the drawer after a click).
*/
export default function SidebarNav({ onNavigate }) {
  return (
    <div className="flex h-full flex-col bg-sidebar px-5 py-6 text-sidebar-ink">
      <Brand />
      <nav aria-label="Main" className="mt-8 flex flex-1 flex-col">
        <ul className="flex flex-col gap-1">
          {NAV_ITEMS.map((item) => (
            <NavItem key={item.to} item={item} onNavigate={onNavigate} />
          ))}
        </ul>
        <p className="mt-8 mb-2 px-3 text-xs font-semibold tracking-wider text-sidebar-soft uppercase">Design</p>
        <ul className="flex flex-col gap-1">
          {SECONDARY_ITEMS.map((item) => (
            <NavItem key={item.to} item={item} onNavigate={onNavigate} />
          ))}
        </ul>
      </nav>
      <p className="mt-6 border-t border-white/10 pt-4 text-xs leading-relaxed text-sidebar-soft">
        Kasuwa is a fictional store.
        <br />
        All data is generated sample data.
      </p>
    </div>
  )
}
