import { useEffect, useState } from 'react'
import { Outlet } from 'react-router-dom'
import { TODAY } from '../../lib/dates.js'
import { formatDate } from '../../lib/format.js'
import Button from '../ui/Button.jsx'
import Drawer from '../ui/Drawer.jsx'
import { MenuIcon } from '../ui/Icons.jsx'
import SidebarNav, { Brand } from './SidebarNav.jsx'
import ThemeToggle from './ThemeToggle.jsx'

/*
  The frame around every page. On large screens the sidebar is always
  visible; below `lg` it moves into a Drawer opened by the menu button.
  <Outlet /> is where React Router renders the current page.
*/
export default function AppShell() {
  const [menuOpen, setMenuOpen] = useState(false)

  // If the window grows to desktop size while the menu is open, close it
  useEffect(() => {
    const desktop = window.matchMedia('(min-width: 64rem)')
    const onChange = (event) => event.matches && setMenuOpen(false)
    desktop.addEventListener('change', onChange)
    return () => desktop.removeEventListener('change', onChange)
  }, [])

  return (
    <div className="min-h-dvh lg:grid lg:grid-cols-[16rem_minmax(0,1fr)]">
      <a
        href="#main"
        className="fixed top-3 left-3 z-50 -translate-y-20 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-on-primary shadow-pop transition-transform focus:translate-y-0"
      >
        Skip to content
      </a>

      <aside className="sticky top-0 hidden h-dvh lg:block">
        <SidebarNav />
      </aside>

      <Drawer
        open={menuOpen}
        onClose={() => setMenuOpen(false)}
        side="left"
        width="sm"
        hideHeader
        label="Main menu"
      >
        <SidebarNav onNavigate={() => setMenuOpen(false)} />
      </Drawer>

      <div className="min-w-0">
        <header className="sticky top-0 z-20 flex h-16 items-center gap-3 border-b border-line bg-paper/90 px-4 backdrop-blur sm:px-6 lg:px-8">
          <Button
            variant="ghost"
            iconOnly
            icon={<MenuIcon />}
            aria-label="Open menu"
            aria-expanded={menuOpen}
            className="lg:hidden"
            onClick={() => setMenuOpen(true)}
          />
          <div className="rounded-lg bg-sidebar px-2 py-1 text-sidebar-ink lg:hidden">
            <span className="sr-only">Kasuwa store admin</span>
            <span aria-hidden="true" className="block scale-90">
              <Brand />
            </span>
          </div>
          <p className="ml-auto hidden text-sm text-ink-soft sm:block">
            Data as of <span className="font-medium text-ink">{formatDate(`${TODAY}T12:00:00+01:00`)}</span>
          </p>
          <div className="ml-auto sm:ml-0">
            <ThemeToggle />
          </div>
        </header>

        <main id="main" tabIndex={-1} className="mx-auto w-full max-w-[1400px] px-4 py-6 outline-none sm:px-6 lg:px-8 lg:py-8">
          <Outlet />
        </main>
      </div>
    </div>
  )
}
