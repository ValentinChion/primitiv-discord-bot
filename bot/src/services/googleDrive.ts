/**
 * Google Drive service for uploading invoices
 * Adapted for Cloudflare Workers environment
 */

import { google } from 'googleapis';

export interface UploadResult {
  webViewLink: string;
  fileId: string;
}

/**
 * Upload a file to Google Drive
 * @param fileBuffer - Buffer containing the file data
 * @param fileName - Name for the file
 * @param mimeType - MIME type of the file
 * @param folderId - Google Drive folder ID
 * @param serviceAccountEmail - Service account email
 * @param privateKey - Service account private key
 */
export async function uploadToDrive(
  fileBuffer: ArrayBuffer,
  fileName: string,
  mimeType: string,
  folderId: string,
  serviceAccountEmail: string,
  privateKey: string
): Promise<UploadResult> {
  // Create JWT auth client
  const auth = new google.auth.JWT({
    email: serviceAccountEmail,
    key: privateKey,
    scopes: ['https://www.googleapis.com/auth/drive.file'],
  });

  const drive = google.drive({ version: 'v3', auth });

  // Convert ArrayBuffer to Buffer for googleapis
  const buffer = Buffer.from(fileBuffer);

  const response = await drive.files.create({
    requestBody: {
      name: fileName,
      parents: [folderId],
    },
    media: {
      mimeType,
      body: buffer,
    },
    fields: 'id,webViewLink',
  });

  if (!response.data.id || !response.data.webViewLink) {
    throw new Error('Failed to upload file to Google Drive');
  }

  return {
    fileId: response.data.id,
    webViewLink: response.data.webViewLink,
  };
}

/**
 * Download a file from Discord CDN
 * @param url - Discord CDN URL
 */
export async function downloadFromDiscord(url: string): Promise<ArrayBuffer> {
  const response = await fetch(url);

  if (!response.ok) {
    throw new Error(`Failed to download file from Discord: ${response.status}`);
  }

  return await response.arrayBuffer();
}
