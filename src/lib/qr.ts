/**
 * QR code generation utilities.
 * Encodes with @nuintun/qrcode (UTF-8 + ECI) and draws with qr-code-styling.
 * All processing is local - no network calls.
 */

import { Byte, Charset, Encoder } from '@nuintun/qrcode';
import QRCodeStyling from 'qr-code-styling';

export type ErrorCorrectionLevel = 'L' | 'M' | 'Q' | 'H';

/** Subset of qr-code-styling's QRCode used for drawing */
type QrMatrix = {
  getModuleCount: () => number;
  isDark: (row: number, col: number) => boolean;
};

export type DotType =
  | 'square'
  | 'rounded'
  | 'dots'
  | 'classy'
  | 'classy-rounded'
  | 'extra-rounded';

export type CornerSquareType =
  | 'square'
  | 'dot'
  | 'extra-rounded'
  | 'rounded'
  | 'dots'
  | 'classy'
  | 'classy-rounded';

export type CornerDotType =
  | 'square'
  | 'dot'
  | 'rounded'
  | 'dots'
  | 'classy'
  | 'classy-rounded'
  | 'extra-rounded';

export interface QrOptions {
  errorCorrectionLevel: ErrorCorrectionLevel;
  margin?: number;
  width?: number;
  color?: string;
  bgColor?: string;
  dotsType?: DotType;
  cornersSquareType?: CornerSquareType;
  cornersDotType?: CornerDotType;
  /** Logo as a data URL (local file upload) */
  logo?: string;
}

const PREVIEW_SIZE = 320;

/** PNG download resolution in pixels */
export const DOWNLOAD_SIZE = 1024;

/** Four steps from square → fully round for the design sliders */
export const DOT_ROUNDNESS: DotType[] = ['square', 'rounded', 'extra-rounded', 'dots'];
export const CORNER_SQUARE_ROUNDNESS: CornerSquareType[] = [
  'square',
  'rounded',
  'extra-rounded',
  'dot',
];
export const CORNER_DOT_ROUNDNESS: CornerDotType[] = ['square', 'rounded', 'extra-rounded', 'dot'];

export const ROUNDNESS_MAX = DOT_ROUNDNESS.length - 1;

/**
 * Encode payload as UTF-8 with an ECI designation (assignment 26).
 * Without ECI, scanners that default to MacRoman/Latin-1 misread UTF-8
 * (e.g. "Zürich" → "Z√ºrich").
 */
function encodeUtf8Matrix(content: string, level: ErrorCorrectionLevel): QrMatrix {
  const encoded = new Encoder({ level }).encode(new Byte(content, Charset.UTF_8));
  return {
    getModuleCount: () => encoded.size,
    // qr-code-styling uses (row, col); @nuintun uses (x, y)
    isDark: (row: number, col: number) => encoded.get(col, row) === 1,
  };
}

/**
 * qr-code-styling's bundled generator has no ECI support, so we replace its
 * matrix with one from @nuintun/qrcode after construction.
 */
function applyEncodedMatrix(qr: QRCodeStyling, matrix: QrMatrix, type: 'svg' | 'canvas') {
  qr._qr = matrix as QRCodeStyling['_qr'];
  if (type === 'svg') {
    qr._svg = undefined;
    qr._svgDrawingPromise = undefined;
    qr._setupSvg();
  } else {
    qr._domCanvas = undefined;
    qr._nodeCanvas = undefined;
    qr._canvasDrawingPromise = undefined;
    qr._setupCanvas();
  }
}

function createQr(content: string, options: QrOptions, type: 'svg' | 'canvas' = 'svg') {
  const width = options.width ?? PREVIEW_SIZE;
  const color = options.color ?? '#000000';
  const hasLogo = Boolean(options.logo);
  const matrix = encodeUtf8Matrix(content, options.errorCorrectionLevel);

  const qr = new QRCodeStyling({
    type,
    width,
    height: width,
    margin: options.margin ?? Math.max(8, Math.round(width * 0.04)),
    // Placeholder only — replaced immediately with the ECI UTF-8 matrix
    data: '0',
    image: options.logo || undefined,
    qrOptions: {
      errorCorrectionLevel: options.errorCorrectionLevel,
      mode: 'Byte',
    },
    dotsOptions: {
      type: options.dotsType ?? 'square',
      color,
    },
    cornersSquareOptions: {
      type: options.cornersSquareType ?? 'square',
      color,
    },
    cornersDotOptions: {
      type: options.cornersDotType ?? 'square',
      color,
    },
    backgroundOptions: {
      color: options.bgColor ?? '#ffffff',
    },
    ...(hasLogo
      ? {
          imageOptions: {
            hideBackgroundDots: true,
            imageSize: 0.28,
            margin: Math.max(4, Math.round(width * 0.015)),
            saveAsBlob: true,
          },
        }
      : {}),
  });

  applyEncodedMatrix(qr, matrix, type);
  return qr;
}

async function blobToDataUrl(blob: Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = () => reject(reader.error ?? new Error('Failed to read blob'));
    reader.readAsDataURL(blob);
  });
}

/**
 * Generate QR code as SVG string
 */
export async function generateQrSvg(content: string, options: QrOptions): Promise<string> {
  const qr = createQr(content, options, 'svg');
  const blob = await qr.getRawData('svg');
  if (!blob || !(blob instanceof Blob)) {
    throw new Error('Failed to generate SVG');
  }
  return blob.text();
}

/**
 * Generate QR code as PNG data URL
 */
export async function generateQrPng(content: string, options: QrOptions): Promise<string> {
  const qr = createQr(
    content,
    { ...options, width: options.width ?? DOWNLOAD_SIZE },
    'canvas',
  );
  const blob = await qr.getRawData('png');
  if (!blob || !(blob instanceof Blob)) {
    throw new Error('Failed to generate PNG');
  }
  return blobToDataUrl(blob);
}
