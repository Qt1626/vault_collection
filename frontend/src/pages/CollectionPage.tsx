import { useQuery } from '@tanstack/react-query'
import { useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { api } from '../api/client'
import { STATUSES, STATUS_LABELS, type CollectionStatus } from '../api/types'
import { useAuth } from '../auth/AuthContext'
import { PinCard } from '../components/PinCard'
import { ErrorBox } from '../components/ui'

/** Ma collection de pin's (/pins/collection) ou celle d'un autre membre (/u/:username/pins). */
export function CollectionPage() {
  const params = useParams()
  const { username: me } = useAuth()
  const username = params.username ?? me!
  const isMine = !params.username || params.username.toLowerCase() === me?.toLowerCase()
  const [tab, setTab] = useState<CollectionStatus>('OWNED')

  const { data, isPending, error } = useQuery({
    queryKey: ['collection', isMine ? 'me' : username],
    queryFn: () => (isMine ? api.myCollection() : api.userCollection(username)),
  })

  const items = data?.filter((i) => i.status === tab) ?? []
  const count = (s: CollectionStatus) => data?.filter((i) => i.status === s).reduce((n, i) => n + i.quantity, 0) ?? 0

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-2">
        <div>
          <h1 className="text-2xl font-bold">{isMine ? 'Mes pin\'s' : `Pin's de @${username}`}</h1>
          {isMine && (
            <p className="text-sm text-slate-500">
              Lien public :{' '}
              <Link to={`/u/${username}/pins`} className="text-brand-600 hover:underline">
                /u/{username}/pins
              </Link>
            </p>
          )}
        </div>
      </div>

      <div className="flex gap-2 border-b border-slate-200">
        {STATUSES.map((s) => (
          <button
            key={s}
            onClick={() => setTab(s)}
            className={`-mb-px border-b-2 px-4 py-2 text-sm font-medium ${
              tab === s ? 'border-brand-600 text-brand-700' : 'border-transparent text-slate-500 hover:text-slate-700'
            }`}
          >
            {STATUS_LABELS[s]} <span className="text-slate-400">({count(s)})</span>
          </button>
        ))}
      </div>

      {error && <ErrorBox message={error.message} />}
      {isPending && <p className="text-slate-500">Chargement…</p>}

      {data && items.length === 0 && (
        <p className="rounded-xl border border-dashed border-slate-300 p-8 text-center text-slate-500">
          Rien ici pour l'instant.{' '}
          {isMine && (
            <Link to="/pins" className="text-brand-600 hover:underline">
              Parcours le catalogue
            </Link>
          )}
        </p>
      )}

      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
        {items.map((item) => (
          <PinCard key={item.id} pin={item.pin} badge={item.quantity > 1 ? `×${item.quantity}` : undefined} />
        ))}
      </div>
    </div>
  )
}
