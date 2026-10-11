import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { api } from '../api/client'
import { CARD_STATUS_LABELS, type PokemonCard } from '../api/types'
import { useAuth } from '../auth/AuthContext'
import { CardImage, CardItemForm, CardItemTags } from '../components/pokemon'
import { formatEuro } from '../components/format'
import { ErrorBox } from '../components/ui'

export function PokemonCardPage() {
  const id = useParams().id!
  const { isAuthenticated } = useAuth()
  const queryClient = useQueryClient()
  const [added, setAdded] = useState(false)
  const [formKey, setFormKey] = useState(0)

  const cardQuery = useQuery({ queryKey: ['pokemon-card', id], queryFn: () => api.getCard(id) })
  const mine = useQuery({ queryKey: ['pokemon', 'me'], queryFn: () => api.myCards(), enabled: isAuthenticated })

  const add = useMutation({
    mutationFn: api.addCard,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['pokemon'] })
      setAdded(true)
      setFormKey((k) => k + 1)
    },
  })

  if (cardQuery.isPending) return <p className="text-slate-500">Chargement…</p>
  if (cardQuery.error) return <ErrorBox message={cardQuery.error.message} />

  const card = cardQuery.data
  const copies = mine.data?.filter((i) => i.card.id === card.id) ?? []

  return (
    <div className="grid gap-8 md:grid-cols-[minmax(0,2fr)_minmax(0,3fr)]">
      <div className="mx-auto w-full max-w-sm">
        <CardImage base={card.imageUrl} alt={card.name} quality="high" className="shadow-xl" />
      </div>

      <div className="space-y-6">
        <div>
          <Link to="/pokemon" className="text-sm text-brand-600 hover:underline">
            ← Recherche
          </Link>
          <h1 className="mt-2 text-3xl font-bold">{card.name}</h1>
          <p className="text-slate-600">
            {card.setName ?? 'Série inconnue'} · n° {card.localId}
            {card.setCardCount ? `/${card.setCardCount}` : ''}
          </p>
        </div>

        <dl className="grid grid-cols-2 gap-3 text-sm sm:grid-cols-3">
          <Info label="Rareté" value={card.rarity} />
          <Info label="Catégorie" value={card.category} />
          <Info label="Illustrateur" value={card.illustrator} />
          <Info label="Variantes" value={variantsText(card)} />
        </dl>

        <Prices card={card} />

        {isAuthenticated ? (
          <div className="space-y-3 rounded-2xl bg-white p-5 shadow-sm">
            <h2 className="font-semibold">Ajouter à ma collection</h2>
            {added && !add.isPending && (
              <p className="rounded-md bg-green-50 px-3 py-2 text-sm text-green-700">
                Carte ajoutée !{' '}
                <Link to="/pokemon/collection" className="font-semibold underline">
                  Voir ma collection
                </Link>
              </p>
            )}
            <CardItemForm
              key={formKey}
              card={card}
              submitLabel="Ajouter"
              pending={add.isPending}
              error={add.error}
              onSubmit={(input) => add.mutate(input)}
            />
          </div>
        ) : (
          <p className="text-sm text-slate-600">
            <Link to="/login" className="text-brand-600 hover:underline">
              Connecte-toi
            </Link>{' '}
            pour l'ajouter à ta collection.
          </p>
        )}

        {copies.length > 0 && (
          <div className="space-y-2">
            <h2 className="font-semibold">Déjà dans ma collection</h2>
            <ul className="divide-y divide-slate-200 rounded-xl bg-white shadow-sm">
              {copies.map((c) => (
                <li key={c.id} className="flex flex-wrap items-center justify-between gap-2 px-4 py-2 text-sm">
                  <span className="font-medium">
                    {CARD_STATUS_LABELS[c.status]} × {c.quantity}
                  </span>
                  <CardItemTags item={c} />
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </div>
  )
}

function variantsText(card: PokemonCard) {
  const v = card.variants
  const list = [v.normal && 'Normale', v.reverse && 'Reverse', v.holo && 'Holo', v.firstEdition && '1re édition']
  return list.filter(Boolean).join(', ')
}

function Prices({ card }: { card: PokemonCard }) {
  const p = card.prices
  return (
    <div className="rounded-2xl bg-white p-5 shadow-sm">
      <div className="flex items-baseline justify-between">
        <h2 className="font-semibold">Cote Cardmarket</h2>
        {p?.updatedAt && (
          <span className="text-xs text-slate-400">mise à jour le {new Date(p.updatedAt).toLocaleDateString('fr-FR')}</span>
        )}
      </div>
      {p ? (
        <div className="mt-3 grid grid-cols-2 gap-4 text-center sm:grid-cols-4">
          <Price label="Tendance" value={p.trend} highlight />
          <Price label="Moyenne" value={p.avg} />
          <Price label="Plus bas" value={p.low} />
          <Price label="Tendance holo / reverse" value={p.trendHolo} />
        </div>
      ) : (
        <p className="mt-2 text-sm text-slate-500">Pas de cote disponible pour cette carte.</p>
      )}
      <p className="mt-3 text-xs text-slate-400">
        Prix indicatifs d'une carte non gradée, fournis par TCGdex d'après Cardmarket.
      </p>
    </div>
  )
}

function Price({ label, value, highlight }: { label: string; value: number | null; highlight?: boolean }) {
  return (
    <div>
      <div className={`text-xl font-bold ${highlight ? 'text-brand-600' : 'text-slate-800'}`}>{formatEuro(value)}</div>
      <div className="text-xs text-slate-500">{label}</div>
    </div>
  )
}

function Info({ label, value }: { label: string; value?: string | null }) {
  return (
    <div>
      <dt className="text-slate-500">{label}</dt>
      <dd className="font-medium">{value || '—'}</dd>
    </div>
  )
}
