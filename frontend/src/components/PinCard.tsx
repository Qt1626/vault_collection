import { Link } from 'react-router-dom'
import { EDITION_LABELS, PARK_LABELS, type Pin } from '../api/types'
import type { ReactNode } from 'react'
import { PinImage } from './PinImage'

export function PinCard({ pin, badge, footer }: { pin: Pin; badge?: string; footer?: ReactNode }) {
  return (
    <Link
      to={`/pins/${pin.id}`}
      className="group overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"
    >
      <PinImage src={pin.imageUrl} alt={pin.name} className="aspect-square w-full" />
      <div className="space-y-1 p-3">
        <div className="flex items-start justify-between gap-2">
          <h3 className="font-semibold leading-tight group-hover:text-brand-600">{pin.name}</h3>
          {badge && <span className="shrink-0 rounded bg-brand-100 px-1.5 py-0.5 text-xs text-brand-700">{badge}</span>}
        </div>
        <p className="text-xs text-slate-500">
          {PARK_LABELS[pin.park]}
          {pin.releaseYear ? ` · ${pin.releaseYear}` : ''}
        </p>
        <p className="text-xs font-medium text-slate-600">
          {EDITION_LABELS[pin.edition]}
          {pin.editionSize ? ` (LE ${pin.editionSize})` : ''}
        </p>
      </div>
      {footer}
    </Link>
  )
}
