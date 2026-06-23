/** Returns true for http(s) URLs or data:image uploads */
export function isValidImageSource(value: string): boolean {
  const v = value.trim();
  if (!v) return false;
  if (v.startsWith("data:image/")) return true;
  try {
    const url = new URL(v);
    return url.protocol === "http:" || url.protocol === "https:";
  } catch {
    return false;
  }
}

export function parseImageLinks(raw: string): string[] {
  return raw
    .split(/[\n,]+/)
    .map((s) => s.trim())
    .filter(Boolean);
}
