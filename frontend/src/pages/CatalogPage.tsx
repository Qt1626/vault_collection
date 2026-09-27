import { keepPreviousData, useQuery } from '@tanstack/react-query'
import { useSearchParams } from 'react-router-dom'
import { api } from '../api/client'
import { EDITIONS, EDITION_LABELS, PARKS, PARK_LABELS } from '../api/types'
import { PinCard } from '../components/PinCard'
import { Button, ErrorBox, Input, Select } from '../components/ui'

export function CatalogPage() {
  const [params, setParams] = useSearchParams()
  const filters = {
    q: params.get('q') ?? '',
    park: params.get('park') ?? '',
    edition: params.get('edition') ?? '',
    page: Number(params.get('page') ?? 0),
  }

  const { data, isPending, error } = useQuery({
    queryKey: ['pins', filters],
    queryFn: () => api.searchPins(filters),
    placeholderData: keepPreviousData,
  })

  const update = (key: string, value: string) => {
    const next = new URLSearchParams(params)
    if (value) next.set(key, value)
    else next.delete(key)
    if (key !== 'page') next.delete('page')
    setParams(next)
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Catalogue des pin's</h1>
        <p className="text-sm text-slate-500">
          La base de données commune : chaque membre peut ajouter des fiches et les relier à sa collection.
        </p>
      </div>

      <div className="grid gap-3 sm:grid-cols-3">
        <Input
          placeholder="Rechercher (nom, personnage, série)…"
          defaultValue={filters.q}
          onKeyDown={(e) => e.key === 'Enter' && update('q', e.currentTarget.value.trim())}
          onBlur={(e) => e.currentTarget.value.trim() !== filters.q && update('q', e.currentTarget.value.trim())}
        />
        <Select value={filters.park} onChange={(e) => update('park', e.target.value)}>
          <option value="">Tous les parcs</option>
          {PARKS.map((p) => (
            <option key={p} value={p}>
              {PARK_LABELS[p]}
            </option>
          ))}
        </Select>
        <Select value={filters.edition} onChange={(e) => update('edition', e.target.value)}>
          <option value="">Toutes les éditions</option>
          {EDITIONS.map((ed) => (
            <option key={ed} value={ed}>
              {EDITION_LABELS[ed]}
            </option>
          ))}
        </Select>
      </div>

      {error && <ErrorBox message={error.message} />}
      {isPending && <p className="text-slate-500">Chargement…</p>}

      {data && (
        <>
          <p className="text-sm text-slate-500">{data.totalElements} pin(s)</p>
          {data.content.length === 0 ? (
            <p className="rounded-xl border border-dashed border-slate-300 p-8 text-center text-slate-500">
              Aucun pin ne correspond à ta recherche.
            </p>
          ) : (
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
              {data.content.map((pin) => (
                <PinCard key={pin.id} pin={pin} />
              ))}
            </div>
          )}
          {data.totalPages > 1 && (
            <div className="flex items-center justify-center gap-3">
              <Button variant="secondary" disabled={data.page === 0} onClick={() => update('page', String(data.page - 1))}>
                ← Précédent
              </Button>
              <span className="text-sm text-slate-600">
                Page {data.page + 1} / {data.totalPages}
              </span>
              <Button
                variant="secondary"
                disabled={data.page + 1 >= data.totalPages}
                onClick={() => update('page', String(data.page + 1))}
              >
                Suivant →
              </Button>
            </div>
          )}
        </>
      )}
    </div>
  )
}
