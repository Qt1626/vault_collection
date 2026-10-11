const euro = new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'EUR' })

export function formatEuro(value: number | null | undefined) {
  return value == null ? '—' : euro.format(value)
}
