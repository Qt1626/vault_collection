import { Link, NavLink, Outlet, useLocation, useNavigate } from 'react-router-dom'
import { useAuth } from '../auth/AuthContext'

const navClass = ({ isActive }: { isActive: boolean }) =>
  `rounded-md px-3 py-2 text-sm font-medium ${isActive ? 'bg-white/15 text-white' : 'text-brand-100 hover:text-white'}`

type Section = 'home' | 'pins' | 'pokemon'

function sectionOf(pathname: string): Section {
  if (pathname.startsWith('/pokemon') || /^\/u\/[^/]+\/pokemon/.test(pathname)) return 'pokemon'
  if (pathname.startsWith('/pins') || /^\/u\/[^/]+\/pins/.test(pathname)) return 'pins'
  return 'home'
}

export function Layout() {
  const { username, isAuthenticated, signOut } = useAuth()
  const navigate = useNavigate()
  const section = sectionOf(useLocation().pathname)

  return (
    <div className={`flex min-h-screen flex-col theme-${section}`}>
      <header className="bg-brand-700 shadow">
        <nav className="mx-auto flex max-w-6xl flex-wrap items-center gap-2 px-4 py-3">
          <Link to="/" className="mr-2 flex items-center gap-2 text-lg font-bold text-white">
            <span className="text-gold-400">★</span> PinVault
          </Link>

          {section !== 'home' && (
            <span className="mr-2 rounded-full bg-white/15 px-2.5 py-0.5 text-xs font-semibold uppercase tracking-wide text-white">
              {section === 'pins' ? "Pin's" : 'Pokémon'}
            </span>
          )}

          {section === 'pins' && (
            <>
              <NavLink to="/pins" end className={navClass}>
                Catalogue
              </NavLink>
              {isAuthenticated && (
                <>
                  <NavLink to="/pins/collection" className={navClass}>
                    Ma collection
                  </NavLink>
                  <NavLink to="/pins/new" className={navClass}>
                    Ajouter un pin
                  </NavLink>
                </>
              )}
            </>
          )}

          {section === 'pokemon' && (
            <>
              <NavLink to="/pokemon" end className={navClass}>
                Rechercher
              </NavLink>
              {isAuthenticated && (
                <NavLink to="/pokemon/collection" className={navClass}>
                  Mes cartes
                </NavLink>
              )}
            </>
          )}

          {section !== 'home' && (
            <NavLink to={section === 'pins' ? '/pokemon' : '/pins'} className={navClass}>
              {section === 'pins' ? '→ Cartes Pokémon' : "→ Pin's Disney"}
            </NavLink>
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
        PinVault — projet personnel de fan, non affilié à The Walt Disney Company, Nintendo, Creatures, GAME FREAK ou The
        Pokémon Company. Données et images des cartes : TCGdex.
      </footer>
    </div>
  )
}
