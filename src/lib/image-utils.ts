import imageCompression from "browser-image-compression"

export interface CompressedImage {
  full: File
  thumb: File
  width: number
  height: number
}

export async function compressImage(file: File): Promise<CompressedImage> {
  // Get original dimensions
  const dimensions = await getImageDimensions(file)

  // Compress for full size (max 1920px, ~800kb)
  const fullOptions = {
    maxSizeMB: 0.8,
    maxWidthOrHeight: 1920,
    useWebWorker: true,
    fileType: "image/jpeg" as const,
  }
  const fullCompressed = await imageCompression(file, fullOptions)

  // Create thumbnail (120px)
  const thumbOptions = {
    maxSizeMB: 0.05,
    maxWidthOrHeight: 400,
    useWebWorker: true,
    fileType: "image/jpeg" as const,
  }
  const thumbCompressed = await imageCompression(file, thumbOptions)

  return {
    full: fullCompressed,
    thumb: thumbCompressed,
    width: dimensions.width,
    height: dimensions.height,
  }
}

function getImageDimensions(file: File): Promise<{ width: number; height: number }> {
  return new Promise((resolve, reject) => {
    const img = new Image()
    img.onload = () => {
      resolve({ width: img.width, height: img.height })
      URL.revokeObjectURL(img.src)
    }
    img.onerror = reject
    img.src = URL.createObjectURL(file)
  })
}

export function generateId(): string {
  return `${Date.now()}-${Math.random().toString(36).substring(2, 9)}`
}
