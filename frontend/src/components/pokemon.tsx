import { useState, type FormEvent } from 'react'
import { Link } from 'react-router-dom'
import {
  CARD_STATUS_LABELS,
  CONDITIONS,
  CONDITION_LABELS,
  GRADING_COMPANIES,
  GRADING_LABELS,
  LANGUAGES,
  LANGUAGE_LABELS,
  STATUSES,
  VARIANTS,
  VARIANT_LABELS,
  type CardBrief,
  type CardItem,
  type CardItemInput,
  type CardVariant,
  type PokemonCard,
} from '../api/types'
import { Button, ErrorBox, Field, Input, Select } from './ui'

/** Image TCGdex : l'API fournit une URL de base à compléter par la qualité voulue. */
export function CardImage({
  base,
  alt,
  quality = 'low',
  className = '',
}: {
  base: string | null
  alt: string
  quality?: 'low' | 'high'
  className?: string
}) {
  const [failed, setFailed] = useState(false)
  if (!base || failed) {
    return (
      <div
        className={`flex aspect-[245/337] items-center justify-center rounded-lg bg-slate-200 p-2 text-center text-xs text-slate-500 ${className}`}
        aria-label={alt}
      >
        Image indisponible
      </div>
    )
  }
  return (
    <img
      src={`${base}/${quality}.webp`}
      alt={alt}
      loading="lazy"
      onError={() => setFailed(true)}
      className={`aspect-[245/337] w-full rounded-lg object-contain ${className}`}
    />
  )
}

export function CardTile({ card, badge, footer }: { card: CardBrief; badge?: string; footer?: string }) {
  return (
    <Link
      to={`/pokemon/cartes/${encodeURIComponent(card.id)}`}
      className="group block rounded-xl border border-slate-200 bg-white p-2 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"
    >
      <CardImage base={card.imageUrl} alt={card.name} />
      <div className="mt-2 flex items-start justify-between gap-2 px-1">
        <div className="min-w-0">
          <h3 className="truncate text-sm font-semibold group-hover:text-brand-600">{card.name}</h3>
          <p className="text-xs text-slate-500">n° {card.localId}</p>
        </div>
        {badge && <span className="shrink-0 rounded bg-brand-100 px-1.5 py-0.5 text-xs text-brand-700">{badge}</span>}
      </div>
      {footer && <p className="px-1 pt-1 text-xs font-medium text-slate-700">{footer}</p>}
    </Link>
  )
}

/** Variantes proposées : celles connues de TCGdex pour cette carte, ou toutes si l'info manque. */
function availableVariants(card: PokemonCard): CardVariant[] {
  const v = card.variants
  const list = VARIANTS.filter(
    (x) =>
      (x === 'NORMAL' && v.normal) ||
      (x === 'REVERSE' && v.reverse) ||
      (x === 'HOLO' && v.holo) ||
      (x === 'FIRST_EDITION' && v.firstEdition),
  )
  return list.length > 0 ? list : [...VARIANTS]
}

type FormState = Omit<CardItemInput, 'cardId' | 'quantity' | 'grade'> & { quantity: string; grade: string; graded: boolean }

function initialState(card: PokemonCard, item?: CardItem): FormState {
  return {
    status: item?.status ?? 'OWNED',
    quantity: String(item?.quantity ?? 1),
    condition: item?.condition ?? 'NEAR_MINT',
    variant: item?.variant ?? availableVariants(card)[0],
    language: item?.language ?? 'FR',
    graded: item?.gradingCompany != null,
    gradingCompany: item?.gradingCompany ?? 'PSA',
    grade: item?.grade != null ? String(item.grade) : '10',
    note: item?.note ?? '',
  }
}

