import { useQuery } from '@tanstack/react-query'
import type { ReactNode } from 'react'
import { Link } from 'react-router-dom'
import { api } from '../api/client'
import { useAuth } from '../auth/AuthContext'
import { formatEuro } from '../components/format'

/** Page d'accueil : choix entre la collection de pin's et la collection de cartes Pokémon. */
export function HomePage() {
  const { isAuthenticated, username } = useAuth()

  const pins = useQuery({ queryKey: ['collection', 'me'], queryFn: () => api.myCollection(), enabled: isAuthenticated })
  const cards = useQuery({ queryKey: ['pokemon', 'me'], queryFn: () => api.myCards(), enabled: isAuthenticated })

  const ownedPins = pins.data?.filter((i) => i.status === 'OWNED').reduce((n, i) => n + i.quantity, 0)
  const ownedCards = cards.data?.filter((i) => i.status === 'OWNED')
  const cardCount = ownedCards?.reduce((n, i) => n + i.quantity, 0)
  const cardValue = ownedCards?.reduce((sum, i) => sum + (i.totalPrice ?? 0), 0)

  return (
    <div className="space-y-10">
      <div className="text-center">
        <h1 className="text-3xl font-bold sm:text-4xl">{username ? `Bonjour ${username} !` : 'Tes collections, au même endroit'}</h1>
        <p className="mt-2 text-slate-600">Choisis la collection que tu veux consulter.</p>
      </div>

      <div className="mx-auto grid max-w-4xl gap-6 md:grid-cols-2">
        <SectionTile
          to="/pins"
          title="Pin's Disney"
          description="Catalogue communautaire des pin's et ta collection : possédés, recherchés, à échanger."
          gradient="from-[#2b56c4] to-[#22449c]"
          icon={<PinIcon />}
          stat={isAuthenticated && ownedPins !== undefined ? `${ownedPins} pin's possédé${ownedPins > 1 ? 's' : ''}` : undefined}
        />
        <SectionTile
          to="/pokemon"
          title="Cartes Pokémon"
          description="Recherche parmi toutes les cartes, suis l'état, la gradation et la cote Cardmarket de ta collection."
          gradient="from-[#e3350d] to-[#9f230a]"
          icon={<CardIcon />}
          stat={
            isAuthenticated && cardCount !== undefined
              ? `${cardCount} carte${cardCount > 1 ? 's' : ''} · ${formatEuro(cardValue)}`
              : undefined
          }
        />
      </div>

      {!isAuthenticated && (
        <p className="text-center text-sm text-slate-600">
          <Link to="/register" className="font-semibold text-brand-600 hover:underline">
            Crée un compte
          </Link>{' '}
          pour enregistrer tes collections.
        </p>
      )}
    </div>
  )
}

function SectionTile({
  to,
  title,
  description,
  gradient,
  icon,
  stat,
}: {
  to: string
  title: string
  description: string
  gradient: string
  icon: ReactNode
  stat?: string
}) {
  return (
    <Link
      to={to}
      className={`group flex flex-col gap-4 rounded-2xl bg-gradient-to-br ${gradient} p-6 text-white shadow-lg transition hover:-translate-y-1 hover:shadow-xl`}
    >
      <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-white/15">{icon}</div>
      <div>
        <h2 className="text-2xl font-bold">{title}</h2>
        <p className="mt-1 text-sm text-white/85">{description}</p>
      </div>
      <div className="mt-auto flex items-center justify-between">
        <span className="text-sm font-medium text-white/90">{stat ?? ''}</span>
        <span className="text-sm font-semibold transition group-hover:translate-x-1">Entrer →</span>
      </div>
    </Link>
  )
}

function PinIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-8 w-8" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden>
      <circle cx="12" cy="10" r="6" />
      <path d="M12 7.2l.9 1.9 2 .3-1.5 1.4.4 2-1.8-1-1.8 1 .4-2-1.5-1.4 2-.3z" fill="currentColor" stroke="none" />
      <path d="M12 16v5" strokeLinecap="round" />
    </svg>
  )
}

function CardIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-8 w-8" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden>
      <rect x="4" y="5" width="11" height="15" rx="1.5" transform="rotate(-8 9.5 12.5)" />
      <rect x="9" y="3" width="11" height="15" rx="1.5" fill="currentColor" fillOpacity="0.2" />
      <path d="M12 7h5M12 15h5" strokeLinecap="round" />
    </svg>
  )
}
