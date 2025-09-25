import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// Reemplaza 'YOUR_ACCESS_TOKEN' con un token de acceso real de una de tus imágenes en Firebase Storage.
export const buildImageUrl = (fileName: string) => {
    const bucketName = "chubut-evala.appspot.com";
    const accessToken = '0fc7d008-069d-4f6b-843c-c053b33c64bd'; 
    return `https://firebasestorage.googleapis.com/v0/b/${bucketName}/o/login-backgrounds%2F${fileName}?alt=media&token=${accessToken}`;
}
