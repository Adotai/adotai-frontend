import * as FileSystem from "expo-file-system";
import Constants from 'expo-constants';

function getMimeType(fileName: string) {
  const extension = fileName.split('.').pop()?.toLowerCase();
  switch (extension) {
    case 'jpg':
    case 'jpeg':
      return 'image/jpeg';
    case 'png':
      return 'image/png';
    case 'pdf':
      return 'application/pdf';
    case 'docx':
      return 'application/vnd.openxmlformats-officedocument.wordprocessingml.document';
    case 'doc':
      return 'application/msword';
    default:
      return 'application/octet-stream';
  }
}

export async function uploadFileToStorage(fileUri: string, path: string) {
  try {
    const response = await fetch(fileUri);
    const blob = await response.blob();
    console.log('Blob size:', blob.size);

    const storageBucket = Constants.expoConfig?.extra?.firebaseStorageBucket;
    const uploadUrl = `https://firebasestorage.googleapis.com/v0/b/${storageBucket}/o?uploadType=media&name=${encodeURIComponent(path)}`;

    const uploadResponse = await fetch(uploadUrl, {
      method: 'POST',
      headers: {
        'Content-Type': getMimeType(path),
      },
      body: blob,
    });

    const result = await uploadResponse.json();

    if (!uploadResponse.ok) {
      console.log('Firebase error payload:', result);
      throw new Error(result.error?.message || 'Erro ao enviar arquivo');
    }

    const downloadUrl = `https://firebasestorage.googleapis.com/v0/b/${storageBucket}/o/${encodeURIComponent(path)}?alt=media`;
    return downloadUrl;
  } catch (error) {
    console.error('Error uploading file:', error);
    throw error;
  }
}
