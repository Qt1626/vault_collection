import { createContext, useCallback, useContext, useMemo, useState, type ReactNode } from 'react'
import { tokenStore } from '../api/client'
import type { AuthResponse } from '../api/types'

interface AuthState {
  username: string | null
  isAuthenticated: boolean
  signIn: (res: AuthResponse) => void
  signOut: () => void
}

const AuthContext = createContext<AuthState | null>(null)
const USER_KEY = 'pinvault.username'

export function AuthProvider({ children }: { children: ReactNode }) {
  const [username, setUsername] = useState<string | null>(() =>
    tokenStore.get() ? localStorage.getItem(USER_KEY) : null,
  )

  const signIn = useCallback((res: AuthResponse) => {
    tokenStore.set(res.token)
    localStorage.setItem(USER_KEY, res.username)
    setUsername(res.username)
  }, [])

  const signOut = useCallback(() => {
    tokenStore.clear()
    localStorage.removeItem(USER_KEY)
    setUsername(null)
  }, [])

  const value = useMemo(
    () => ({ username, isAuthenticated: username !== null, signIn, signOut }),
    [username, signIn, signOut],
  )
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth doit être utilisé dans <AuthProvider>')
  return ctx
}
