import { lazy, Suspense } from 'react'
import { Route, Routes } from 'react-router-dom'
import AppShell from './components/layout/AppShell.jsx'
import { Skeleton } from './components/ui'

/*
  Each page is loaded on demand (code splitting): visiting /orders doesn't
  download Recharts, which only the Overview needs. Suspense shows a
  placeholder while a page's file downloads.
*/
const Overview = lazy(() => import('./pages/Overview.jsx'))
const Orders = lazy(() => import('./pages/Orders.jsx'))
const Customers = lazy(() => import('./pages/Customers.jsx'))
const Products = lazy(() => import('./pages/Products.jsx'))
const UiKit = lazy(() => import('./pages/UiKit.jsx'))
const NotFound = lazy(() => import('./pages/NotFound.jsx'))

function PageFallback() {
  return (
    <div aria-busy="true">
      <span className="sr-only">Loading page</span>
      <Skeleton height={32} width="12rem" />
      <Skeleton width="20rem" className="mt-3" />
      <Skeleton variant="rect" height={320} className="mt-8" />
    </div>
  )
}

const page = (Component) => (
  <Suspense fallback={<PageFallback />}>
    <Component />
  </Suspense>
)

export default function App() {
  return (
    <Routes>
      <Route element={<AppShell />}>
        <Route index element={page(Overview)} />
        <Route path="orders" element={page(Orders)} />
        <Route path="customers" element={page(Customers)} />
        <Route path="products" element={page(Products)} />
        <Route path="ui" element={page(UiKit)} />
        <Route path="*" element={page(NotFound)} />
      </Route>
    </Routes>
  )
}
