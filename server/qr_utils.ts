import jsQR from 'jsqr';
import { PNG } from 'pngjs';
import jpeg from 'jpeg-js';
import { spawn } from 'child_process';

export interface DecodedQrCode {
  data: string;
  kind: 'url' | 'phone' | 'wifi' | 'text';
}

/**
 * Classify decoded QR string into url, phone, wifi, or text.
 */
export function classifyQrKind(data: string): 'url' | 'phone' | 'wifi' | 'text' {
  const cleaned = (data || '').trim();
  const lower = cleaned.toLowerCase();
  if (
    lower.startsWith('http://') ||
    lower.startsWith('https://') ||
    lower.startsWith('ftp://') ||
    lower.startsWith('www.') ||
    /^[a-zA-Z0-9-]+\.[a-zA-Z]{2,}(\/.*)?$/.test(cleaned)
  ) {
    return 'url';
  }
  if (lower.startsWith('tel:') || /^(\+?[0-9\s\-()]{7,20})$/.test(cleaned)) {
    return 'phone';
  }
  if (cleaned.toUpperCase().startsWith('WIFI:')) {
    return 'wifi';
  }
  return 'text';
}

/**
 * Convert any image buffer to PNG via ffmpeg pipe as a reliable fallback
 */
function convertToPngWithFfmpeg(buffer: Buffer): Promise<Buffer | null> {
  return new Promise((resolve) => {
    try {
      const proc = spawn('ffmpeg', ['-i', 'pipe:0', '-f', 'image2', '-c:v', 'png', 'pipe:1'], {
        stdio: ['pipe', 'pipe', 'ignore'],
      });

      const chunks: Buffer[] = [];
      proc.stdout.on('data', (chunk) => chunks.push(chunk));
      proc.on('close', (code) => {
        if (code === 0 && chunks.length > 0) {
          resolve(Buffer.concat(chunks));
        } else {
          resolve(null);
        }
      });
      proc.on('error', () => resolve(null));

      proc.stdin.write(buffer);
      proc.stdin.end();
    } catch {
      resolve(null);
    }
  });
}

/**
 * Decode QR codes from image bytes/Buffer.
 * Returns array of: { data: string, kind: 'url' | 'phone' | 'wifi' | 'text' }
 * Handles no-QR, blurry, or invalid images by returning [] and never raising.
 */
export async function decode_qr_codes(imageBuffer: Buffer): Promise<DecodedQrCode[]> {
  if (!imageBuffer || !Buffer.isBuffer(imageBuffer) || imageBuffer.length === 0) {
    return [];
  }

  const results: DecodedQrCode[] = [];
  const seen = new Set<string>();

  const addCode = (dataStr: string) => {
    const trimmed = (dataStr || '').trim();
    if (trimmed && !seen.has(trimmed)) {
      seen.add(trimmed);
      results.push({
        data: trimmed,
        kind: classifyQrKind(trimmed),
      });
    }
  };

  // 1. Try decoding as PNG directly
  try {
    const png = PNG.sync.read(imageBuffer);
    if (png && png.width && png.height && png.data) {
      const code = jsQR(new Uint8ClampedArray(png.data), png.width, png.height);
      if (code && code.data) {
        addCode(code.data);
      }
    }
  } catch {
    // Ignore, try next format
  }

  // 2. If nothing found, try decoding as JPEG directly
  if (results.length === 0) {
    try {
      const jpegData = jpeg.decode(imageBuffer, { useTArray: true });
      if (jpegData && jpegData.width && jpegData.height && jpegData.data) {
        const code = jsQR(new Uint8ClampedArray(jpegData.data), jpegData.width, jpegData.height);
        if (code && code.data) {
          addCode(code.data);
        }
      }
    } catch {
      // Ignore, try next format
    }
  }

  // 3. If still nothing found, use ffmpeg to normalize format (handles WebP, HEIC, TIFF, unusual color spaces)
  if (results.length === 0) {
    try {
      const normalizedPng = await convertToPngWithFfmpeg(imageBuffer);
      if (normalizedPng) {
        const png = PNG.sync.read(normalizedPng);
        if (png && png.width && png.height && png.data) {
          const code = jsQR(new Uint8ClampedArray(png.data), png.width, png.height);
          if (code && code.data) {
            addCode(code.data);
          }
        }
      }
    } catch {
      // Fallback failed quietly
    }
  }

  return results;
}
