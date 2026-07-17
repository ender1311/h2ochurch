// Raster-image magic-byte detection for uploads. SVG and any non-raster type
// are intentionally unsupported: a public bucket serving an attacker-supplied
// SVG with an image/svg+xml content-type is a stored-XSS vector. Callers must
// use the DETECTED content-type, never the client-declared file.type.
export type DetectedImage = { ext: string; contentType: string };

export function detectRasterImage(bytes: Uint8Array): DetectedImage | null {
  const b = bytes;
  if (b.length >= 8 && b[0] === 0x89 && b[1] === 0x50 && b[2] === 0x4e && b[3] === 0x47)
    return { ext: "png", contentType: "image/png" };
  if (b.length >= 3 && b[0] === 0xff && b[1] === 0xd8 && b[2] === 0xff)
    return { ext: "jpg", contentType: "image/jpeg" };
  if (b.length >= 6 && b[0] === 0x47 && b[1] === 0x49 && b[2] === 0x46 && b[3] === 0x38)
    return { ext: "gif", contentType: "image/gif" };
  if (
    b.length >= 12 && b[0] === 0x52 && b[1] === 0x49 && b[2] === 0x46 && b[3] === 0x46 &&
    b[8] === 0x57 && b[9] === 0x45 && b[10] === 0x42 && b[11] === 0x50
  )
    return { ext: "webp", contentType: "image/webp" };
  return null;
}
