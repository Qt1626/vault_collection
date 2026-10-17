import {
  CONDITION_FACTORS,
  GRADING_LABELS,
  LANGUAGE_FACTORS,
  type CardCondition,
  type CardLanguage,
  type CardVariant,
  type GradingCompany,
  type Pin,
  type PokemonCard,
} from '../api/types'

/** Identifiants des filtres de Cardmarket (paramètres « language » et « minCondition » de ses pages). */
const CARDMARKET_LANGUAGE: Record<CardLanguage, number> = { EN: 1, FR: 2, DE: 3, ES: 4, IT: 5, ZH: 6, JP: 7, PT: 8, KO: 10 }
const CARDMARKET_CONDITION: Record<CardCondition, number> = {
  MINT: 1,
  NEAR_MINT: 2,
  EXCELLENT: 3,
  GOOD: 4,
  LIGHT_PLAYED: 5,
  PLAYED: 6,
  POOR: 7,
}

export function cardmarketUrl(card: PokemonCard, language: CardLanguage, condition: CardCondition) {
  const params = new URLSearchParams({
    searchString: card.name,
    language: String(CARDMARKET_LANGUAGE[language]),
    minCondition: String(CARDMARKET_CONDITION[condition]),
  })
  return `https://www.cardmarket.com/fr/Pokemon/Products/Search?${params}`
}

/** Même calcul que le serveur : cote de la variante × coefficient de langue × coefficient d'état. */
export function estimatePrice(card: PokemonCard, variant: CardVariant, language: CardLanguage, condition: CardCondition) {
  const p = card.prices
  if (!p) return null
  const foil = variant === 'REVERSE' || variant === 'HOLO'
  const market = (foil ? p.trendHolo : null) ?? p.trend ?? p.avg
  if (market == null) return null
  return Math.round(market * LANGUAGE_FACTORS[language] * CONDITION_FACTORS[condition] * 100) / 100
}

/** Recherche eBay limitée aux objets VENDUS (ventes réussies), sur eBay France. */
export function ebaySoldUrl(query: string) {
  const params = new URLSearchParams({ _nkw: query, LH_Sold: '1', LH_Complete: '1' })
  return `https://www.ebay.fr/sch/i.html?${params}`
}

/** Ex. « Dracaufeu 4/102 PSA 9 » : nom + numéro (+ gradation), ce que les vendeurs mettent dans leurs titres. */
export function cardEbayQuery(card: PokemonCard, gradingCompany: GradingCompany | null, grade: number | null) {
  const number = card.setCardCount ? `${card.localId}/${card.setCardCount}` : card.localId
  const grading =
    gradingCompany && gradingCompany !== 'OTHER' && grade != null
      ? ` ${GRADING_LABELS[gradingCompany].split(' ')[0]} ${grade}`
      : ''
  return `${card.name} ${number}${grading}`
}

/** Ex. « pin Mickey classique LE 500 ». */
export function pinEbayQuery(pin: Pin) {
  const le = pin.editionSize ? ` LE ${pin.editionSize}` : ''
  return `pin ${pin.name}${le}`
}
