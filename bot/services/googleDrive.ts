import { google } from 'googleapis';
import path from 'path';
import { Attachment } from 'discord.js';

const auth = new google.auth.GoogleAuth({
  keyFile: path.join(__dirname, './google-drive-credentials.json'),
  scopes: ['https://www.googleapis.com/auth/drive.file'],
});

const drive = google.drive({ version: 'v3', auth });

export async function uploadToDrive(attachment: Attachment, folderId: string, filename: string): Promise<string> {
  try {
    // 2. Téléchargement correct du fichier depuis Discord
    const response = await fetch(attachment.url);
    if (!response.ok) {
      throw new Error(`Échec du téléchargement du fichier (HTTP ${response.status})`);
    }
    const buffer = await response.arrayBuffer(); // Correction : arrayBuffer() au lieu de .buffer
    const arrayBuffer = Buffer.from(buffer);

    // 3. Métadonnées du fichier avec typage correct
    const fileMetadata = {
      name: filename,
      parents: [folderId],
    };

    const media = {
      mimeType: attachment.contentType || 'application/octet-stream',
      body: arrayBuffer, // Utilisation directe du buffer
    };

    // 4. Appel correct à l'API avec typage
    const res = await drive.files.create({
      requestBody: fileMetadata,
      media: media as any, // Contournement temporaire (voir note ci-dessous)
      fields: 'id, webViewLink',
    } as any); // Contournement temporaire

    // 5. Vérification de la réponse
    if (!res.data.id) {
      throw new Error('Aucun ID de fichier retourné par Google Drive');
    }

    return res.data.webViewLink || `https://drive.google.com/file/d/${res.data.id}/view`;
  } catch (error) {
    console.error('Erreur upload Google Drive:', error);
    throw new Error('Échec du stockage du justificatif: ' + (error instanceof Error ? error.message : String(error)));
  }
}
