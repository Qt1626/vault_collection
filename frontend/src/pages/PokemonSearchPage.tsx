import { keepPreviousData, useQuery } from '@tanstack/react-query'
import { useSearchParams } from 'react-router-dom'
import { api } from '../api/client'
import { CardTile } from '../components/pokemon'
import { Button, ErrorBox, Input } from '../components/ui'

const EXAMPLES = ['Pikachu', 'Dracaufeu', 'Évoli', 'Mewtwo', 'Lucario']

export function PokemonSearchPage() {
  const [params, setParams] = useSearchParams()
  const q = params.get('q') ?? ''
  const page = Number(params.get('page') ?? 0)

  const { data, isFetching, error } = useQuery({
    queryKey: ['pokemon-search', q, page],
    queryFn: () => api.searchCards(q, page),
    enabled: q.trim().length >= 2,
    placeholderData: keepPreviousData,
    staleTime: 5 * 60_000,
  })

  const go = (nextQ: string, nextPage = 0) => {
    const next = new URLSearchParams()
    if (nextQ) next.set('q', nextQ)
    if (nextPage > 0) next.set('page', String(nextPage))
    setParams(next)
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Rechercher une carte</h1>
        <p className="text-sm text-slate-500">
          Toutes les cartes Pokémon (base TCGdex, en français). Clique sur une carte pour l'ajouter à ta collection.
        </p>
      </div>

      <form
        className="flex gap-2"
        onSubmit={(e) => {
          e.preventDefault()
          go(String(new FormData(e.currentTarget).get('q') ?? '').trim())
        }}
      >
        <Input name="q" key={q} defaultValue={q} placeholder="Nom du Pokémon ou de la carte…" autoFocus />
        <Button type="submit">Rechercher</Button>
      </form>

      {q.trim().length < 2 && (
        <div className="rounded-xl border border-dashed border-slate-300 p-8 text-center text-slate-500">
          <p>Tape au moins 2 lettres. Exemples :</p>
          <div className="mt-3 flex flex-wrap justify-center gap-2">
            {EXAMPLES.map((ex) => (
              <button
                key={ex}
                onClick={() => go(ex)}
                className="rounded-full border border-slate-300 bg-white px-3 py-1 text-sm hover:border-brand-500 hover:text-brand-600"
              >
                {ex}
              </button>
            ))}
          </div>
        </div>
      )}

      {error && <ErrorBox message={error.message} />}
      {isFetching && !data && <p className="text-slate-500">Recherche…</p>}

      {data && q.trim().length >= 2 && (
        <>
          {data.content.length === 0 ? (
            <p className="rounded-xl border border-dashed border-slate-300 p-8 text-center text-slate-500">
              Aucune carte trouvée pour « {q} ».
            </p>
          ) : (
            <div className={`grid grid-cols-2 gap-4 sm:grid-cols-4 lg:grid-cols-6 ${isFetching ? 'opacity-60' : ''}`}>
              {data.content.map((card) => (
                <CardTile key={card.id} card={card} />
              ))}
            </div>
          )}
          {(page > 0 || data.hasMore) && (
            <div className="flex items-center justify-center gap-3">
              <Button variant="secondary" disabled={page === 0} onClick={() => go(q, page - 1)}>
                ← Précédent
              </Button>
              <span className="text-sm text-slate-600">Page {page + 1}</span>
              <Button variant="secondary" disabled={!data.hasMore} onClick={() => go(q, page + 1)}>
                Suivant →
              </Button>
            </div>
          )}
        </>
      )}
    </div>
  )
}
