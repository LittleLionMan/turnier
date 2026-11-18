import { readFile } from "node:fs/promises";
import path from "node:path";
import { isPhotoFile, PHOTO_TYPES } from "@/lib/photos";

export async function GET(_request: Request, { params }: { params: Promise<{ datei: string }> }): Promise<Response> {
  const { datei } = await params;
  const file = decodeURIComponent(datei);
  if (!isPhotoFile(file)) return new Response("Nicht gefunden", { status: 404 });

  try {
    const data = await readFile(path.join(process.cwd(), "fotos", file));
    return new Response(new Uint8Array(data), {
      headers: {
        "Content-Type": PHOTO_TYPES[path.extname(file).toLowerCase()],
        "Cache-Control": "public, max-age=3600",
      },
    });
  } catch {
    return new Response("Nicht gefunden", { status: 404 });
  }
}
