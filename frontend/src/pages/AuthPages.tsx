import { useMutation } from '@tanstack/react-query'
import { useState, type ChangeEvent, type FormEvent, type ReactNode } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { ApiError, api } from '../api/client'
import type { AuthResponse } from '../api/types'
import { useAuth } from '../auth/AuthContext'
import { Button, ErrorBox, Field, Input } from '../components/ui'

function useAuthSuccess() {
  const { signIn } = useAuth()
  const navigate = useNavigate()
  const from = (useLocation().state as { from?: string } | null)?.from ?? '/collection'
  return (res: AuthResponse) => {
    signIn(res)
    navigate(from, { replace: true })
  }
}

export function LoginPage() {
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const onSuccess = useAuthSuccess()
  const login = useMutation({ mutationFn: () => api.login(username, password), onSuccess })

  const submit = (e: FormEvent) => {
    e.preventDefault()
    login.mutate()
  }

  return (
    <AuthCard title="Connexion">
      <form onSubmit={submit} className="space-y-4">
        <Field label="Nom d'utilisateur">
          <Input value={username} onChange={(e) => setUsername(e.target.value)} autoComplete="username" required />
        </Field>
        <Field label="Mot de passe">
          <Input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            autoComplete="current-password"
            required
          />
        </Field>
        {login.error && (
          <ErrorBox message={login.error instanceof ApiError && login.error.status === 401 ? 'Identifiants invalides' : login.error.message} />
        )}
        <Button type="submit" disabled={login.isPending}>
          Se connecter
        </Button>
      </form>
      <p className="text-sm text-slate-600">
        Pas encore de compte ?{' '}
        <Link to="/register" className="text-brand-600 hover:underline">
          Inscris-toi
        </Link>
      </p>
    </AuthCard>
  )
}

export function RegisterPage() {
  const [form, setForm] = useState({ username: '', email: '', password: '' })
  const onSuccess = useAuthSuccess()
  const register = useMutation({
    mutationFn: () => api.register(form.username, form.email, form.password),
    onSuccess,
  })
  const fieldErrors = register.error instanceof ApiError ? register.error.fieldErrors : undefined
  const set = (key: keyof typeof form) => (e: ChangeEvent<HTMLInputElement>) =>
    setForm({ ...form, [key]: e.target.value })

  return (
    <AuthCard title="Créer un compte">
      <form
        onSubmit={(e) => {
          e.preventDefault()
          register.mutate()
        }}
        className="space-y-4"
      >
        <Field label="Nom d'utilisateur" error={fieldErrors?.username}>
          <Input value={form.username} onChange={set('username')} autoComplete="username" required minLength={3} />
        </Field>
        <Field label="Email" error={fieldErrors?.email}>
          <Input type="email" value={form.email} onChange={set('email')} autoComplete="email" required />
        </Field>
        <Field label="Mot de passe (8 caractères min.)" error={fieldErrors?.password}>
          <Input
            type="password"
            value={form.password}
            onChange={set('password')}
            autoComplete="new-password"
            required
            minLength={8}
          />
        </Field>
        {register.error && !fieldErrors && <ErrorBox message={register.error.message} />}
        <Button type="submit" disabled={register.isPending}>
          Créer mon compte
        </Button>
      </form>
    </AuthCard>
  )
}

function AuthCard({ title, children }: { title: string; children: ReactNode }) {
  return (
    <div className="mx-auto max-w-sm space-y-6 rounded-2xl bg-white p-6 shadow-sm">
      <h1 className="text-2xl font-bold">{title}</h1>
      {children}
    </div>
  )
}
