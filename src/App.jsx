import { BrowserRouter, NavLink, Route, Routes } from 'react-router-dom'
import './App.css'

function HomePage() {
  return <h2>Home Page</h2>
}

function AboutPage() {
  return <h2>About Page</h2>
}

function ServicesPage() {
  return <h2>Services Page</h2>
}

function BlogPage() {
  return <h2>Blog Page</h2>
}

function ContactPage() {
  return <h2>Contact Page</h2>
}

function NotFoundPage() {
  return <h2>Page not found</h2>
}

function AppLayout() {
  const links = [
    { to: '/', label: 'Home' },
    { to: '/about', label: 'About' },
    { to: '/services', label: 'Services' },
    { to: '/blog', label: 'Blog' },
    { to: '/contact', label: 'Contact' },
  ]

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
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/about" element={<AboutPage />} />
          <Route path="/services" element={<ServicesPage />} />
          <Route path="/blog" element={<BlogPage />} />
          <Route path="/contact" element={<ContactPage />} />
          <Route path="*" element={<NotFoundPage />} />
        </Routes>
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
