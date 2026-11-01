/**
 * Client-side high-fidelity document image compression & resizing.
 * Optimizes oversized smartphone captures (5MB-12MB) down to crisp,
 * OCR-ready images (~600KB-900KB) at ~300 DPI equivalent.
 *
 * Preserves high contrast and sharp text boundaries for OCR/LLM models
 * while drastically accelerating upload bandwidth.
 */

export interface CompressionOptions {
  /** Maximum width or height in pixels. Default: 2200 (approx. 300 DPI for standard Letter/A4) */
  maxDimension?: number;
  /** JPEG/WebP output quality (0.0 to 1.0). Default: 0.88 */
  quality?: number;
  /** Size threshold in bytes below which compression is skipped. Default: 1MB (1,048,576 bytes) */
  minSizeThreshold?: number;
}

/**
 * Checks if a given file is a raster image eligible for compression.
 * PDFs and non-image files are strictly ignored to preserve vector and text data.
 */
export function isCompressibleImage(file: File): boolean {
  if (!file?.type) return false;
  const type = file.type.toLowerCase();
  return type === "image/jpeg" || type === "image/jpg" || type === "image/png" || type === "image/webp";
}

/**
 * Compresses and resizes a single document image file in the browser using HTML Canvas.
 * Returns the original file untouched if:
 * - It is not a compressible raster image (e.g. PDFs are bypassed)
 * - Its file size is already below the minimum threshold and dimensions are within bounds
 */
export async function compressDocumentImage(file: File, options: CompressionOptions = {}): Promise<File> {
  // Always preserve non-images and PDFs intact
  if (!isCompressibleImage(file)) {
    return file;
  }

  // Ensure running in browser environment
  if (typeof window === "undefined" || typeof document === "undefined") {
    return file;
  }

  const maxDimension = options.maxDimension ?? 2200;
  const quality = options.quality ?? 0.88;
  const minSizeThreshold = options.minSizeThreshold ?? 1024 * 1024; // 1 MB

  try {
    // Create image element from file
    const objectUrl = URL.createObjectURL(file);
    const img = await new Promise<HTMLImageElement>((resolve, reject) => {
      const image = new Image();
      image.onload = () => resolve(image);
      image.onerror = (e) => reject(e);
      image.src = objectUrl;
    });

    const origWidth = img.naturalWidth || img.width;
    const origHeight = img.naturalHeight || img.height;

    // If already small in file size and within reasonable dimensions, do not touch
    if (file.size <= minSizeThreshold && origWidth <= maxDimension && origHeight <= maxDimension) {
      URL.revokeObjectURL(objectUrl);
      return file;
    }

    // Calculate proportional dimensions
    let targetWidth = origWidth;
    let targetHeight = origHeight;

    if (origWidth > maxDimension || origHeight > maxDimension) {
      if (origWidth >= origHeight) {
        targetWidth = maxDimension;
        targetHeight = Math.round((origHeight * maxDimension) / origWidth);
      } else {
        targetHeight = maxDimension;
        targetWidth = Math.round((origWidth * maxDimension) / origHeight);
      }
    }

    // Render to canvas with high smoothing quality
    const canvas = document.createElement("canvas");
    canvas.width = targetWidth;
    canvas.height = targetHeight;

    const ctx = canvas.getContext("2d");
    if (!ctx) {
      URL.revokeObjectURL(objectUrl);
      return file;
    }

    // High quality interpolation
    ctx.imageSmoothingEnabled = true;
    ctx.imageSmoothingQuality = "high";

    // Draw white background in case source has transparent alpha channels (e.g. PNG)
    ctx.fillStyle = "#FFFFFF";
    ctx.fillRect(0, 0, targetWidth, targetHeight);

    // Draw resized image
    ctx.drawImage(img, 0, 0, targetWidth, targetHeight);
    URL.revokeObjectURL(objectUrl);

    // Convert canvas to Blob with high-quality JPEG
    const mimeType = "image/jpeg";
    const blob = await new Promise<Blob | null>((resolve) => {
      canvas.toBlob((b) => resolve(b), mimeType, quality);
    });

    if (!blob) {
      return file;
    }

    // If compressed output is somehow larger than original, keep original
    if (blob.size >= file.size) {
      return file;
    }

    // Rename extension to .jpg if it was converted from PNG/WebP
    const origName = file.name;
    const nameWithoutExt = origName.replace(/\.[^/.]+$/, "");
    const finalFileName = origName.toLowerCase().endsWith(".pdf") ? origName : `${nameWithoutExt}.jpg`;

    return new File([blob], finalFileName, {
      type: mimeType,
      lastModified: Date.now(),
    });
  } catch (err) {
    console.warn("Client-side image compression encountered an issue. Falling back to original file:", err);
    return file;
  }
}

/**
 * Compresses an array of files concurrently. Non-image files (PDFs) are passed through untouched.
 */
export async function compressDocumentFiles(files: File[], options: CompressionOptions = {}): Promise<File[]> {
  if (!files || files.length === 0) return [];
  return Promise.all(files.map((f) => compressDocumentImage(f, options)));
}
