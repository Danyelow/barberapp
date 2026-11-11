const MAX_SOURCE_BYTES = 8 * 1024 * 1024
const OUTPUT_SIZE = 320

const loadImage = (src: string) =>
  new Promise<HTMLImageElement>((resolve, reject) => {
    const image = new Image()
    image.onload = () => resolve(image)
    image.onerror = () => reject(new Error('No se pudo leer la imagen.'))
    image.src = src
  })

/**
 * Convierte la foto elegida en un cuadrado de 320 px y la comprime para
 * guardarla en localStorage. No se envía al servidor.
 */
export async function fileToProfilePhoto(file: File) {
  if (!['image/jpeg', 'image/png', 'image/webp'].includes(file.type)) {
    throw new Error('Usa una imagen JPG, PNG o WebP.')
  }
  if (file.size > MAX_SOURCE_BYTES) {
    throw new Error('La imagen no puede superar 8 MB.')
  }

  const objectUrl = URL.createObjectURL(file)
  try {
    const image = await loadImage(objectUrl)
    const sourceSize = Math.min(image.naturalWidth, image.naturalHeight)
    if (!sourceSize) throw new Error('La imagen está vacía o dañada.')

    const canvas = document.createElement('canvas')
    canvas.width = OUTPUT_SIZE
    canvas.height = OUTPUT_SIZE

    const context = canvas.getContext('2d')
    if (!context) throw new Error('El navegador no permite procesar la imagen.')

    context.fillStyle = '#f7f6f4'
    context.fillRect(0, 0, OUTPUT_SIZE, OUTPUT_SIZE)
    context.drawImage(
      image,
      (image.naturalWidth - sourceSize) / 2,
      (image.naturalHeight - sourceSize) / 2,
      sourceSize,
      sourceSize,
      0,
      0,
      OUTPUT_SIZE,
      OUTPUT_SIZE,
    )

    return canvas.toDataURL('image/jpeg', 0.86)
  } finally {
    URL.revokeObjectURL(objectUrl)
  }
}
