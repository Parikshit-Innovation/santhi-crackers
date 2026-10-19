import { getApiEndpoints } from "./config.js";

export interface UploadResponse {
  success: boolean;
  url: string;
  secure_url: string;
  public_id: string;
  format: string;
}

/**
 * Uploads an image file to the backend Cloudinary upload endpoint.
 * Returns the secure Cloudinary image URL.
 */
export async function uploadImage(file: File, folder = "santhi-crackers"): Promise<string> {
  const endpoints = getApiEndpoints("/api/upload");
  const formData = new FormData();
  formData.append("image", file);
  formData.append("folder", folder);

  let lastError: Error | null = null;

  for (const endpoint of endpoints) {
    try {
      const response = await fetch(endpoint, {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => null);
        const errorMsg = errorData?.error || `Upload failed with status ${response.status}`;
        throw new Error(errorMsg);
      }

      const data = (await response.json()) as UploadResponse;
      return data.secure_url || data.url;
    } catch (err: any) {
      lastError = err;
      console.warn(`Upload attempt failed at ${endpoint}:`, err);
    }
  }

  throw lastError || new Error("Failed to upload image to server.");
}
