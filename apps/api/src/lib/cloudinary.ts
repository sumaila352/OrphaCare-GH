import { v2 as cloudinary } from 'cloudinary';

function env(name: string) {
  return process.env[name]?.trim() ?? '';
}

export function isCloudinaryConfigured(): boolean {
  return !!(env('CLOUDINARY_CLOUD_NAME') && env('CLOUDINARY_API_KEY') && env('CLOUDINARY_API_SECRET'));
}

export function ensureCloudinaryConfigured(): boolean {
  if (!isCloudinaryConfigured()) return false;

  cloudinary.config({
    cloud_name: env('CLOUDINARY_CLOUD_NAME'),
    api_key: env('CLOUDINARY_API_KEY'),
    api_secret: env('CLOUDINARY_API_SECRET'),
    secure: true,
  });
  return true;
}

export { cloudinary };
