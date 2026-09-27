export const PARKS = [
  'DISNEYLAND_PARIS',
  'WALT_DISNEY_WORLD',
  'DISNEYLAND_RESORT',
  'TOKYO_DISNEY_RESORT',
  'HONG_KONG_DISNEYLAND',
  'SHANGHAI_DISNEY_RESORT',
  'DISNEY_STORE',
  'OTHER',
] as const
export type Park = (typeof PARKS)[number]

export const PARK_LABELS: Record<Park, string> = {
  DISNEYLAND_PARIS: 'Disneyland Paris',
  WALT_DISNEY_WORLD: 'Walt Disney World',
  DISNEYLAND_RESORT: 'Disneyland Resort (Californie)',
  TOKYO_DISNEY_RESORT: 'Tokyo Disney Resort',
  HONG_KONG_DISNEYLAND: 'Hong Kong Disneyland',
  SHANGHAI_DISNEY_RESORT: 'Shanghai Disney Resort',
  DISNEY_STORE: 'Disney Store',
  OTHER: 'Autre',
}

export const EDITIONS = [
  'OPEN_EDITION',
  'LIMITED_EDITION',
  'LIMITED_RELEASE',
  'HIDDEN_MICKEY',
  'EVENT',
  'OTHER',
] as const
export type Edition = (typeof EDITIONS)[number]

export const EDITION_LABELS: Record<Edition, string> = {
  OPEN_EDITION: 'Open Edition',
  LIMITED_EDITION: 'Édition limitée',
  LIMITED_RELEASE: 'Limited Release',
  HIDDEN_MICKEY: 'Hidden Mickey',
  EVENT: 'Événement',
  OTHER: 'Autre',
}

export const STATUSES = ['OWNED', 'WISHLIST', 'FOR_TRADE'] as const
export type CollectionStatus = (typeof STATUSES)[number]

export const STATUS_LABELS: Record<CollectionStatus, string> = {
  OWNED: 'Je l’ai',
  WISHLIST: 'Je le cherche',
  FOR_TRADE: 'À échanger',
}

export interface Pin {
  id: number
  name: string
  description: string | null
  characterName: string | null
  series: string | null
  park: Park
  edition: Edition
  editionSize: number | null
  releaseYear: number | null
  imageUrl: string | null
  createdBy: string | null
  createdAt: string
}

export interface PinDetail {
  pin: Pin
  owners: number
  wishlisted: number
  forTrade: number
}

export interface PinInput {
  name: string
  description?: string
  characterName?: string
  series?: string
  park: Park
  edition: Edition
  editionSize?: number
  releaseYear?: number
  imageUrl?: string
}

export interface Page<T> {
  content: T[]
  page: number
  size: number
  totalElements: number
  totalPages: number
}

export interface CollectionItem {
  id: number
  pin: Pin
  status: CollectionStatus
  quantity: number
  note: string | null
  addedAt: string
}

export interface AuthResponse {
  token: string
  username: string
  role: string
}
