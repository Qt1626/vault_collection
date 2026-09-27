export function PinImage({ src, alt, className = '' }: { src: string | null; alt: string; className?: string }) {
  if (!src) {
    return (
      <div className={`flex items-center justify-center bg-brand-50 text-4xl text-brand-500 ${className}`} aria-label={alt}>
        ★
      </div>
    )
  }
  return <img src={src} alt={alt} loading="lazy" className={`object-cover ${className}`} />
}
