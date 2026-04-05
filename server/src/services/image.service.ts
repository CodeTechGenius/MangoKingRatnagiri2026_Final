import sharp from 'sharp';
import path from 'path';
import fs from 'fs';

const UPLOAD_DIR = process.env.UPLOAD_DIR || './uploads';

export async function saveImage(buffer: Buffer, folder: string, width = 800, height = 800): Promise<string> {
  const dir = path.join(UPLOAD_DIR, folder);
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });

  const filename = `${Date.now()}-${Math.random().toString(36).slice(2)}.webp`;
  const filepath = path.join(dir, filename);

  await sharp(buffer)
    .resize(width, height, { fit: 'inside', withoutEnlargement: true })
    .webp({ quality: 85 })
    .toFile(filepath);

  return `/uploads/${folder}/${filename}`;
}

export async function saveBanner(buffer: Buffer): Promise<string> {
  return saveImage(buffer, 'banners', 1200, 450);
}

export function deleteImage(url: string) {
  try {
    const filepath = path.join(UPLOAD_DIR, '..', url);
    if (fs.existsSync(filepath)) fs.unlinkSync(filepath);
  } catch {}
}
