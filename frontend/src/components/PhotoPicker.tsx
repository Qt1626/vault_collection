import { useMutation } from '@tanstack/react-query'
import { useRef, useState, type ChangeEvent } from 'react'
import { api } from '../api/client'
import { shrinkImage } from './image'

/**
 * Deux boutons : « Prendre une photo » ouvre directement l'appareil photo sur téléphone,
 * « Choisir une image » ouvre la galerie / les fichiers. La photo est réduite puis envoyée.
 */
export function PhotoPicker({ onUploaded, disabled }: { onUploaded: (url: string) => void; disabled?: boolean }) {
  const camera = useRef<HTMLInputElement>(null)
  const gallery = useRef<HTMLInputElement>(null)
  const [error, setError] = useState<string | null>(null)

  const upload = useMutation({
    mutationFn: async (file: File) => api.uploadImage(await shrinkImage(file)),
    onSuccess: ({ url }) => onUploaded(url),
    onError: (e) => setError(e.message),
  })

  const onFile = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    e.target.value = ''
    if (!file) return
    setError(null)
    upload.mutate(file)
  }

  const busy = disabled || upload.isPending
  const btn =
    'flex items-center justify-center gap-2 rounded-md px-3 py-2 text-sm font-semibold transition disabled:opacity-50'

  return (
    <div className="space-y-2">
      <div className="grid grid-cols-2 gap-2">
        <button
          type="button"
          disabled={busy}
          onClick={() => camera.current?.click()}
          className={`${btn} bg-brand-600 text-white hover:bg-brand-700`}
        >
          <CameraIcon /> Prendre une photo
        </button>
        <button
          type="button"
          disabled={busy}
          onClick={() => gallery.current?.click()}
          className={`${btn} border border-slate-300 bg-white text-slate-700 hover:bg-slate-50`}
        >
          Choisir une image
        </button>
      </div>
      <input ref={camera} type="file" accept="image/*" capture="environment" hidden onChange={onFile} />
      <input ref={gallery} type="file" accept="image/*" hidden onChange={onFile} />
      {upload.isPending && <p className="text-xs text-slate-500">Envoi de la photo…</p>}
      {error && <p className="text-xs text-red-600">{error}</p>}
    </div>
  )
}

function CameraIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden>
      <path d="M4 8h3l2-3h6l2 3h3v11H4z" strokeLinejoin="round" />
      <circle cx="12" cy="13" r="3.5" />
    </svg>
  )
}
