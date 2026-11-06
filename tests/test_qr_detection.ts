import { decode_qr_codes, classifyQrKind } from '../server/qr_utils.ts';
import { runDeterministicGuardrail } from '../server/guardrail.ts';

async function runTests() {
  console.log('--- 1. Testing classifyQrKind ---');
  console.assert(classifyQrKind('https://example.com/test') === 'url', 'URL test failed');
  console.assert(classifyQrKind('bit.ly/malicious-link') === 'url', 'Shortener URL test failed');
  console.assert(classifyQrKind('tel:+212612345678') === 'phone', 'tel: test failed');
  console.assert(classifyQrKind('+212 612 345678') === 'phone', 'Raw phone test failed');
  console.assert(classifyQrKind('WIFI:S:MyWifi;T:WPA;P:secret;;') === 'wifi', 'WiFi test failed');
  console.assert(classifyQrKind('Plain text message here') === 'text', 'Text test failed');
  console.log('✓ classifyQrKind all passed');

  console.log('--- 2. Testing decode_qr_codes robustness ---');
  const emptyRes = await decode_qr_codes(Buffer.alloc(0));
  console.assert(Array.isArray(emptyRes) && emptyRes.length === 0, 'Empty buffer should return []');

  const randomRes = await decode_qr_codes(Buffer.from('not an image data at all'));
  console.assert(Array.isArray(randomRes) && randomRes.length === 0, 'Random invalid buffer should return []');
  console.log('✓ decode_qr_codes robustness tests passed');

  console.log('--- 3. Testing Guardrail with QR Code Escalation ---');

  // Test 3a: QR with shortener alone -> at least suspicious
  const g1 = runDeterministicGuardrail('Hello please check this out\n\nQR code found in image: bit.ly/docs39');
  if (g1.verdict !== 'suspicious') {
    throw new Error(`Expected suspicious for QR shortener, got: ${g1.verdict} (rules: ${g1.triggered_rules})`);
  }
  if (!g1.triggered_rules.some(r => r.includes('RULE_QR_SUSPICIOUS') || r.includes('RULE_SHORTLINK'))) {
    throw new Error('RULE_QR_SUSPICIOUS or RULE_SHORTLINK should trigger');
  }

  // Test 3b: QR with shortener + payment/fee request -> SCAM
  const g2 = runDeterministicGuardrail('Veuillez payer les frais de dossier de 15 DH\n\nQR code found in image: bit.ly/colis-maroc');
  if (g2.verdict !== 'scam') {
    throw new Error(`Expected scam for QR shortener + payment, got: ${g2.verdict}`);
  }

  // Test 3c: QR with IP address alone -> at least suspicious
  const g3 = runDeterministicGuardrail('Information importante\n\nQR code found in image: http://192.168.1.100/login');
  if (g3.verdict !== 'suspicious') {
    throw new Error(`Expected suspicious for QR IP, got: ${g3.verdict}`);
  }

  // Test 3d: QR with Moroccan brand lookalike alone -> at least suspicious
  const g4 = runDeterministicGuardrail('Actualisation dossier\n\nQR code found in image: https://cnss-maroc-espace.com/portal');
  if (g4.verdict !== 'suspicious') {
    throw new Error(`Expected suspicious for brand lookalike, got: ${g4.verdict}`);
  }

  // Test 3e: QR with Moroccan brand lookalike + CIN request -> SCAM
  const g5 = runDeterministicGuardrail('Entrez votre CIN pour valider votre compte\n\nQR code found in image: https://amana-suivi-colis.xyz');
  if (g5.verdict !== 'scam') {
    throw new Error(`Expected scam for brand lookalike + CIN, got: ${g5.verdict}`);
  }

  // Test 3f: Message asking to scan for prize -> suspicious
  const g6 = runDeterministicGuardrail('Scannez ce code pour recevoir votre lot.\n\nQR code found in image: https://mysite.com');
  if (g6.verdict !== 'suspicious') {
    throw new Error(`Expected suspicious for scan for prize, got: ${g6.verdict}`);
  }

  // Test 3g: Benign message without QR -> safe
  const g7 = runDeterministicGuardrail('Salut, dispo pour le déjeuner à 13h ?');
  if (g7.verdict !== 'safe') {
    throw new Error(`Expected safe for normal conversation, got: ${g7.verdict}`);
  }

  console.log('--- 4. Testing Real QR Code Generation & End-to-End Decoding ---');
  const QRCode = (await import('qrcode')).default;
  const testUrl = 'https://amana.ma/suivi/colis-12345';
  const pngBuffer = await QRCode.toBuffer(testUrl);
  const detected = await decode_qr_codes(pngBuffer);
  if (detected.length !== 1 || detected[0].data !== testUrl || detected[0].kind !== 'url') {
    throw new Error(`Real QR test failed: ${JSON.stringify(detected)}`);
  }
  console.log('✓ Real QR generation & decoding passed: ' + detected[0].data);

  console.log('✓ Guardrail QR rules tests passed');
  console.log('ALL TESTS COMPLETED SUCCESSFULLY!');
}

runTests().catch(err => {
  console.error('Test failure:', err);
  process.exit(1);
});
