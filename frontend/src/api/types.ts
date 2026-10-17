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
  /** Défaut de mon exemplaire */
  defect: string | null
  /** Avec (true) ou sans (false) le carton d'origine ; null = non précisé */
  backingCard: boolean | null
  addedAt: string
}

export interface CollectionItemUpdate {
  quantity: number
  note: string | null
  defect: string | null
  backingCard: boolean | null
}

export interface AuthResponse {
  token: string
  username: string
  role: string
}

// ---------- Cartes Pokémon ----------

export const CARD_STATUS_LABELS: Record<CollectionStatus, string> = {
  OWNED: 'Je l’ai',
  WISHLIST: 'Je la cherche',
  FOR_TRADE: 'À échanger',
}

export const CONDITIONS = ['MINT', 'NEAR_MINT', 'EXCELLENT', 'GOOD', 'LIGHT_PLAYED', 'PLAYED', 'POOR'] as const
export type CardCondition = (typeof CONDITIONS)[number]
export const CONDITION_LABELS: Record<CardCondition, string> = {
  MINT: 'Mint (MT)',
  NEAR_MINT: 'Near Mint (NM)',
  EXCELLENT: 'Excellent (EX)',
  GOOD: 'Good (GD)',
  LIGHT_PLAYED: 'Light Played (LP)',
  PLAYED: 'Played (PL)',
  POOR: 'Poor (PO)',
}

export const VARIANTS = ['NORMAL', 'REVERSE', 'HOLO', 'FIRST_EDITION'] as const
export type CardVariant = (typeof VARIANTS)[number]
export const VARIANT_LABELS: Record<CardVariant, string> = {
  NORMAL: 'Normale',
  REVERSE: 'Reverse',
  HOLO: 'Holo',
  FIRST_EDITION: '1re édition',
}

export const LANGUAGES = ['FR', 'EN', 'JP', 'DE', 'IT', 'ES', 'PT', 'KO', 'ZH'] as const
export type CardLanguage = (typeof LANGUAGES)[number]
export const LANGUAGE_LABELS: Record<CardLanguage, string> = {
  FR: 'Français',
  EN: 'Anglais',
  JP: 'Japonais',
  DE: 'Allemand',
  IT: 'Italien',
  ES: 'Espagnol',
  PT: 'Portugais',
  KO: 'Coréen',
  ZH: 'Chinois',
}

export const GRADING_COMPANIES = ['PSA', 'PCA', 'CCC', 'CGC', 'BGS', 'SGC', 'COLLECT_AURA', 'OTHER'] as const
export type GradingCompany = (typeof GRADING_COMPANIES)[number]
export const GRADING_LABELS: Record<GradingCompany, string> = {
  PSA: 'PSA',
  PCA: 'PCA',
  CCC: 'CCC',
  CGC: 'CGC',
  BGS: 'BGS (Beckett)',
  SGC: 'SGC',
  COLLECT_AURA: 'Collect Aura',
  OTHER: 'Autre',
}

/** imageUrl est une URL de base TCGdex : ajouter "/low.webp" ou "/high.webp". */
export interface CardBrief {
  id: string
  localId: string
  name: string
  imageUrl: string | null
}

export interface CardSearchResult {
  content: CardBrief[]
  page: number
  hasMore: boolean
}

export interface CardPrices {
  trend: number | null
  avg: number | null
  low: number | null
  trendHolo: number | null
  updatedAt: string | null
}

export interface PokemonCard extends CardBrief {
  category: string | null
  rarity: string | null
  illustrator: string | null
  setId: string | null
  setName: string | null
  setCardCount: number | null
  variants: { normal: boolean; reverse: boolean; holo: boolean; firstEdition: boolean }
  prices: CardPrices | null
}

export interface CardItemInput {
  cardId: string
  status: CollectionStatus
  quantity: number
  condition: CardCondition
  variant: CardVariant
  language: CardLanguage
  gradingCompany: GradingCompany | null
  grade: number | null
  note: string | null
  /** Prix de mon exemplaire ; null = estimation automatique */
  manualPrice: number | null
}

export interface CardItem extends Omit<CardItemInput, 'cardId'> {
  id: number
  card: PokemonCard
  /** Cote Cardmarket brute (toutes langues et tous états) */
  marketPrice: number | null
  /** Cote ajustée selon la langue et l'état */
  estimatedPrice: number | null
  /** Valeur retenue : prix manuel sinon estimation */
  unitPrice: number | null
  totalPrice: number | null
  priceSource: 'MANUAL' | 'ESTIMATE' | null
  addedAt: string
}

/** Coefficients appliqués à la cote Cardmarket (identiques à ceux du serveur, pour l'aperçu du formulaire). */
export const CONDITION_FACTORS: Record<CardCondition, number> = {
  MINT: 1,
  NEAR_MINT: 1,
  EXCELLENT: 0.85,
  GOOD: 0.7,
  LIGHT_PLAYED: 0.6,
  PLAYED: 0.45,
  POOR: 0.3,
}
export const LANGUAGE_FACTORS: Record<CardLanguage, number> = {
  EN: 1,
  FR: 0.8,
  JP: 0.7,
  DE: 0.6,
  IT: 0.5,
  ES: 0.5,
  KO: 0.5,
  PT: 0.4,
  ZH: 0.4,
}
