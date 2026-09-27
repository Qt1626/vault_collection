import { Link, Route, Routes } from 'react-router-dom'
import { RequireAuth } from './auth/RequireAuth'
import { Layout } from './components/Layout'
import { LoginPage, RegisterPage } from './pages/AuthPages'
import { CatalogPage } from './pages/CatalogPage'
import { CollectionPage } from './pages/CollectionPage'
import { NewPinPage } from './pages/NewPinPage'
import { PinDetailPage } from './pages/PinDetailPage'

export default function App() {
  return (
    <Routes>
      <Route element={<Layout />}>
        <Route index element={<CatalogPage />} />
        <Route path="pins/:id" element={<PinDetailPage />} />
        <Route path="u/:username" element={<CollectionPage />} />
        <Route path="login" element={<LoginPage />} />
        <Route path="register" element={<RegisterPage />} />
        <Route
          path="collection"
          element={
            <RequireAuth>
              <CollectionPage />
            </RequireAuth>
          }
        />
        <Route
          path="pins/new"
          element={
            <RequireAuth>
              <NewPinPage />
            </RequireAuth>
          }
        />
        <Route
          path="*"
          element={
            <p>
              Page introuvable.{' '}
              <Link to="/" className="text-brand-600 hover:underline">
                Retour au catalogue
              </Link>
            </p>
          }
        />
      </Route>
    </Routes>
  )
}
