import { lazy, Suspense, useEffect, useState } from 'react'
import { BrowserRouter, NavLink, Route, Routes } from 'react-router-dom'
import './App.css'
import LazyLoadErrorBoundary from './components/LazyLoadErrorBoundary.jsx'
import { importWithManifestRetry, manifestRetryEventName } from './utils/manifest.js'

const HomePage = lazy(() =>
  importWithManifestRetry(() => import('./pages/HomePage.jsx'), 'src/pages/HomePage.jsx'),
)
const AboutPage = lazy(() =>
  importWithManifestRetry(() => import('./pages/AboutPage.jsx'), 'src/pages/AboutPage.jsx'),
)
const ServicesPage = lazy(() =>
  importWithManifestRetry(() => import('./pages/ServicesPage.jsx'), 'src/pages/ServicesPage.jsx'),
)
const BlogPage = lazy(() =>
  importWithManifestRetry(() => import('./pages/BlogPage.jsx'), 'src/pages/BlogPage.jsx'),
)
const ContactPage = lazy(() =>
  importWithManifestRetry(() => import('./pages/ContactPage.jsx'), 'src/pages/ContactPage.jsx'),
)
const NotFoundPage = lazy(() =>
  importWithManifestRetry(() => import('./pages/NotFoundPage.jsx'), 'src/pages/NotFoundPage.jsx'),
)

function AppLayout() {
  const [isRefreshingBuild, setIsRefreshingBuild] = useState(false)
  const links = [
    { to: '/', label: 'Home' },
    { to: '/about', label: 'About' },
    { to: '/services', label: 'Services' },
    { to: '/blog', label: 'Blog' },
    { to: '/contact', label: 'Contact' },
  ]

  useEffect(() => {
    const handleManifestRetryStatus = (event) => {
      setIsRefreshingBuild(Boolean(event.detail?.isRetrying))
    }

    window.addEventListener(manifestRetryEventName, handleManifestRetryStatus)

    return () => {
      window.removeEventListener(manifestRetryEventName, handleManifestRetryStatus)
    }
  }, [])

  return (
    <div className="app-container">
      <header className="app-header">
        <h1>React Router Demo</h1>
        <nav className="app-nav">
          {links.map((link) => (
            <NavLink
              key={link.to}
              to={link.to}
              className={({ isActive }) => (isActive ? 'nav-link active' : 'nav-link')}
              end={link.to === '/'}
            >
              {link.label}
            </NavLink>
          ))}
        </nav>
      </header>

      <main className="page-content">
        {isRefreshingBuild ? (
          <div className="build-refresh-overlay" role="status" aria-live="polite">
            <div className="build-refresh-spinner" />
            <p>New build detected, fetching latest content...</p>
          </div>
        ) : null}
        <LazyLoadErrorBoundary>
          <Suspense fallback={<p>Loading page...</p>}>
            <Routes>
              <Route path="/" element={<HomePage />} />
              <Route path="/about" element={<AboutPage />} />
              <Route path="/services" element={<ServicesPage />} />
              <Route path="/blog" element={<BlogPage />} />
              <Route path="/contact" element={<ContactPage />} />
              <Route path="*" element={<NotFoundPage />} />
            </Routes>
          </Suspense>
        </LazyLoadErrorBoundary>
      </main>
    </div>
  )
}

function App() {
  return (
    <BrowserRouter>
      <AppLayout />
    </BrowserRouter>
  )
}

export default App
