/**
 * Réduit une photo avant l'envoi : les photos de téléphone font souvent 4 à 10 Mo,
 * on les ramène à 1600 px de large maximum en JPEG (~300 Ko), ce qui reste net pour un pin.
 * En cas de souci (format non lisible par le navigateur…), on renvoie le fichier d'origine.
 */
export async function shrinkImage(file: File, maxSize = 1600, quality = 0.85): Promise<File> {
  if (file.type === 'image/gif') return file
  // Formats acceptés tels quels par le serveur ; les autres (ex. HEIC d'iPhone) sont convertis en JPEG.
  const accepted = ['image/jpeg', 'image/png', 'image/webp'].includes(file.type)
  try {
    const bitmap = await createImageBitmap(file, { imageOrientation: 'from-image' })
    const scale = Math.min(1, maxSize / Math.max(bitmap.width, bitmap.height))
    if (accepted && scale === 1 && file.size < 1_500_000) {
      bitmap.close()
      return file
    }
    const canvas = document.createElement('canvas')
    canvas.width = Math.round(bitmap.width * scale)
    canvas.height = Math.round(bitmap.height * scale)
    canvas.getContext('2d')!.drawImage(bitmap, 0, 0, canvas.width, canvas.height)
    bitmap.close()
    const blob = await new Promise<Blob | null>((resolve) => canvas.toBlob(resolve, 'image/jpeg', quality))
    if (!blob) return file
    return new File([blob], file.name.replace(/\.\w+$/, '') + '.jpg', { type: 'image/jpeg' })
  } catch {
    return file
  }
}
