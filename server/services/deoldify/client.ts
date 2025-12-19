/**
 * DeOldify API Client
 * 
 * Connects to a local or remote DeOldify service for image colorization.
 * 
 * Expected API format:
 * POST /colorize
 * Body: multipart/form-data with 'image' field
 * Response: { image: base64_string } or direct image file
 * 
 * Or alternative format:
 * POST /colorize
 * Body: { image: base64_string }
 * Response: { image: base64_string }
 */

// @ts-ignore - Node.js globals
const DEOLDIFY_API_URL = process.env.DEOLDIFY_API_URL || "http://localhost:8000";
// @ts-ignore - Node.js globals
const DEOLDIFY_API_TIMEOUT = parseInt(process.env.DEOLDIFY_API_TIMEOUT || "60000", 10); // 60 seconds default

export interface DeOldifyConfig {
  apiUrl?: string;
  timeout?: number;
}

/**
 * Colorize a black and white image using DeOldify model.
 * @param imageBase64 - Base64 encoded image string (without data: prefix)
 * @param mimeType - Image mime type (e.g. image/jpeg)
 * @param config - Optional configuration override
 * @returns Data URL string with colorized image
 */
export async function colorizeImage(
  imageBase64: string,
  mimeType: string = "image/jpeg",
  config?: DeOldifyConfig
): Promise<string> {
  const apiUrl = config?.apiUrl || DEOLDIFY_API_URL;
  const timeout = config?.timeout || DEOLDIFY_API_TIMEOUT;

  try {
    // Try format 1: multipart/form-data with image buffer
    // @ts-ignore - form-data module types
    const FormDataModule = await import("form-data");
    const FormDataClass = FormDataModule.default || FormDataModule;
    const formData = new FormDataClass();
    const buffer = base64ToBuffer(imageBase64);
    formData.append("image", buffer, {
      filename: `image.${mimeType.split("/")[1]}`,
      contentType: mimeType,
    });

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), timeout);

    const response = await fetch(`${apiUrl}/colorize`, {
      method: "POST",
      body: formData as any,
      headers: formData.getHeaders() as any,
      signal: controller.signal as any,
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      // Try format 2: JSON with base64
      if (response.status === 415 || response.status === 400) {
        return await tryJsonFormat(imageBase64, mimeType, apiUrl, timeout);
      }
      const errorText = await response.text();
      throw new Error(`DeOldify API error: ${response.status} ${errorText}`);
    }

    const contentType = response.headers.get("content-type");
    
    // If response is an image directly
    if (contentType?.startsWith("image/")) {
      const base64 = await responseToBase64(response);
      return `data:${contentType};base64,${base64}`;
    }

    // If response is JSON with base64 image
    const data = await response.json();
    
    if (data.image) {
      // If base64 string already includes data: prefix
      if (data.image.startsWith("data:")) {
        return data.image;
      }
      // If base64 string without prefix
      const resultMimeType = data.mimeType || contentType || mimeType;
      return `data:${resultMimeType};base64,${data.image}`;
    }

    throw new Error("Invalid response format from DeOldify API");
  } catch (error: any) {
    if (error.name === "AbortError") {
      throw new Error(`DeOldify API timeout after ${timeout}ms`);
    }
    throw error;
  }
}

/**
 * Try JSON format for API
 */
async function tryJsonFormat(
  imageBase64: string,
  mimeType: string,
  apiUrl: string,
  timeout: number
): Promise<string> {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeout);

  const response = await fetch(`${apiUrl}/colorize`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      image: imageBase64,
      mime_type: mimeType,
    }),
    signal: controller.signal,
  });

  clearTimeout(timeoutId);

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`DeOldify API error: ${response.status} ${errorText}`);
  }

  const contentType = response.headers.get("content-type");
  
  if (contentType?.startsWith("image/")) {
    const base64 = await responseToBase64(response);
    return `data:${contentType};base64,${base64}`;
  }

  const data = await response.json();
  
  if (data.image) {
    if (data.image.startsWith("data:")) {
      return data.image;
    }
    const resultMimeType = data.mimeType || contentType || mimeType;
    return `data:${resultMimeType};base64,${data.image}`;
  }

  throw new Error("Invalid response format from DeOldify API");
}

/**
 * Convert base64 string to Buffer (for Node.js)
 */
function base64ToBuffer(base64: string) {
  // @ts-ignore - Node.js Buffer is global
  return Buffer.from(base64, "base64");
}

/**
 * Convert Response blob/buffer to base64 string
 */
async function responseToBase64(response: Response): Promise<string> {
  const arrayBuffer = await response.arrayBuffer();
  // @ts-ignore - Node.js Buffer is global
  const buffer = Buffer.from(arrayBuffer);
  return buffer.toString("base64");
}

