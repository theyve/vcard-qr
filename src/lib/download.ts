/**
 * File download utilities.
 * All processing is local - no network calls.
 */

/**
 * Download a Blob as a file
 */
export function downloadBlob(filename: string, blob: Blob): void {
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}

/**
 * Download a data URL as a file
 */
export function downloadDataUrl(filename: string, dataUrl: string): void {
  const a = document.createElement('a');
  a.href = dataUrl;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
}

/**
 * Generate a safe filename from a name
 */
export function safeFilename(name: string, fallback: string = 'vcard'): string {
  const safe = (name || '').trim().replace(/\s+/g, '-').toLowerCase();
  return safe || fallback;
}
