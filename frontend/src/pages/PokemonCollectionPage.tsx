import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useMemo, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { api } from '../api/client'
import { CARD_STATUS_LABELS, STATUSES, type CardItem, type CollectionStatus } from '../api/types'
import { useAuth } from '../auth/AuthContext'
import { CardImage, CardItemForm, CardItemTags } from '../components/pokemon'
import { formatEuro } from '../components/format'
import { Button, ErrorBox, Select } from '../components/ui'

type Sort = 'recent' | 'value' | 'name'

/** Ma collection de cartes (/pokemon/collection) ou celle d'un membre (/u/:username/pokemon). */
export function PokemonCollectionPage() {
  const params = useParams()
  const { username: me } = useAuth()
  const username = params.username ?? me!
  const isMine = !params.username || params.username.toLowerCase() === me?.toLowerCase()
  const [tab, setTab] = useState<CollectionStatus>('OWNED')
  const [sort, setSort] = useState<Sort>('recent')

  const { data, isPending, error } = useQuery({
    queryKey: ['pokemon', isMine ? 'me' : username],
    queryFn: () => (isMine ? api.myCards() : api.userCards(username)),
  })

  const items = useMemo(() => {
    const list = data?.filter((i) => i.status === tab) ?? []
    if (sort === 'value') return [...list].sort((a, b) => (b.totalPrice ?? 0) - (a.totalPrice ?? 0))
    if (sort === 'name') return [...list].sort((a, b) => a.card.name.localeCompare(b.card.name, 'fr'))
    return list
  }, [data, tab, sort])

  const count = (s: CollectionStatus) => data?.filter((i) => i.status === s).reduce((n, i) => n + i.quantity, 0) ?? 0
  const value = items.reduce((sum, i) => sum + (i.totalPrice ?? 0), 0)
  const graded = items.filter((i) => i.gradingCompany).reduce((n, i) => n + i.quantity, 0)

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">{isMine ? 'Mes cartes Pokémon' : `Cartes Pokémon de @${username}`}</h1>
        {isMine && (
          <p className="text-sm text-slate-500">
            Lien public :{' '}
            <Link to={`/u/${username}/pokemon`} className="text-brand-600 hover:underline">
              /u/{username}/pokemon
            </Link>
          </p>
        )}
      </div>

      <div className="flex flex-wrap items-end justify-between gap-3 border-b border-slate-200">
        <div className="flex gap-2">
          {STATUSES.map((s) => (
            <button
              key={s}
              onClick={() => setTab(s)}
              className={`-mb-px border-b-2 px-4 py-2 text-sm font-medium ${
                tab === s ? 'border-brand-600 text-brand-700' : 'border-transparent text-slate-500 hover:text-slate-700'
              }`}
            >
              {CARD_STATUS_LABELS[s]} <span className="text-slate-400">({count(s)})</span>
            </button>
          ))}
        </div>
        <div className="mb-2 w-44">
          <Select value={sort} onChange={(e) => setSort(e.target.value as Sort)} aria-label="Trier">
            <option value="recent">Plus récentes</option>
            <option value="value">Plus chères</option>
            <option value="name">Nom (A → Z)</option>
          </Select>
        </div>
      </div>

      {error && <ErrorBox message={error.message} />}
      {isPending && <p className="text-slate-500">Chargement…</p>}

      {data && items.length > 0 && (
        <div className="grid grid-cols-3 gap-4 rounded-2xl bg-white p-4 text-center shadow-sm">
          <Stat value={String(items.reduce((n, i) => n + i.quantity, 0))} label="cartes" />
          <Stat value={formatEuro(value)} label="valeur estimée" />
          <Stat value={String(graded)} label="gradées" />
        </div>
      )}

      {data && items.length === 0 && (
        <p className="rounded-xl border border-dashed border-slate-300 p-8 text-center text-slate-500">
          Rien ici pour l'instant.{' '}
          {isMine && (
            <Link to="/pokemon" className="text-brand-600 hover:underline">
              Recherche une carte
            </Link>
          )}
        </p>
      )}

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {items.map((item) => (
          <ItemCard key={item.id} item={item} editable={isMine} />
        ))}
      </div>

      {data && items.length > 0 && (
        <p className="text-xs text-slate-400">
          Valeur estimée d'après la cote Cardmarket d'une carte non gradée (cote holo pour les reverse et holo). Les
          cartes gradées valent souvent bien plus.
        </p>
      )}
    </div>
  )
}

function ItemCard({ item, editable }: { item: CardItem; editable: boolean }) {
  const queryClient = useQueryClient()
  const [editing, setEditing] = useState(false)

  const update = useMutation({
    mutationFn: (input: Parameters<typeof api.updateCard>[1]) => api.updateCard(item.id, input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['pokemon'] })
      setEditing(false)
    },
  })
  const remove = useMutation({
    mutationFn: () => api.removeCard(item.id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['pokemon'] }),
  })

  return (
    <div className="flex flex-col gap-3 rounded-xl border border-slate-200 bg-white p-3 shadow-sm">
      <div className="flex gap-3">
        <Link to={`/pokemon/cartes/${encodeURIComponent(item.card.id)}`} className="w-24 shrink-0">
          <CardImage base={item.card.imageUrl} alt={item.card.name} />
        </Link>
        <div className="min-w-0 flex-1 space-y-1.5">
          <Link
            to={`/pokemon/cartes/${encodeURIComponent(item.card.id)}`}
            className="block truncate font-semibold hover:text-brand-600"
          >
            {item.card.name}
          </Link>
          <p className="truncate text-xs text-slate-500">
            {item.card.setName} · n° {item.card.localId}
          </p>
          <CardItemTags item={item} />
          <p className="text-sm">
            <span className="font-semibold">× {item.quantity}</span>
            <span className="text-slate-400"> · </span>
            <span className="font-semibold text-brand-600">{formatEuro(item.totalPrice)}</span>
            {item.quantity > 1 && item.unitPrice != null && (
              <span className="text-xs text-slate-400"> ({formatEuro(item.unitPrice)} / u)</span>
            )}
          </p>
          {item.note && <p className="text-xs italic text-slate-500">{item.note}</p>}
        </div>
      </div>

      {editable && !editing && (
        <div className="flex gap-2">
          <Button variant="secondary" onClick={() => setEditing(true)}>
            Modifier
          </Button>
          <Button
            variant="secondary"
            disabled={remove.isPending}
            onClick={() => {
              if (window.confirm(`Retirer « ${item.card.name} » de ta collection ?`)) remove.mutate()
            }}
          >
            Retirer
          </Button>
        </div>
      )}
      {remove.error && <ErrorBox message={remove.error.message} />}

      {editing && (
        <div className="border-t border-slate-100 pt-3">
          <CardItemForm
            card={item.card}
            item={item}
            submitLabel="Enregistrer"
            pending={update.isPending}
            error={update.error}
            onSubmit={(input) => update.mutate(input)}
            onCancel={() => setEditing(false)}
          />
        </div>
      )}
    </div>
  )
}

function Stat({ value, label }: { value: string; label: string }) {
  return (
    <div>
      <div className="text-xl font-bold text-brand-600">{value}</div>
      <div className="text-xs text-slate-500">{label}</div>
    </div>
  )
}
