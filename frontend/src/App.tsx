import type { ReactNode } from 'react'
import { Link, Navigate, Route, Routes, useParams } from 'react-router-dom'
import { RequireAuth } from './auth/RequireAuth'
import { Layout } from './components/Layout'
import { LoginPage, RegisterPage } from './pages/AuthPages'
import { CatalogPage } from './pages/CatalogPage'
import { CollectionPage } from './pages/CollectionPage'
import { HomePage } from './pages/HomePage'
import { NewPinPage } from './pages/NewPinPage'
import { PinDetailPage } from './pages/PinDetailPage'
import { PokemonCardPage } from './pages/PokemonCardPage'
import { PokemonCollectionPage } from './pages/PokemonCollectionPage'
import { PokemonSearchPage } from './pages/PokemonSearchPage'

const auth = (page: ReactNode) => <RequireAuth>{page}</RequireAuth>

/** Anciennes adresses /u/:username (avant la partie Pokémon) → collection de pin's. */
function LegacyUserRedirect() {
  return <Navigate to={`/u/${useParams().username}/pins`} replace />
}

export default function App() {
  return (
    <Routes>
      <Route element={<Layout />}>
        <Route index element={<HomePage />} />

        {/* Pin's Disney */}
        <Route path="pins" element={<CatalogPage />} />
        <Route path="pins/new" element={auth(<NewPinPage />)} />
        <Route path="pins/collection" element={auth(<CollectionPage />)} />
        <Route path="pins/:id" element={<PinDetailPage />} />
        <Route path="u/:username/pins" element={<CollectionPage />} />

        {/* Cartes Pokémon */}
        <Route path="pokemon" element={<PokemonSearchPage />} />
        <Route path="pokemon/collection" element={auth(<PokemonCollectionPage />)} />
        <Route path="pokemon/cartes/:id" element={<PokemonCardPage />} />
        <Route path="u/:username/pokemon" element={<PokemonCollectionPage />} />

        {/* Compte */}
        <Route path="login" element={<LoginPage />} />
        <Route path="register" element={<RegisterPage />} />

        {/* Anciennes adresses */}
        <Route path="collection" element={<Navigate to="/pins/collection" replace />} />
        <Route path="u/:username" element={<LegacyUserRedirect />} />

        <Route
          path="*"
          element={
            <p>
              Page introuvable.{' '}
              <Link to="/" className="text-brand-600 hover:underline">
                Retour à l'accueil
              </Link>
            </p>
          }
        />
      </Route>
    </Routes>
  )
}
