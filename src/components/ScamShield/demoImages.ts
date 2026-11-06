/**
 * Demo images generator for Kashif Pay Scam Shield
 * Generates trapped QR code, legitimate merchant QR code, and Avito WhatsApp fake buyer screenshot
 * purely client-side without network requests or heavy external dependencies.
 */

import QRCode from 'qrcode';

export const DEMO_TRAPPED_QR_URL = 'http://cih-securite-paiement.example/pay?ref=48213';
export const DEMO_LEGIT_QR_PAYLOAD = 'Marché Central - Epicerie Hassan - Commande #4829 - Montant: 65.00 DHS';

/**
 * Utility to convert DataURL to File object
 */
export function dataURLtoFile(dataurl: string, filename: string): File {
  const arr = dataurl.split(',');
  const mimeMatch = arr[0].match(/:(.*?);/);
  const mime = mimeMatch ? mimeMatch[1] : 'image/png';
  const bstr = atob(arr[1]);
  let n = bstr.length;
  const u8arr = new Uint8Array(n);
  while (n--) {
    u8arr[n] = bstr.charCodeAt(n);
  }
  return new File([u8arr], filename, { type: mime });
}

/**
 * Helper to draw rounded rectangle on canvas context
 */
function drawRoundRect(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  h: number,
  radius: number
) {
  ctx.beginPath();
  ctx.moveTo(x + radius, y);
  ctx.lineTo(x + w - radius, y);
  ctx.quadraticCurveTo(x + w, y, x + w, y + radius);
  ctx.lineTo(x + w, y + h - radius);
  ctx.quadraticCurveTo(x + w, y + h, x + w - radius, y + h);
  ctx.lineTo(x + radius, y + h);
  ctx.quadraticCurveTo(x, y + h, x, y + h - radius);
  ctx.lineTo(x, y + radius);
  ctx.quadraticCurveTo(x, y, x + radius, y);
  ctx.closePath();
}

/**
 * Generates the WhatsApp-style screenshot of a fake Avito buyer overpayment scam
 * Combines French and Darija (arabizi), with fictional names, numbers and .example domains.
 */
