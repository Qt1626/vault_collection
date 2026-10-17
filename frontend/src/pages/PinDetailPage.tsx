import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { Link, useParams } from 'react-router-dom'
import { api } from '../api/client'
import { EDITION_LABELS, PARK_LABELS, STATUSES, STATUS_LABELS, type CollectionStatus } from '../api/types'
import { useAuth } from '../auth/AuthContext'
import { PinCopyEditor } from '../components/PinCopyEditor'
import { PinImage } from '../components/PinImage'
import { ebaySoldUrl, pinEbayQuery } from '../components/pricing'
import { Button, ErrorBox } from '../components/ui'

export function PinDetailPage() {
  const id = Number(useParams().id)
  const { isAuthenticated } = useAuth()
  const queryClient = useQueryClient()

  const pinQuery = useQuery({ queryKey: ['pin', id], queryFn: () => api.getPin(id) })
  const myItems = useQuery({
    queryKey: ['collection', 'me'],
    queryFn: () => api.myCollection(),
    enabled: isAuthenticated,
  })

  const toggle = useMutation({
    mutationFn: async (status: CollectionStatus) => {
      const existing = myItems.data?.find((i) => i.pin.id === id && i.status === status)
      if (existing) await api.removeFromCollection(existing.id)
      else await api.addToCollection(id, status)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['collection'] })
      queryClient.invalidateQueries({ queryKey: ['pin', id] })
    },
  })

  if (pinQuery.isPending) return <p className="text-slate-500">Chargement…</p>
  if (pinQuery.error) return <ErrorBox message={pinQuery.error.message} />

  const { pin, owners, wishlisted, forTrade } = pinQuery.data
  const inList = (s: CollectionStatus) => myItems.data?.some((i) => i.pin.id === id && i.status === s) ?? false
  const myCopies = myItems.data?.filter((i) => i.pin.id === id) ?? []

  return (
    <div className="grid gap-8 md:grid-cols-2">
      <PinImage src={pin.imageUrl} alt={pin.name} className="aspect-square w-full rounded-2xl border border-slate-200" />

      <div className="space-y-5">
        <div>
          <Link to="/pins" className="text-sm text-brand-600 hover:underline">
            ← Catalogue
          </Link>
          <h1 className="mt-2 text-3xl font-bold">{pin.name}</h1>
          {pin.characterName && <p className="text-slate-600">{pin.characterName}</p>}
        </div>

        <dl className="grid grid-cols-2 gap-3 text-sm">
          <Info label="Parc / origine" value={PARK_LABELS[pin.park]} />
          <Info label="Édition" value={EDITION_LABELS[pin.edition] + (pin.editionSize ? ` (LE ${pin.editionSize})` : '')} />
          <Info label="Année" value={pin.releaseYear?.toString()} />
          <Info label="Série" value={pin.series} />
        </dl>

        {pin.description && <p className="whitespace-pre-line text-slate-700">{pin.description}</p>}

        <a
          href={ebaySoldUrl(pinEbayQuery(pin))}
          target="_blank"
          rel="noreferrer"
          className="inline-block text-sm font-semibold text-brand-600 hover:underline"
        >
          Voir les ventes réussies sur eBay ↗
        </a>

        <div className="flex gap-6 rounded-xl bg-white p-4 text-center shadow-sm">
          <Stat value={owners} label="le possèdent" />
          <Stat value={wishlisted} label="le cherchent" />
          <Stat value={forTrade} label="l'échangent" />
        </div>

        {isAuthenticated ? (
          <div className="space-y-2">
            <p className="text-sm font-medium text-slate-700">Dans ma collection :</p>
            <div className="flex flex-wrap gap-2">
              {STATUSES.map((s) => (
                <Button
                  key={s}
                  variant={inList(s) ? 'primary' : 'secondary'}
                  disabled={toggle.isPending || myItems.isPending}
                  onClick={() => toggle.mutate(s)}
                >
                  {inList(s) ? '✓ ' : '+ '}
                  {STATUS_LABELS[s]}
                </Button>
              ))}
            </div>
            {toggle.error && <ErrorBox message={toggle.error.message} />}
            {myCopies.length > 0 && (
              <div className="space-y-3 pt-2">
                <p className="text-sm font-medium text-slate-700">Mon exemplaire :</p>
                {myCopies.map((item) => (
                  <PinCopyEditor key={item.id} item={item} />
                ))}
              </div>
            )}
          </div>
        ) : (
          <p className="text-sm text-slate-600">
            <Link to="/login" className="text-brand-600 hover:underline">
              Connecte-toi
            </Link>{' '}
            pour l'ajouter à ta collection.
          </p>
        )}

        {pin.createdBy && <p className="text-xs text-slate-400">Fiche ajoutée par @{pin.createdBy}</p>}
      </div>
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

function Stat({ value, label }: { value: number; label: string }) {
  return (
    <div className="flex-1">
      <div className="text-2xl font-bold text-brand-600">{value}</div>
      <div className="text-xs text-slate-500">{label}</div>
    </div>
  )
}
