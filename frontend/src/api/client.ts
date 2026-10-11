import type {
  AuthResponse,
  CardItem,
  CardItemInput,
  CardSearchResult,
  CollectionItem,
  CollectionStatus,
  Page,
  Pin,
  PinDetail,
  PinInput,
  PokemonCard,
} from './types'

const TOKEN_KEY = 'pinvault.token'

export const tokenStore = {
  get: () => localStorage.getItem(TOKEN_KEY),
  set: (token: string) => localStorage.setItem(TOKEN_KEY, token),
  clear: () => localStorage.removeItem(TOKEN_KEY),
}

export class ApiError extends Error {
  status: number
  fieldErrors?: Record<string, string>

  constructor(status: number, message: string, fieldErrors?: Record<string, string>) {
    super(message)
    this.status = status
    this.fieldErrors = fieldErrors
  }
}

async function request<T>(path: string, init: RequestInit = {}): Promise<T> {
  const headers = new Headers(init.headers)
  // FormData (upload) : le navigateur fixe lui-même le Content-Type multipart avec la boundary
  if (init.body && !(init.body instanceof FormData)) headers.set('Content-Type', 'application/json')
  const token = tokenStore.get()
  if (token) headers.set('Authorization', `Bearer ${token}`)

  const res = await fetch(`/api${path}`, { ...init, headers })
  if (!res.ok) {
    let message = `Erreur ${res.status}`
    let fieldErrors: Record<string, string> | undefined
    try {
      const problem = await res.json()
      message = problem.detail ?? message
      fieldErrors = problem.errors
    } catch {
      /* réponse sans corps JSON */
    }
    if (res.status === 401) message = 'Tu dois être connecté.'
    throw new ApiError(res.status, message, fieldErrors)
  }
  return res.status === 204 ? (undefined as T) : res.json()
}

export interface PinFilters {
  q?: string
  park?: string
  edition?: string
  page?: number
}

export const api = {
  register: (username: string, email: string, password: string) =>
    request<AuthResponse>('/auth/register', {
      method: 'POST',
      body: JSON.stringify({ username, email, password }),
    }),
  login: (username: string, password: string) =>
    request<AuthResponse>('/auth/login', { method: 'POST', body: JSON.stringify({ username, password }) }),

  searchPins: (filters: PinFilters) => {
    const params = new URLSearchParams()
    Object.entries(filters).forEach(([k, v]) => {
      if (v !== undefined && v !== '') params.set(k, String(v))
    })
    return request<Page<Pin>>(`/pins?${params}`)
  },
  getPin: (id: number) => request<PinDetail>(`/pins/${id}`),
  createPin: (input: PinInput) => request<Pin>('/pins', { method: 'POST', body: JSON.stringify(input) }),
  uploadImage: (file: File) => {
    const body = new FormData()
    body.append('file', file)
    return request<{ url: string }>('/images', { method: 'POST', body })
  },

  myCollection: (status?: CollectionStatus) =>
    request<CollectionItem[]>(`/me/collection${status ? `?status=${status}` : ''}`),
  userCollection: (username: string) =>
    request<CollectionItem[]>(`/users/${encodeURIComponent(username)}/collection`),
  addToCollection: (pinId: number, status: CollectionStatus) =>
    request<CollectionItem>('/me/collection', { method: 'POST', body: JSON.stringify({ pinId, status }) }),
  removeFromCollection: (itemId: number) => request<void>(`/me/collection/${itemId}`, { method: 'DELETE' }),

  // Cartes Pokémon
  searchCards: (q: string, page = 0) =>
    request<CardSearchResult>(`/pokemon/cards?${new URLSearchParams({ q, page: String(page) })}`),
  getCard: (id: string) => request<PokemonCard>(`/pokemon/cards/${encodeURIComponent(id)}`),
  myCards: () => request<CardItem[]>('/me/pokemon'),
  userCards: (username: string) => request<CardItem[]>(`/users/${encodeURIComponent(username)}/pokemon`),
  addCard: (input: CardItemInput) => request<CardItem>('/me/pokemon', { method: 'POST', body: JSON.stringify(input) }),
  updateCard: (itemId: number, input: CardItemInput) =>
    request<CardItem>(`/me/pokemon/${itemId}`, { method: 'PUT', body: JSON.stringify(input) }),
  removeCard: (itemId: number) => request<void>(`/me/pokemon/${itemId}`, { method: 'DELETE' }),
}