export function generateAvitoChatScreenshot(): { dataUrl: string; file: File } {
  const canvas = document.createElement('canvas');
  canvas.width = 640;
  canvas.height = 820;
  const ctx = canvas.getContext('2d');
  if (!ctx) {
    throw new Error('Canvas 2D context not available');
  }

  // 1. Background (WhatsApp chat parchment)
  ctx.fillStyle = '#ECE5DD';
  ctx.fillRect(0, 0, 640, 820);

  // Subtle background pattern dots
  ctx.fillStyle = 'rgba(0, 0, 0, 0.02)';
  for (let x = 10; x < 640; x += 30) {
    for (let y = 80; y < 760; y += 30) {
      ctx.beginPath();
      ctx.arc(x, y, 1.5, 0, Math.PI * 2);
      ctx.fill();
    }
  }

  // 2. WhatsApp Top App Bar
  ctx.fillStyle = '#075E54';
  ctx.fillRect(0, 0, 640, 72);

  // Left arrow
  ctx.strokeStyle = '#FFFFFF';
  ctx.lineWidth = 2.5;
  ctx.lineCap = 'round';
  ctx.beginPath();
  ctx.moveTo(24, 36);
  ctx.lineTo(14, 36);
  ctx.moveTo(18, 30);
  ctx.lineTo(13, 36);
  ctx.lineTo(18, 42);
  ctx.stroke();

  // Contact Avatar circle
  ctx.beginPath();
  ctx.arc(48, 36, 20, 0, Math.PI * 2);
  ctx.fillStyle = '#128C7E';
  ctx.fill();
  ctx.fillStyle = '#FFFFFF';
  ctx.font = 'bold 15px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';
  ctx.textAlign = 'center';
  ctx.fillText('AV', 48, 42);

  // Contact Details
  ctx.textAlign = 'left';
  ctx.font = 'bold 16px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';
  ctx.fillStyle = '#FFFFFF';
  ctx.fillText('+212 600-001122 (Acheteur Avito)', 80, 34);
  ctx.font = '12px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';
  ctx.fillStyle = '#A7F3D0';
  ctx.fillText('En ligne', 80, 54);

  // Right icons (Phone & 3 dots)
  ctx.fillStyle = '#FFFFFF';
  ctx.beginPath();
  ctx.arc(580, 36, 2.5, 0, Math.PI * 2);
  ctx.arc(580, 26, 2.5, 0, Math.PI * 2);
  ctx.arc(580, 46, 2.5, 0, Math.PI * 2);
  ctx.fill();

  // 3. Date Pill
  ctx.fillStyle = '#FCF4CB';
  drawRoundRect(ctx, 240, 86, 160, 26, 13);
  ctx.fill();
  ctx.fillStyle = '#4B5563';
  ctx.font = '600 11px sans-serif';
  ctx.textAlign = 'center';
  ctx.fillText("Aujourd'hui", 320, 103);

  // 4. Message 1 (Incoming text)
  ctx.textAlign = 'left';
  ctx.fillStyle = '#FFFFFF';
  drawRoundRect(ctx, 24, 126, 460, 62, 12);
  ctx.fill();
  ctx.fillStyle = '#1F2937';
  ctx.font = '14.5px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';
  ctx.fillText('Salam khoya, 3jebni l-article dialek f Avito.', 40, 150);
  ctx.fillText('Sifett lik virement daba.', 40, 172);
  ctx.fillStyle = '#9CA3AF';
  ctx.font = '10.5px sans-serif';
  ctx.textAlign = 'right';
  ctx.fillText('14:28', 472, 178);

  // 5. Message 2 (Incoming fake receipt card image)
  ctx.textAlign = 'left';
  ctx.fillStyle = '#FFFFFF';
  drawRoundRect(ctx, 24, 200, 480, 224, 12);
  ctx.fill();

  // Inner receipt card box
  ctx.fillStyle = '#F8FAFC';
  drawRoundRect(ctx, 38, 214, 452, 196, 8);
  ctx.fill();
  ctx.strokeStyle = '#E2E8F0';
  ctx.lineWidth = 1.5;
  ctx.stroke();

  // Receipt header
  ctx.fillStyle = '#047857';
  ctx.font = 'bold 13px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';
  ctx.fillText('REÇU DE VIREMENT INSTANTANÉ - WAFACASH', 54, 238);

  // Receipt Amount
  ctx.fillStyle = '#0F172A';
  ctx.font = 'bold 24px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';
  ctx.fillText('1 500,00 DH', 54, 274);

  // Receipt metadata
  ctx.fillStyle = '#334155';
  ctx.font = '12.5px sans-serif';
  ctx.fillText('Bénéficiaire : Vendeur Avito MA', 54, 302);
  ctx.fillText('Réf. Transaction : VIR-98214-MA', 54, 324);
  ctx.fillText('Statut : Validé (En attente confirmation)', 54, 346);

  // Error alert banner inside receipt
  ctx.fillStyle = '#FEF2F2';
  drawRoundRect(ctx, 50, 362, 428, 34, 6);
  ctx.fill();
  ctx.fillStyle = '#DC2626';
  ctx.font = 'bold 11px sans-serif';
  ctx.fillText('⚠️ ERREUR DE MONTANT SIGNALÉE PAR L’ÉMETTEUR (SURPAYÉ)', 60, 383);

  // 6. Message 3 (Darija explanation of overpayment error)
  ctx.fillStyle = '#FFFFFF';
  drawRoundRect(ctx, 24, 436, 540, 76, 12);
  ctx.fill();
  ctx.fillStyle = '#1F2937';
  ctx.font = '14px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';
  ctx.fillText('Khoya smeh lia bzaf! L-prix kan ghir 1 000 DH o dert erreur', 40, 460);
  ctx.fillText('de montant f l-virement, sift lik 1 500 DH. Trop-perçu de 500 DH.', 40, 483);
  ctx.fillStyle = '#9CA3AF';
  ctx.font = '10.5px sans-serif';
  ctx.textAlign = 'right';
  ctx.fillText('14:30', 552, 500);

  // 7. Message 4 (Urgency to refund via Cash Plus or Wafacash)
  ctx.textAlign = 'left';
  ctx.fillStyle = '#FFFFFF';
  drawRoundRect(ctx, 24, 524, 540, 76, 12);
  ctx.fill();
  ctx.fillStyle = '#1F2937';
  ctx.font = '14px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';
  ctx.fillText('3afak sift lia 500 DH l-ferq b Cash Plus ola Wafacash dghya', 40, 548);
  ctx.fillText('daba avant ma ytbloqa l-virement 3afak!', 40, 571);
  ctx.fillStyle = '#9CA3AF';
  ctx.font = '10.5px sans-serif';
  ctx.textAlign = 'right';
  ctx.fillText('14:31', 552, 588);

  // 8. Simulated WhatsApp input bar at bottom
  ctx.fillStyle = '#F0F2F5';
  ctx.fillRect(0, 750, 640, 70);
  ctx.fillStyle = '#FFFFFF';
  drawRoundRect(ctx, 16, 762, 530, 46, 23);
  ctx.fill();
  ctx.fillStyle = '#9CA3AF';
  ctx.font = '14px sans-serif';
  ctx.textAlign = 'left';
  ctx.fillText('Message', 40, 790);

  // Mic button
  ctx.beginPath();
  ctx.arc(585, 785, 23, 0, Math.PI * 2);
  ctx.fillStyle = '#075E54';
  ctx.fill();
  ctx.fillStyle = '#FFFFFF';
  ctx.font = '16px sans-serif';
  ctx.textAlign = 'center';
  ctx.fillText('🎤', 585, 791);

  const dataUrl = canvas.toDataURL('image/png');
  const file = dataURLtoFile(dataUrl, 'capture_avito_faux_virement.png');
  return { dataUrl, file };
}

/**
 * Generates the trapped bank lookalike QR code
 */
export async function generateTrappedQr(): Promise<{ dataUrl: string; file: File; payload: string }> {
  const dataUrl = await QRCode.toDataURL(DEMO_TRAPPED_QR_URL, {
    width: 400,
    margin: 2,
    color: {
      dark: '#161824',
      light: '#FFFFFF',
    },
    errorCorrectionLevel: 'M',
  });
  const file = dataURLtoFile(dataUrl, 'qr_paiement_piege_cih.png');
  return { dataUrl, file, payload: DEMO_TRAPPED_QR_URL };
}

/**
 * Generates the legitimate neutral merchant payment QR code
 */
export async function generateLegitQr(): Promise<{ dataUrl: string; file: File; payload: string }> {
  const dataUrl = await QRCode.toDataURL(DEMO_LEGIT_QR_PAYLOAD, {
    width: 400,
    margin: 2,
    color: {
      dark: '#161824',
      light: '#FFFFFF',
    },
    errorCorrectionLevel: 'M',
  });
  const file = dataURLtoFile(dataUrl, 'qr_paiement_legitime_epicerie.png');
  return { dataUrl, file, payload: DEMO_LEGIT_QR_PAYLOAD };
}
