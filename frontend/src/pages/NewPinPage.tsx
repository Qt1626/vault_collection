import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useState, type FormEvent } from 'react'
import { useNavigate } from 'react-router-dom'
import { ApiError, api } from '../api/client'
import { EDITIONS, EDITION_LABELS, PARKS, PARK_LABELS, type Edition, type Park, type PinInput } from '../api/types'
import { PhotoPicker } from '../components/PhotoPicker'
import { PinImage } from '../components/PinImage'
import { Button, ErrorBox, Field, Input, Select } from '../components/ui'

export function NewPinPage() {
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const [form, setForm] = useState({
    name: '',
    characterName: '',
    series: '',
    park: 'DISNEYLAND_PARIS' as Park,
    edition: 'OPEN_EDITION' as Edition,
    editionSize: '',
    releaseYear: '',
    imageUrl: '',
    description: '',
  })

  const create = useMutation({
    mutationFn: () => {
      const input: PinInput = {
        name: form.name,
        park: form.park,
        edition: form.edition,
        characterName: form.characterName || undefined,
        series: form.series || undefined,
        description: form.description || undefined,
        imageUrl: form.imageUrl || undefined,
        editionSize: form.editionSize ? Number(form.editionSize) : undefined,
        releaseYear: form.releaseYear ? Number(form.releaseYear) : undefined,
      }
      return api.createPin(input)
    },
    onSuccess: (pin) => {
      queryClient.invalidateQueries({ queryKey: ['pins'] })
      navigate(`/pins/${pin.id}`)
    },
  })

  const errors = create.error instanceof ApiError ? create.error.fieldErrors : undefined
  const set = (key: keyof typeof form) => (e: { target: { value: string } }) => setForm({ ...form, [key]: e.target.value })
  const submit = (e: FormEvent) => {
    e.preventDefault()
    create.mutate()
  }

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <h1 className="text-2xl font-bold">Ajouter un pin au catalogue</h1>
      <form onSubmit={submit} className="grid gap-4 rounded-2xl bg-white p-6 shadow-sm sm:grid-cols-2">
        <div className="sm:col-span-2">
          <Field label="Nom *" error={errors?.name}>
            <Input value={form.name} onChange={set('name')} required maxLength={150} />
          </Field>
        </div>
        <Field label="Personnage" error={errors?.characterName}>
          <Input value={form.characterName} onChange={set('characterName')} />
        </Field>
        <Field label="Série / collection" error={errors?.series}>
          <Input value={form.series} onChange={set('series')} />
        </Field>
        <Field label="Parc / origine *">
          <Select value={form.park} onChange={set('park')}>
            {PARKS.map((p) => (
              <option key={p} value={p}>
                {PARK_LABELS[p]}
              </option>
            ))}
          </Select>
        </Field>
        <Field label="Type d'édition *">
          <Select value={form.edition} onChange={set('edition')}>
            {EDITIONS.map((ed) => (
              <option key={ed} value={ed}>
                {EDITION_LABELS[ed]}
              </option>
            ))}
          </Select>
        </Field>
        <Field label="Taille de l'édition (LE)" error={errors?.editionSize}>
          <Input type="number" min={1} value={form.editionSize} onChange={set('editionSize')} />
        </Field>
        <Field label="Année de sortie" error={errors?.releaseYear}>
          <Input type="number" min={1955} max={2100} value={form.releaseYear} onChange={set('releaseYear')} />
        </Field>
        <div className="flex gap-4 sm:col-span-2">
          <PinImage src={form.imageUrl || null} alt="Aperçu" className="h-28 w-28 shrink-0 rounded-xl" />
          <div className="flex-1 space-y-2">
            <Field label="Photo" error={errors?.imageUrl}>
              <PhotoPicker onUploaded={(url) => setForm((f) => ({ ...f, imageUrl: url }))} />
            </Field>
            <Input
              type="text"
              placeholder="…ou colle l'URL d'une image (https://…)"
              value={form.imageUrl}
              onChange={set('imageUrl')}
            />
          </div>
        </div>
        <div className="sm:col-span-2">
          <Field label="Description" error={errors?.description}>
            <textarea
              value={form.description}
              onChange={set('description')}
              rows={4}
              maxLength={2000}
              className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-brand-500 focus:outline-none"
            />
          </Field>
        </div>
        {create.error && !errors && (
          <div className="sm:col-span-2">
            <ErrorBox message={create.error.message} />
          </div>
        )}
        <div className="sm:col-span-2">
          <Button type="submit" disabled={create.isPending}>
            Enregistrer
          </Button>
        </div>
      </form>
    </div>
  )
}
