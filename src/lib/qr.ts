/**
 * QR code generation utilities.
 * Wraps the qrcode library for SVG and PNG generation.
 * All processing is local - no network calls.
 */

import QRCode from 'qrcode';

export type ErrorCorrectionLevel = 'L' | 'M' | 'Q' | 'H';

export interface QrOptions {
  errorCorrectionLevel: ErrorCorrectionLevel;
  margin?: number;
  width?: number;
  color?: string; // QR code foreground color (default: black)
}

const DEFAULT_MARGIN = 2;
const PREVIEW_SIZE = 320;

/** PNG download resolution in pixels */
export const DOWNLOAD_SIZE = 1024;

/**
 * Generate QR code as SVG string
 */
export async function generateQrSvg(
  content: string,
  options: QrOptions
): Promise<string> {
  return QRCode.toString(content, {
    type: 'svg',
    errorCorrectionLevel: options.errorCorrectionLevel,
    margin: options.margin ?? DEFAULT_MARGIN,
    width: options.width ?? PREVIEW_SIZE,
    color: {
      dark: options.color ?? '#000000',
      light: '#ffffff',
    },
  });
}

/**
 * Generate QR code as PNG data URL
 */
export async function generateQrPng(
  content: string,
  options: QrOptions
): Promise<string> {
  const canvas = document.createElement('canvas');
  const width = options.width ?? DOWNLOAD_SIZE;
  canvas.width = width;
  canvas.height = width;

  await QRCode.toCanvas(canvas, content, {
    errorCorrectionLevel: options.errorCorrectionLevel,
    margin: options.margin ?? DEFAULT_MARGIN,
    width,
    color: {
      dark: options.color ?? '#000000',
      light: '#ffffff',
    },
  });

  return canvas.toDataURL('image/png');
}
