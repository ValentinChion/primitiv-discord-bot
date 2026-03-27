/**
 * File storage service using Cloudflare R2
 */

export interface UploadResult {
  url: string;
}

export async function uploadToR2(
  bucket: R2Bucket,
  fileBuffer: ArrayBuffer,
  fileName: string,
  mimeType: string,
  publicBaseUrl: string
): Promise<UploadResult> {
  await bucket.put(fileName, fileBuffer, {
    httpMetadata: { contentType: mimeType },
  });

  return {
    url: `${publicBaseUrl}/${fileName}`,
  };
}

export async function downloadFromDiscord(url: string): Promise<ArrayBuffer> {
  const response = await fetch(url);

  if (!response.ok) {
    throw new Error(`Failed to download file from Discord: ${response.status}`);
  }

  return await response.arrayBuffer();
}
