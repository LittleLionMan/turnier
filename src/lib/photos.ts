import { readdir } from "node:fs/promises";
import path from "node:path";

export type Photo = {
  file: string;
  src: string;
  caption: string;
};

export const PHOTO_TYPES: Record<string, string> = {
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".png": "image/png",
  ".webp": "image/webp",
  ".avif": "image/avif",
};

export function isPhotoFile(file: string): boolean {
  return path.basename(file) === file && !file.startsWith(".") && path.extname(file).toLowerCase() in PHOTO_TYPES;
}

function captionFromFile(file: string): string {
  return path
    .basename(file, path.extname(file))
    .replace(/^\d{1,2}[-_.\s]+/, "")
    .replaceAll("_", " ")
    .trim();
}

export async function listPhotos(): Promise<Photo[]> {
  let files: string[];
  try {
    files = await readdir(path.join(process.cwd(), "fotos"));
  } catch {
    return [];
  }
  return files
    .filter(isPhotoFile)
    .sort((a, b) => a.localeCompare(b, "de", { numeric: true }))
    .map((file) => ({ file, src: `/fotos/${encodeURIComponent(file)}`, caption: captionFromFile(file) }));
}
