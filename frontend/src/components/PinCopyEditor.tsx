import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useState, type FormEvent } from 'react'
import { api } from '../api/client'
import { STATUS_LABELS, type CollectionItem } from '../api/types'
import { Button, ErrorBox, Field, Input, Select } from './ui'

type Carton = 'unknown' | 'with' | 'without'

const toCarton = (v: boolean | null): Carton => (v == null ? 'unknown' : v ? 'with' : 'without')
const fromCarton = (c: Carton): boolean | null => (c === 'unknown' ? null : c === 'with')

/** Détails de MON exemplaire d'un pin : quantité, carton, défaut, note. */
export function PinCopyEditor({ item }: { item: CollectionItem }) {
  const queryClient = useQueryClient()
  const [form, setForm] = useState({
    quantity: String(item.quantity),
    carton: toCarton(item.backingCard),
    defect: item.defect ?? '',
    note: item.note ?? '',
  })
  const [saved, setSaved] = useState(false)

  const save = useMutation({
    mutationFn: () =>
      api.updateCollectionItem(item.id, {
        quantity: Math.max(1, Number(form.quantity) || 1),
        backingCard: fromCarton(form.carton),
        defect: form.defect.trim() || null,
        note: form.note.trim() || null,
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['collection'] })
      setSaved(true)
    },
  })

  const set = (key: keyof typeof form) => (e: { target: { value: string } }) => {
    setSaved(false)
    setForm((f) => ({ ...f, [key]: e.target.value }))
  }
  const submit = (e: FormEvent) => {
    e.preventDefault()
    save.mutate()
  }

  return (
    <form onSubmit={submit} className="space-y-3 rounded-xl border border-slate-200 bg-white p-4">
      <p className="text-sm font-semibold text-slate-700">{STATUS_LABELS[item.status]}</p>
      <div className="grid gap-3 sm:grid-cols-2">
        <Field label="Quantité">
          <Input type="number" min={1} max={999} value={form.quantity} onChange={set('quantity')} />
        </Field>
        <Field label="Carton d'origine">
          <Select value={form.carton} onChange={set('carton')}>
            <option value="unknown">Non précisé</option>
            <option value="with">Avec carton</option>
            <option value="without">Sans carton</option>
          </Select>
        </Field>
        <div className="sm:col-span-2">
          <Field label="Défaut">
            <Input
              value={form.defect}
              maxLength={500}
              placeholder="Ex. : petite rayure, attache manquante… (vide si aucun)"
              onChange={set('defect')}
            />
          </Field>
        </div>
        <div className="sm:col-span-2">
          <Field label="Note personnelle">
            <Input value={form.note} maxLength={500} placeholder="Ex. : acheté à Disneyland Paris" onChange={set('note')} />
          </Field>
        </div>
      </div>
      {save.error && <ErrorBox message={save.error.message} />}
      <div className="flex items-center gap-3">
        <Button type="submit" disabled={save.isPending}>
          Enregistrer
        </Button>
        {saved && !save.isPending && <span className="text-sm text-green-700">Enregistré ✓</span>}
      </div>
    </form>
  )
}

/** Petites étiquettes pour la collection : carton et défaut. */
export function PinCopyTags({ item }: { item: CollectionItem }) {
  return (
    <div className="flex flex-wrap gap-1 px-3 pb-3">
      {item.backingCard === true && (
        <span className="rounded bg-slate-100 px-1.5 py-0.5 text-xs text-slate-600">Avec carton</span>
      )}
      {item.backingCard === false && (
        <span className="rounded bg-slate-100 px-1.5 py-0.5 text-xs text-slate-600">Sans carton</span>
      )}
      {item.defect && (
        <span title={item.defect} className="max-w-full truncate rounded bg-amber-100 px-1.5 py-0.5 text-xs text-amber-800">
          Défaut : {item.defect}
        </span>
      )}
    </div>
  )
}
