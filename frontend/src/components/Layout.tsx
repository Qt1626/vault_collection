import { Link, NavLink, Outlet, useNavigate } from 'react-router-dom'
import { useAuth } from '../auth/AuthContext'

const navClass = ({ isActive }: { isActive: boolean }) =>
  `rounded-md px-3 py-2 text-sm font-medium ${isActive ? 'bg-white/15 text-white' : 'text-brand-100 hover:text-white'}`

export function Layout() {
  const { username, isAuthenticated, signOut } = useAuth()
  const navigate = useNavigate()

  return (
    <div className="flex min-h-screen flex-col">
      <header className="bg-brand-700 shadow">
        <nav className="mx-auto flex max-w-6xl flex-wrap items-center gap-2 px-4 py-3">
          <Link to="/" className="mr-4 flex items-center gap-2 text-lg font-bold text-white">
            <span className="text-gold-400">★</span> PinVault
          </Link>
          <NavLink to="/" end className={navClass}>
            Catalogue
          </NavLink>
          {isAuthenticated && (
            <>
              <NavLink to="/collection" className={navClass}>
                Ma collection
              </NavLink>
              <NavLink to="/pins/new" className={navClass}>
                Ajouter un pin
              </NavLink>
            </>
          )}
          <div className="ml-auto flex items-center gap-2">
            {isAuthenticated ? (
              <>
                <span className="text-sm text-brand-100">@{username}</span>
                <button
                  onClick={() => {
                    signOut()
                    navigate('/')
                  }}
                  className="rounded-md bg-white/10 px-3 py-2 text-sm text-white hover:bg-white/20"
                >
                  Déconnexion
                </button>
              </>
            ) : (
              <>
                <NavLink to="/login" className={navClass}>
                  Connexion
                </NavLink>
                <Link to="/register" className="rounded-md bg-gold-400 px-3 py-2 text-sm font-semibold text-slate-900">
                  Créer un compte
                </Link>
              </>
            )}
          </div>
        </nav>
      </header>
      <main className="mx-auto w-full max-w-6xl flex-1 px-4 py-8">
        <Outlet />
      </main>
      <footer className="border-t border-slate-200 py-4 text-center text-xs text-slate-500">
        PinVault — projet personnel de fan, non affilié à The Walt Disney Company.
      </footer>
    </div>
  )
}
