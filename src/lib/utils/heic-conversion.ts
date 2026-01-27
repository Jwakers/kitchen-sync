/**
 * Shared utility for converting HEIC/HEIF images to JPEG
 * Used across all image upload components
 */

/**
 * Checks if a file is HEIC/HEIF format
 */
export function isHeicFile(file: File): boolean {
  return (
    file.type === "image/heic" ||
    file.type === "image/heif" ||
    file.name.toLowerCase().endsWith(".heic") ||
    file.name.toLowerCase().endsWith(".heif")
  );
}

/**
 * Converts HEIC/HEIF files to JPEG for browser compatibility
 * @param file - The HEIC/HEIF file to convert
 * @param quality - JPEG quality (0-1, default: 0.9)
 * @returns A Promise that resolves to a JPEG File
 */
export async function convertHeicToJpeg(
  file: File,
  quality = 0.9,
): Promise<File> {
  try {
    // Dynamic import to handle CommonJS module
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access
    const heic2anyModule = await import("heic2any");
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access
    const heic2any = heic2anyModule.default || heic2anyModule;

    // eslint-disable-next-line @typescript-eslint/no-unsafe-call
    const convertedBlob = await heic2any({
      blob: file,
      toType: "image/jpeg",
      quality,
    });

    // heic2any can return an array, take the first item
    const blob = Array.isArray(convertedBlob)
      ? convertedBlob[0]
      : convertedBlob;

    // Create a new File object with JPEG mime type
    const jpegFile = new File(
      [blob],
      file.name.replace(/\.(heic|heif)$/i, ".jpg"),
      {
        type: "image/jpeg",
        lastModified: file.lastModified,
      },
    );

    return jpegFile;
  } catch (error) {
    console.error("Error converting HEIC file:", error);
    throw new Error("Failed to convert HEIC image. Please try a different format.");
  }
}

/**
 * Processes a file, converting HEIC/HEIF to JPEG if needed
 * @param file - The file to process
 * @param onConversionStart - Optional callback when conversion starts
 * @param onConversionComplete - Optional callback when conversion completes
 * @returns A Promise that resolves to the processed File (JPEG if converted, original otherwise)
 */
export async function processImageFile(
  file: File,
  onConversionStart?: (fileName: string) => void,
  onConversionComplete?: (fileName: string) => void,
): Promise<File> {
  if (isHeicFile(file)) {
    onConversionStart?.(file.name);
    const converted = await convertHeicToJpeg(file);
    onConversionComplete?.(file.name);
    return converted;
  }
  return file;
}