/** Formulaire d'ajout (sans item) ou de modification (avec item) d'une carte de la collection. */
export function CardItemForm({
  card,
  item,
  submitLabel,
  pending,
  error,
  onSubmit,
  onCancel,
}: {
  card: PokemonCard
  item?: CardItem
  submitLabel: string
  pending: boolean
  error?: Error | null
  onSubmit: (input: CardItemInput) => void
  onCancel?: () => void
}) {
  const [form, setForm] = useState<FormState>(() => initialState(card, item))
  const set = <K extends keyof FormState>(key: K, value: FormState[K]) => setForm((f) => ({ ...f, [key]: value }))

  const submit = (e: FormEvent) => {
    e.preventDefault()
    onSubmit({
      cardId: card.id,
      status: form.status,
      quantity: Math.max(1, Number(form.quantity) || 1),
      condition: form.condition,
      variant: form.variant,
      language: form.language,
      gradingCompany: form.graded ? form.gradingCompany : null,
      grade: form.graded ? Number(form.grade.replace(',', '.')) : null,
      note: form.note?.trim() || null,
    })
  }

  return (
    <form onSubmit={submit} className="grid gap-3 sm:grid-cols-2">
      <Field label="Liste">
        <Select value={form.status} onChange={(e) => set('status', e.target.value as FormState['status'])}>
          {STATUSES.map((s) => (
            <option key={s} value={s}>
              {CARD_STATUS_LABELS[s]}
            </option>
          ))}
        </Select>
      </Field>
      <Field label="Quantité">
        <Input type="number" min={1} max={999} value={form.quantity} onChange={(e) => set('quantity', e.target.value)} />
      </Field>
      <Field label="Variante">
        <Select value={form.variant} onChange={(e) => set('variant', e.target.value as CardVariant)}>
          {availableVariants(card).map((v) => (
            <option key={v} value={v}>
              {VARIANT_LABELS[v]}
            </option>
          ))}
        </Select>
      </Field>
      <Field label="Langue">
        <Select value={form.language} onChange={(e) => set('language', e.target.value as FormState['language'])}>
          {LANGUAGES.map((l) => (
            <option key={l} value={l}>
              {LANGUAGE_LABELS[l]}
            </option>
          ))}
        </Select>
      </Field>
      <Field label="État">
        <Select value={form.condition} onChange={(e) => set('condition', e.target.value as FormState['condition'])}>
          {CONDITIONS.map((c) => (
            <option key={c} value={c}>
              {CONDITION_LABELS[c]}
            </option>
          ))}
        </Select>
      </Field>

      <label className="flex items-center gap-2 self-end pb-2 text-sm font-medium text-slate-700">
        <input
          type="checkbox"
          checked={form.graded}
          onChange={(e) => set('graded', e.target.checked)}
          className="h-4 w-4 accent-brand-600"
        />
        Carte gradée
      </label>

      {form.graded && (
        <>
          <Field label="Société de gradation">
            <Select
              value={form.gradingCompany ?? 'PSA'}
              onChange={(e) => set('gradingCompany', e.target.value as FormState['gradingCompany'])}
            >
              {GRADING_COMPANIES.map((g) => (
                <option key={g} value={g}>
                  {GRADING_LABELS[g]}
                </option>
              ))}
            </Select>
          </Field>
          <Field label="Note (1 à 10)">
            <Input
              type="number"
              min={1}
              max={10}
              step={0.5}
              required
              value={form.grade}
              onChange={(e) => set('grade', e.target.value)}
            />
          </Field>
        </>
      )}

      <div className="sm:col-span-2">
        <Field label="Note personnelle">
          <Input
            value={form.note ?? ''}
            maxLength={500}
            placeholder="Ex. : classeur 2, page 4"
            onChange={(e) => set('note', e.target.value)}
          />
        </Field>
      </div>

      {error && (
        <div className="sm:col-span-2">
          <ErrorBox message={error.message} />
        </div>
      )}
      <div className="flex gap-2 sm:col-span-2">
        <Button type="submit" disabled={pending}>
          {submitLabel}
        </Button>
        {onCancel && (
          <Button type="button" variant="secondary" onClick={onCancel}>
            Annuler
          </Button>
        )}
      </div>
    </form>
  )
}

/** Petites étiquettes résumant un exemplaire : variante, langue, état, gradation. */
export function CardItemTags({ item }: { item: CardItem }) {
  const tags = [
    VARIANT_LABELS[item.variant],
    item.language,
    CONDITION_LABELS[item.condition].replace(/.*\((.*)\)/, '$1'),
  ]
  return (
    <div className="flex flex-wrap gap-1">
      {tags.map((t) => (
        <span key={t} className="rounded bg-slate-100 px-1.5 py-0.5 text-xs text-slate-600">
          {t}
        </span>
      ))}
      {item.gradingCompany && (
        <span className="rounded bg-amber-100 px-1.5 py-0.5 text-xs font-semibold text-amber-800">
          {GRADING_LABELS[item.gradingCompany].split(' ')[0]} {item.grade}
        </span>
      )}
    </div>
  )
}
