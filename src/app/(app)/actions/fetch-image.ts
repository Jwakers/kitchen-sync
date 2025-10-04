"use server";

import { validateUrlForSSRF } from "@/lib/utils/secure-fetch";

/**
 * Fetches an image from an external URL server-side to bypass CORS restrictions
 * Returns the image as a base64 data URL
 */
export async function fetchImageServerSide(imageUrl: string): Promise<{
  success: boolean;
  data?: string;
  contentType?: string;
  error?: string;
}> {
  try {
    // Validate URL for SSRF protection
    const validation = await validateUrlForSSRF(imageUrl);
    if (!validation.valid) {
      return {
        success: false,
        error: `URL validation failed: ${validation.reason}`,
      };
    }

    // Fetch image from external site
    // Server-side fetch doesn't have CORS restrictions
    const response = await fetch(validation.url!.toString(), {
      headers: {
        "User-Agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
      },
      // Set timeout to prevent hanging
      signal: AbortSignal.timeout(30000),
    });

    if (!response.ok) {
      return {
        success: false,
        error: `Failed to fetch image: ${response.status} ${response.statusText}`,
      };
    }

    // Check content type
    const contentType = response.headers.get("content-type");
    if (!contentType || !contentType.startsWith("image/")) {
      return {
        success: false,
        error: `Invalid content type: ${contentType}`,
      };
    }

    // Get image data as array buffer
    const arrayBuffer = await response.arrayBuffer();

    // Convert to base64
    const base64 = Buffer.from(arrayBuffer).toString("base64");
    const dataUrl = `data:${contentType};base64,${base64}`;

    return {
      success: true,
      data: dataUrl,
      contentType,
    };
  } catch (error) {
    console.error("Error fetching image:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error occurred",
    };
  }
}
