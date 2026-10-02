import { NavLink, Outlet } from 'react-router-dom'

// Temporary shell; the real sidebar and top bar arrive with the layout milestone.
export default function AppShell() {
  return (
    <div className="min-h-dvh">
      <nav className="flex gap-4 bg-sidebar p-4 text-sidebar-ink">
        <NavLink to="/">Overview</NavLink>
        <NavLink to="/orders">Orders</NavLink>
        <NavLink to="/customers">Customers</NavLink>
        <NavLink to="/products">Products</NavLink>
        <NavLink to="/ui">UI kit</NavLink>
      </nav>
      <main className="p-6">
        <Outlet />
      </main>
    </div>
  )
}
