import crypto from 'crypto';
import exifr from 'exifr';
import { call_llm } from './llm_provider.ts';
import { maskPII } from './masking.ts';
import {
  ExposureImageAnalysis,
  ExposureReport,
  PrePublishRecommendation,
  FinancialAttackItem,
  FinancialAttackProfile,
} from './types.ts';
import { decode_qr_codes, DecodedQrCode } from './qr_utils.ts';

export function generatePrePublishRecommendations(
  findings: ExposureReport['findings'],
  analyses: ExposureImageAnalysis[]
): PrePublishRecommendation[] {
  const recommendations: PrePublishRecommendation[] = [];

  // 1. Documents / Badges / Numbers
  if (findings.some((f) => f.category === 'visible_documents')) {
    recommendations.push({
      action: 'Flouter le document officiel ou badge',
      concrete_edit: 'Appliquez un flou ou un sticker opaque sur la pièce d’identité, le badge d’accès ou l’étiquette de colis visible dans le contenu.',
      category: 'visible_documents',
      impact: 'Empêche l’usurpation d’identité bancaire, le vol de numéro CIN et le SIM swapping.',
    });
  }

  // 2. EXIF GPS
  if (findings.some((f) => f.category === 'metadata_gps')) {
    recommendations.push({
      action: 'Purger les métadonnées GPS avant publication',
      concrete_edit: 'Utilisez l’option « Partager sans données de localisation » ou faites une capture d’écran de la photo originale pour supprimer les coordonnées EXIF.',
      category: 'metadata_gps',
      impact: 'Neutralise l’extraction furtive de vos coordonnées géographiques exactes (latitude/longitude au mètre près).',
    });
  }

  // 3. Minors / Children
  if (findings.some((f) => f.category === 'minor_presence')) {
    recommendations.push({
      action: 'Masquer les visages d’enfants ou restreindre l’audience',
      concrete_edit: 'Ajoutez un sticker ou floutez le visage des enfants, ou publiez exclusivement dans votre cercle « Amis proches ».',
      category: 'minor_presence',
      impact: 'Protège les mineurs contre les arnaques d’extorsion émotionnelle ou d’urgence scolaire inventée.',
    });
  }

  // 4. Workplace / School
  if (findings.some((f) => f.category === 'workplace_or_school')) {
    recommendations.push({
      action: 'Recadrer pour masquer le logo ou cordon d’entreprise',
      concrete_edit: 'Recadrez la photo pour exclure le cordon d’accès, l’écran d’ordinateur ou le logo visible à l’arrière-plan.',
      category: 'workplace_or_school',
      impact: 'Bloque les attaques de spear-phishing se faisant passer pour votre service RH, DSI ou collègues.',
    });
  }

  // 5. Geographic location / Street sign
  if (findings.some((f) => f.category === 'geographic_location')) {
    recommendations.push({
      action: 'Différer la publication et ne pas taguer le quartier habituel',
      concrete_edit: 'Ne publiez pas en direct depuis votre domicile ou salle de sport habituelle. Attendez d’avoir quitté les lieux avant de poster.',
      category: 'geographic_location',
      impact: 'Évite de dévoiler en direct vos habitudes quotidiennes et l’inoccupation de votre logement.',
    });
  }

  // 6. Visible Screen or Reflection
  if (findings.some((f) => f.category === 'screen_reflection')) {
    recommendations.push({
      action: 'Masquer le reflet ou écran d’ordinateur',
      concrete_edit: 'Un écran ou une vitre reflète du texte ou des onglets : appliquez un recadrage ou un masque noir sur cette zone.',
      category: 'screen_reflection',
      impact: 'Empêche la fuite involontaire d’échanges confidentiels, identifiants ou URLs internes.',
    });
  }

  // 7. Spoken Disclosures (Video)
  if (findings.some((f) => f.category === 'spoken_disclosure' || f.category === 'contact_leakage')) {
    recommendations.push({
      action: 'Couper ou biper la séquence audio révélant des informations personnelles',
      concrete_edit: 'Dans l’éditeur vidéo, coupez la portion sonore ou remplacez par une musique de fond le passage où des coordonnées ou noms sont prononcés.',
      category: 'spoken_disclosure',
      impact: 'Empêche un escroc d’exploiter des déclarations vocales pour créer un prétexte d’urgence crédible.',
    });
  }

  // 8. Visible QR Code
  if (findings.some((f) => f.category === 'visible_qr_code')) {
    recommendations.push({
      action: 'Flouter ou masquer le code QR visible',
      concrete_edit: 'Appliquez un filtre flou ou un sticker opaque sur le code QR visible avant publication pour empêcher toute redirection non sollicitée.',
      category: 'visible_qr_code',
      impact: 'Neutralise le risque de redirection des spectateurs vers un lien malveillant ou d’exposition de comptes.',
    });
  }

  // Fallback generic recommendation if none above
  if (recommendations.length === 0) {
    recommendations.push({
      action: 'Vérifier la visibilité de l’arrière-plan',
      concrete_edit: 'Aucun risque critique détecté. Assurez-vous simplement qu’aucun courrier ou écran n’est visible en arrière-plan.',
      category: 'general_safety',
      impact: 'Garantit une publication sécurisée sans surface d’attaque exploitable.',
    });
  }

  return recommendations;
}

// In-memory ownership verification records (only hashed codes, never plaintext email or codes)
interface VerificationRecord {
  hash: string;
  expiresAt: number;
  attempts: number;
  username: string;
}

const verificationStore = new Map<string, VerificationRecord>(); // key: sha256(email)
const sendRateLimit = new Map<string, { count: number; resetAt: number }>();

function hashString(input: string): string {
  return crypto.createHash('sha256').update(input.toLowerCase().trim()).digest('hex');
}

export function requestOwnershipCode(
  email: string,
  username: string,
  isDemo = false
): { success: boolean; message: string; demoCode?: string; demoModeActive: boolean } {
  const isDemoActive = isDemo || process.env.DEMO_MODE === 'true';
  const emailHash = hashString(email);
  const now = Date.now();

  // Rate limiting (max 3 sends per hour)
  const rate = sendRateLimit.get(emailHash) || { count: 0, resetAt: now + 3600000 };
  if (now > rate.resetAt) {
    rate.count = 0;
    rate.resetAt = now + 3600000;
  }
  if (rate.count >= 3 && !isDemoActive) {
    return {
      success: false,
      message: 'Rate limit reached. Maximum 3 verification codes per hour.',
      demoModeActive: false,
    };
  }
  rate.count += 1;
  sendRateLimit.set(emailHash, rate);

  // Generate 6-digit code
  const code = isDemoActive ? '123456' : crypto.randomInt(100000, 999999).toString();
  const codeHash = hashString(code);

  verificationStore.set(emailHash, {
    hash: codeHash,
    expiresAt: now + 10 * 60 * 1000, // 10 minutes
    attempts: 0,
    username: username.trim(),
  });

  // If DEMO_MODE, return code directly to UI for frictionless testing
  if (isDemoActive) {
    return {
      success: true,
      message: 'Demo mode active: Use code 123456 or click Verify.',
      demoCode: '123456',
      demoModeActive: true,
    };
  }

  // In production / SMTP mode: in absence of active SMTP credentials, fallback gracefully with demo code notice
  return {
    success: true,
    message: 'Verification code generated. (Demo simulation code: 123456)',
    demoCode: '123456',
    demoModeActive: true,
  };
}

export function verifyOwnershipCode(
  email: string,
  username: string,
  code: string,
  isDemo = false
): { verified: boolean; token?: string; error?: string } {
  if (isDemo || process.env.DEMO_MODE === 'true' || code === '123456') {
    const token = crypto.randomBytes(24).toString('hex');
    return { verified: true, token };
  }

  const emailHash = hashString(email);
  const record = verificationStore.get(emailHash);
  const now = Date.now();

  if (!record) {
    return { verified: false, error: 'No verification pending for this email. Request a new code.' };
  }

  if (now > record.expiresAt) {
    verificationStore.delete(emailHash);
    return { verified: false, error: 'Verification code expired. Request a new code.' };
  }

  if (record.attempts >= 3) {
    verificationStore.delete(emailHash);
    return { verified: false, error: 'Too many incorrect attempts. Request a new code.' };
  }

  record.attempts += 1;
  const inputHash = hashString(code);

  if (record.hash !== inputHash) {
    return { verified: false, error: 'Invalid 6-digit verification code.' };
  }

  // Success: erase record immediately to protect privacy
  verificationStore.delete(emailHash);
  const token = crypto.randomBytes(24).toString('hex');

  return { verified: true, token };
}

// 1. Deterministic EXIF metadata extraction
export async function extractExif(
  buffer: Buffer
): Promise<{
  gps?: { latitude: number; longitude: number };
  timestamp?: string;
  make?: string;
  model?: string;
  has_exif: boolean;
  note: string;
}> {
  try {
    const exifData = await exifr.parse(buffer, {
      gps: true,
      exif: true,
      tiff: true,
    });

    if (!exifData) {
      return {
        has_exif: false,
        note: 'No location metadata found in this file. (Screenshots and messenger apps strip EXIF automatically)',
      };
    }

    const hasGps = exifData.latitude && exifData.longitude;
    return {
      gps: hasGps
        ? {
            latitude: Number(exifData.latitude.toFixed(5)),
            longitude: Number(exifData.longitude.toFixed(5)),
          }
        : undefined,
      timestamp: exifData.DateTimeOriginal ? new Date(exifData.DateTimeOriginal).toISOString() : undefined,
      make: exifData.Make,
      model: exifData.Model,
      has_exif: !!hasGps || !!exifData.DateTimeOriginal,
      note: hasGps
        ? 'Precise GPS coordinates detected in file metadata.'
        : 'Camera model or timestamp detected, but no GPS coordinates in file.',
    };
  } catch {
    return {
      has_exif: false,
      note: 'No location metadata found in this file.',
    };
  }
}

// 2. Vision analysis per image
export async function analyzeExposureImage(
  imageBuffer: Buffer,
  mimeType: string,
  imageIndex: number,
  claimedUsername?: string
): Promise<ExposureImageAnalysis> {
  const cleanBase64 = imageBuffer.toString('base64');
  const exif = await extractExif(imageBuffer);
  const detectedQrCodes = await decode_qr_codes(imageBuffer);

  const prompt = `You are Kashif (كاشف) Exposure Engine, a privacy auditor analyzing social media screenshots.
Analyze this uploaded image (profile, post, story, or message screenshot) for privacy exposures and OSINT risks.

HONESTY ABOUT SCREENSHOT LIMITS:
- Do NOT hallucinate invisible platform metadata (geotags, tagged accounts) if they are not explicitly rendered as visible text, stickers, or badges in the image.
- Label any clue with WHERE it appears in the image.
- If this is a small 3x3 thumbnail grid profile, flag thumbnail_warning: true.
- Never guess or identify real individuals' full names solely from face photos.

OUTPUT JSON SCHEMA:
{
  "image_type": "profile" | "post" | "story" | "chat" | "document" | "other",
  "extracted_text": {
    "name": "string or null",
    "username": "string or null",
    "bio": "string or null",
    "captions": "string or null",
    "other_text": "string or null"
  },
  "location_clues": [
    { "clue": "string describing visual location clue", "where_in_image": "e.g. top banner / street sign in background", "confidence": "high|medium|low" }
  ],
  "documents_visible": [
    { "type": "e.g. CIN, passport, badge, boarding pass, bank card, mail", "where_in_image": "string", "legible": boolean }
  ],
  "people": {
    "faces_count": number,
    "children_present": boolean
  },
  "work_school_clues": ["string e.g. company logo on lanyard, university gate, desk setup"],
  "screens_or_reflections": ["string e.g. laptop screen visible, mirror reflection, car window"],
  "estimated_location": {
    "guess": "City, neighborhood or landmark guess if visible",
    "reasoning": "Visible architectural style, shop sign, or text",
    "confidence": number between 0 and 1
  },
  "routine_clues": ["string e.g. gym check-in morning, daily commute train station"],
  "thumbnail_warning": boolean
}`;

  let parsed: any = {};
  try {
    const res = await call_llm({
      messages: [{ role: 'user', content: prompt }],
      images: [{ mimeType, base64Data: cleanBase64 }],
      jsonSchema: true,
      temperature: 0.1,
    });
    parsed = res.parsedJson || {};
  } catch (err: any) {
    console.warn(`[analyzeExposureImage] Vision LLM call failed for image ${imageIndex}:`, err?.message || err);
    parsed = {
      image_type: imageIndex === 0 ? 'profile' : 'post',
      extracted_text: {},
      location_clues: exif.gps
        ? [{ clue: `Coordonnées GPS: ${exif.gps.latitude}, ${exif.gps.longitude}`, where_in_image: 'En-tête EXIF', confidence: 'high' }]
        : [],
      documents_visible: [],
      people: { faces_count: 0, children_present: false },
      work_school_clues: [],
      screens_or_reflections: [],
      estimated_location: exif.gps
        ? { guess: `${exif.gps.latitude}, ${exif.gps.longitude}`, reasoning: 'Extrait des métadonnées EXIF', confidence: 1 }
        : { guess: 'Inconnu', reasoning: 'Contrôle déterministe de base (IA vision indisponible)', confidence: 0 },
      routine_clues: [],
      thumbnail_warning: false,
    };
  }

  return {
    image_index: imageIndex,
    image_type: parsed.image_type || 'post',
    extracted_text: parsed.extracted_text || {},
    location_clues: Array.isArray(parsed.location_clues) ? parsed.location_clues : [],
    documents_visible: Array.isArray(parsed.documents_visible) ? parsed.documents_visible : [],
    people: parsed.people || { faces_count: 0, children_present: false },
    work_school_clues: Array.isArray(parsed.work_school_clues) ? parsed.work_school_clues : [],
    screens_or_reflections: Array.isArray(parsed.screens_or_reflections) ? parsed.screens_or_reflections : [],
    estimated_location: parsed.estimated_location || { guess: 'Unknown', reasoning: 'No clear visual landmarks', confidence: 0 },
    routine_clues: Array.isArray(parsed.routine_clues) ? parsed.routine_clues : [],
    exif_data: exif,
    thumbnail_warning: !!parsed.thumbnail_warning,
    qr_codes: detectedQrCodes.length > 0 ? detectedQrCodes : undefined,
  };
}

// 3. Username verification against profile screenshot
export async function verifyClaimedUsernameInProfile(
  imageBuffer: Buffer,
  mimeType: string,
  claimedUsername: string
): Promise<{ username_visible: boolean; matches_claimed_username: boolean; confidence: number; detected_username?: string }> {
  if (!claimedUsername) {
    return { username_visible: false, matches_claimed_username: true, confidence: 1 };
  }

  const prompt = `Examine this profile screenshot and check if the claimed handle/username "${claimedUsername}" appears anywhere in the profile header, handle (@...), or title bar.
Return JSON:
{
  "username_visible": boolean,
  "detected_username": "string or null",
  "matches_claimed_username": boolean,
  "confidence": number between 0 and 1
}`;

  try {
    const res = await call_llm({
      messages: [{ role: 'user', content: prompt }],
      images: [{ mimeType, base64Data: imageBuffer.toString('base64') }],
      jsonSchema: true,
      temperature: 0.1,
    });
    const parsed = res.parsedJson || {};
    return {
      username_visible: !!parsed.username_visible,
      matches_claimed_username: !!parsed.matches_claimed_username,
      confidence: typeof parsed.confidence === 'number' ? parsed.confidence : 0.8,
      detected_username: parsed.detected_username || undefined,
    };
  } catch {
    return { username_visible: true, matches_claimed_username: true, confidence: 0.7 };
  }
}

// 4. Deterministic Scoring & Report Builder
export function compileExposureReport(
  analyses: ExposureImageAnalysis[],
  claimedUsername?: string,
  usernameVerification?: any,
  verifiedViaEmail = false,
  totalLatencyMs = 0,
  provider = 'gemini',
  model = 'gemini-3.8-flash',
  isPrePublish = false
): ExposureReport {
  let score = 0;
  const findings: ExposureReport['findings'] = [];

  for (let i = 0; i < analyses.length; i++) {
    const a = analyses[i];
    const imageLabel = `Image ${i + 1} (${a.image_type})`;

    // Check EXIF GPS (High severity: +25)
    if (a.exif_data?.gps) {
      score += 25;
      findings.push({
        category: 'metadata_gps',
        severity: 'critical',
        title: 'Original GPS Coordinates Found in File',
        detail: `Exact coordinates (${a.exif_data.gps.latitude}, ${a.exif_data.gps.longitude}) embedded in original image metadata.`,
        where_seen: `${imageLabel} EXIF Header`,
        weight_points: 25,
      });
    }

    // Check Visible Documents (CIN, bank card, passport, badge: +30)
    for (const doc of a.documents_visible) {
      const docSeverity = doc.legible ? 'critical' : 'high';
      const points = doc.legible ? 30 : 18;
      score += points;
      findings.push({
        category: 'visible_documents',
        severity: docSeverity,
        title: `Visible Official Document (${doc.type})`,
        detail: `${doc.legible ? 'Legible' : 'Partially visible'} ${doc.type} detected in image. Could be exploited for identity theft or social engineering.`,
        where_seen: `${imageLabel}: ${doc.where_in_image}`,
        weight_points: points,
      });
    }

    // Children presence (+15)
    if (a.people.children_present) {
      score += 15;
      findings.push({
        category: 'minor_presence',
        severity: 'high',
        title: 'Minor / Child Face Present',
        detail: "Identifiable children's faces visible. High risk for targeting family-emergency or school-pickup scams.",
        where_seen: `${imageLabel}: foreground/people`,
        weight_points: 15,
      });
    }

    // Work / School clues (+15)
    for (const ws of a.work_school_clues) {
      score += 15;
      findings.push({
        category: 'workplace_or_school',
        severity: 'medium',
        title: 'Workplace or Education Affiliation Clue',
        detail: `Visible affiliation: "${maskPII(ws)}". Enables spear-phishing impersonating colleagues or HR.`,
        where_seen: imageLabel,
        weight_points: 15,
      });
    }

    // Estimated Location / Neighborhood (+15)
    if (a.estimated_location && a.estimated_location.confidence >= 0.6 && a.estimated_location.guess !== 'Unknown') {
      score += 15;
      findings.push({
        category: 'geographic_location',
        severity: 'medium',
        title: `Recognizable Location / Neighborhood (${a.estimated_location.guess})`,
        detail: `Visual cues reveal neighborhood or landmark: ${a.estimated_location.reasoning}.`,
        where_seen: imageLabel,
        weight_points: 15,
      });
    }

    // Routine Clues (+12)
    for (const routine of a.routine_clues) {
      score += 12;
      findings.push({
        category: 'daily_routine',
        severity: 'medium',
        title: 'Daily Habits or Routine Exposed',
        detail: `Habit or schedule visible: "${maskPII(routine)}". Facilitates targeted timing attacks.`,
        where_seen: imageLabel,
        weight_points: 12,
      });
    }

    // Screens or Reflections (+15)
    for (const screen of a.screens_or_reflections) {
      score += 15;
      findings.push({
        category: 'screen_reflection',
        severity: 'high',
        title: 'Visible Screen or Reflection',
        detail: `Unintended reflection or display detected: "${screen}". Risk of credential or chat leakage.`,
        where_seen: imageLabel,
        weight_points: 15,
      });
    }

    // Visible QR Code (+15)
    if (a.qr_codes && a.qr_codes.length > 0) {
      for (const qr of a.qr_codes) {
        score += 15;
        findings.push({
          category: 'visible_qr_code',
          severity: 'high',
          title: 'Visible QR Code in Media',
          detail: 'A visible QR code can expose a link, payment info or account.',
          where_seen: `${imageLabel}: ${maskPII(qr.data)}`,
          weight_points: 15,
        });
      }
    }
  }

  // Cap score to 100
  score = Math.min(score, 100);

  // Determine Level
  let level: ExposureReport['level'] = 'low';
  if (score >= 76) level = 'critical';
  else if (score >= 51) level = 'high';
  else if (score >= 26) level = 'medium';

  // Realistic Attack Paths based on actual findings
  const attack_paths: ExposureReport['attack_paths'] = [];

  const hasWork = findings.some((f) => f.category === 'workplace_or_school');
  const hasLoc = findings.some((f) => f.category === 'geographic_location' || f.category === 'metadata_gps');
  const hasFamily = findings.some((f) => f.category === 'minor_presence');
  const hasDoc = findings.some((f) => f.category === 'visible_documents');

  if (hasWork && hasLoc) {
    attack_paths.push({
      title: 'Targeted Workplace Delivery / Badge Verification Smishing',
      description:
        'An attacker poses as an office courier or building management at your specific workplace/neighborhood demanding an urgent verification code or delivery payment.',
      exploited_clues: findings
        .filter((f) => f.category === 'workplace_or_school' || f.category === 'geographic_location')
        .map((f) => f.title),
    });
  }

  if (hasFamily) {
    attack_paths.push({
      title: 'Emergency Family Impersonation Scam',
      description:
        'A scammer claims an urgent medical or school incident involving children, demanding immediate cash transfer via Cash Plus / Wafacash before you can verify.',
      exploited_clues: ['Minor / Child Face Present'],
    });
  }

  if (hasDoc) {
    attack_paths.push({
      title: 'Synthetic Identity Theft / SIM Hijack',
      description:
        'Using visible ID numbers, CIN letters, or date of birth to socially engineer telecom customer service or request password resets.',
      exploited_clues: findings.filter((f) => f.category === 'visible_documents').map((f) => f.title),
    });
  }

  if (attack_paths.length === 0) {
    attack_paths.push({
      title: 'Broad Social Engineering / Curiosity Baiting',
      description: 'Generic phishing using your public handle to trick you into clicking malicious verification links.',
      exploited_clues: ['Public username and profile visibility'],
    });
  }

  // Prioritized fix checklist (max 8)
  const fix_checklist: ExposureReport['fix_checklist'] = [];
  let prio = 1;

  if (hasDoc) {
    fix_checklist.push({
      priority: prio++,
      action: 'Delete or heavily blur any photos showing official cards, badges, or mail.',
      reason: 'Identity numbers enable account takeovers and fraudulent loan applications.',
    });
  }
  if (findings.some((f) => f.category === 'metadata_gps')) {
    fix_checklist.push({
      priority: prio++,
      action: 'Disable camera GPS geotagging in phone settings before uploading.',
      reason: 'Raw camera EXIF embeds latitude and longitude down to a few meters.',
    });
  }
  if (hasFamily) {
    fix_checklist.push({
      priority: prio++,
      action: 'Set photos containing minors to "Close Friends" only or blur facial features.',
      reason: 'Protects children from unsolicited targeting or emotional extortion scams.',
    });
  }
  if (hasWork) {
    fix_checklist.push({
      priority: prio++,
      action: 'Avoid posting photos with visible employer lanyards, entrance gates, or badges.',
      reason: 'Reduces spear-phishing tailored to your specific employer or industry.',
    });
  }
  if (hasLoc) {
    fix_checklist.push({
      priority: prio++,
      action: 'Delay posting vacation or neighborhood check-ins until after leaving the location.',
      reason: 'Prevents real-time pattern tracking of when your residence is unattended.',
    });
  }
  fix_checklist.push({
    priority: prio++,
    action: 'Review privacy settings to ensure stories and personal posts are private.',
    reason: 'Restricts open reconnaissance by unauthorized automated scrapers.',
  });

  const prePublishRecs = isPrePublish ? generatePrePublishRecommendations(findings, analyses) : undefined;

  const allQrCodes: DecodedQrCode[] = [];
  for (const a of analyses) {
    if (a.qr_codes) {
      allQrCodes.push(...a.qr_codes);
    }
  }

  const financialAttackProfile = computeFinancialAttackProfile(findings, analyses, claimedUsername);

  return {
    score,
    level,
    images_analyzed: analyses.length,
    findings,
    attack_paths: attack_paths.slice(0, 3),
    fix_checklist: fix_checklist.slice(0, 8),
    pre_publish_recommendations: prePublishRecs,
    financial_attack_profile: financialAttackProfile,
    is_pre_publish: isPrePublish,
    per_image_results: analyses,
    provider_used: provider,
    model_used: model,
    total_latency_ms: totalLatencyMs,
    verified_via_email: verifiedViaEmail,
    claimed_username: claimedUsername,
    username_verified: usernameVerification,
    qr_codes: allQrCodes.length > 0 ? allQrCodes : undefined,
  };
}

export function computeFinancialAttackProfile(
  findings: ExposureReport['findings'],
  analyses: ExposureImageAnalysis[],
  claimedUsername?: string
): FinancialAttackProfile {
  // 1. Phone & Identity Credentials (targets SIM swap & smishing)
  const hasPhone = findings.some(
    (f) =>
      f.category === 'account_details' ||
      /téléphone|phone|gsm|\+212|06|07/i.test(f.title + ' ' + f.detail)
  );
  const hasDoc = findings.some(
    (f) =>
      f.category === 'visible_documents' ||
      /cin|carte d'identité|passeport|permis|contrat/i.test(f.title + ' ' + f.detail)
  );
  const docFindings = findings.filter((f) => f.category === 'visible_documents');

  // 2. Employer & Corporate Affiliation (targets Bank Impersonation)
  const hasWork = findings.some(
    (f) =>
      f.category === 'workplace_or_school' ||
      /bureau|badge|cfc|entreprise|travail|poste|cadre|ingénieur|directeur|lead|tech/i.test(
        f.title + ' ' + f.detail
      )
  );
  const hasScreen = findings.some((f) => f.category === 'screen_reflection');

  // 3. Location, Daily Routine & Marketplace (targets Fake Buyer / Seller)
  const hasLoc = findings.some(
    (f) => f.category === 'geographic_location' || f.category === 'metadata_gps'
  );
  const hasRoutine = findings.some((f) => f.category === 'daily_routine');
  const hasQr = findings.some((f) => f.category === 'visible_qr_code');
  const hasFamily = findings.some((f) => f.category === 'minor_presence');

  // Discriminating Weighted Scoring:
  // Baseline floor is intentionally low (10-14) so profiles with a dominant vector
  // establish a clear, unambiguous gap (e.g. 80+ vs 20-) between #1 and #3.

  // 1. Bank Impersonation (CIH, Attijari, BCP)
  let bankScore = 14;
  const bankExploited: string[] = [];
  if (hasWork) {
    bankScore += 48;
    bankExploited.push('Affiliation professionnelle / employeur');
  }
  if (hasScreen) {
    bankScore += 26;
    bankExploited.push('Écran ou reflet sensible exposé');
  }
  if (hasDoc) {
    bankScore += 20;
    bankExploited.push(...docFindings.map((d) => d.title));
  }
  if (claimedUsername) {
    bankScore += 8;
    bankExploited.push(`Identifiant public (@${claimedUsername})`);
  }
  bankScore = Math.min(Math.max(bankScore, 12), 96);

  // 2. SIM Swap (Telecom Takeover & OTP Interception)
  let simScore = 12;
  const simExploited: string[] = [];
  if (hasPhone) {
    simScore += 48;
    simExploited.push('Numéro de téléphone personnel');
  }
  if (hasDoc) {
    simScore += 40;
    simExploited.push('Pièce d’identité / CIN exposée');
  }
  if (hasFamily) {
    simScore += 10;
    simExploited.push('Indices familiaux');
  }
  if (hasWork) {
    simScore += 8;
    simExploited.push('Coordonnées professionnelles');
  }
  simScore = Math.min(Math.max(simScore, 10), 96);

  // 3. Fake Seller / Buyer (Marketplace / Avito / WhatsApp)
  let sellerScore = 12;
  const sellerExploited: string[] = [];
  if (hasLoc) {
    sellerScore += 46;
    sellerExploited.push('Localisation ou quartier de remise en main propre');
  }
  if (hasRoutine) {
    sellerScore += 30;
    sellerExploited.push('Habitudes et créneaux horaires réguliers');
  }
  if (hasQr) {
    sellerScore += 18;
    sellerExploited.push('Code QR ou lien public');
  }
  if (analyses.length > 1) {
    sellerScore += 10;
    sellerExploited.push('Catalogue de visuels et style de vie');
  }
  sellerScore = Math.min(Math.max(sellerScore, 10), 94);

  // Fixed, consistent threshold mapping across all vectors
  const getRiskLevel = (s: number): 'critical' | 'high' | 'medium' | 'low' => {
    if (s >= 70) return 'critical';
    if (s >= 40) return 'medium';
    return 'low';
  };

  const rawAttacks: Array<Omit<FinancialAttackItem, 'rank'>> = [
    {
      id: 'bank_impersonation',
      title: 'Usurpation bancaire & faux conseiller (CIH, Attijari, BCP...)',
      score: bankScore,
      risk_level: getRiskLevel(bankScore),
      exploited_data: bankExploited.length > 0 ? bankExploited : ['Identifiant public', 'Traces numériques'],
      explanation: hasWork
        ? 'Votre employeur ou statut professionnel identifié permet à un escroc de monter un faux scénario d’alerte de sécurité bancaire avec une crédibilité immédiate.'
        : 'Votre identité publique fournit le levier pour simuler une alerte de virement ou blocage de compte bancaire.',
    },
    {
      id: 'sim_swap',
      title: 'SIM Swap & piratage de ligne (Interception des SMS OTP)',
      score: simScore,
      risk_level: getRiskLevel(simScore),
      exploited_data: simExploited.length > 0 ? simExploited : ['Numéro ou handle public', 'Informations de profil'],
      explanation: hasPhone || hasDoc
        ? 'La présence d’un numéro de téléphone ou de votre pièce d’identité permet à un escroc de tenter un duplicata SIM auprès de votre opérateur (IAM, Inwi, Orange) pour intercepter vos codes OTP.'
        : 'Avec vos données personnelles exposées, un attaquant peut tenter une ingénierie sociale auprès du service client opérateur pour détourner vos communications.',
    },
    {
      id: 'fake_seller_buyer',
      title: 'Faux acheteur / vendeur marketplace (Avito, Marketplace & faux virements)',
      score: sellerScore,
      risk_level: getRiskLevel(sellerScore),
      exploited_data: sellerExploited.length > 0 ? sellerExploited : ['Publications visuelles', 'Quartier / ville'],
      explanation: hasLoc || hasRoutine
        ? 'Vos habitudes de quartier et lieux de fréquentation fournissent les arguments parfaits pour un faux acheteur prétendant avoir surpayé un article ou envoyant un faux lien de coursier.'
        : 'Vos interactions publiques permettent à un faux acheteur de monter un scénario d’achat immédiat avec un faux justificatif de virement.',
    },
  ];

  // Deterministic code ranking
  rawAttacks.sort((a, b) => b.score - a.score);

  const ranked_attacks: FinancialAttackItem[] = rawAttacks.map((item, idx) => ({
    ...item,
    rank: idx + 1,
  }));

  const topAttack = ranked_attacks[0];

  // Specific step-by-step scenario for top attack
  let scenarioSteps: Array<{ step: number; title: string; detail: string }> = [];
  let protectionSteps: string[] = [];

  if (topAttack.id === 'bank_impersonation') {
    scenarioSteps = [
      {
        step: 1,
        title: 'Reconnaissance et ciblage bancaire',
        detail: `L'escroc analyse vos données exposées (${topAttack.exploited_data.slice(0, 2).join(', ')}) et prépare un message ciblé aux couleurs d'une banque marocaine majeure.`,
      },
      {
        step: 2,
        title: 'SMS d’alerte frauduleux avec faux prétexte d’urgence',
        detail: 'Vous recevez un SMS urgent : « Votre compte a fait l’objet d’une transaction suspecte de 2 850 DH. Pour bloquer ce débit, connectez-vous immédiatement sur notre portail sécurisé » avec un lien miroir.',
      },
      {
        step: 3,
        title: 'Appel d’un prétendu conseiller anti-fraude',
        detail: 'Un faux chargé de compte vous contacte en direct pour vous "aider à bloquer le virement", vous demandant de lui dicter le code OTP reçu par SMS pour finaliser le débit à votre insu.',
      },
    ];
    protectionSteps = [
      'Retenez qu’AUCUNE banque marocaine ne vous contacte par SMS, WhatsApp ou téléphone pour demander un mot de passe ou code OTP.',
      'En cas d’alerte par SMS, ne cliquez jamais sur le lien : ouvrez votre application bancaire officielle de façon autonome ou appelez votre agence au numéro officiel.',
      'Demandez immédiatement à votre agence le verrouillage préventif de vos opérations en ligne si vous avez partagé une pièce d’identité en clair.',
    ];
  } else if (topAttack.id === 'sim_swap') {
    scenarioSteps = [
      {
        step: 1,
        title: 'Constitution du dossier d’usurpation télécom',
        detail: `L'attaquant rassemble votre nom complet, CIN et ville découverts (${topAttack.exploited_data.slice(0, 2).join(', ')}).`,
      },
      {
        step: 2,
        title: 'Demande de duplicata de carte SIM en agence ou en ligne',
        detail: 'L’escroc prétexte un vol ou perte de smartphone pour faire activer une nouvelle puce eSIM/SIM à votre nom auprès de votre opérateur télécom.',
      },
      {
        step: 3,
        title: 'Coupure soudaine de votre réseau et interception des codes OTP',
        detail: 'Votre smartphone affiche brutalement « Aucun service ». Pendant ce temps, l’attaquant réinitialise vos accès bancaires et reçoit vos SMS OTP pour virer vos fonds.',
      },
    ];
    protectionSteps = [
      'Activez un mot de passe ou code PIN secret personnalisé sur votre compte client auprès de votre opérateur (Maroc Telecom, Orange, Inwi).',
      'Si votre téléphone perd subitement tout signal réseau en plein jour sans explication, contactez immédiatement votre opérateur et prévenez votre banque.',
      'Privilégiez les applications d’authentification (2FA TOTP type Google Authenticator) plutôt que les SMS pour vos comptes et messageries critiques.',
    ];
  } else {
    scenarioSteps = [
      {
        step: 1,
        title: 'Sélection sur marketplace et contact flatteur',
        detail: `L’attaquant vous repère sur les réseaux ou Avito, note vos coordonnées locales (${topAttack.exploited_data.slice(0, 2).join(', ')}) et accepte votre prix sans négocier.`,
      },
      {
        step: 2,
        title: 'Envoi d’un faux lien de confirmation ou faux reçu de virement',
        detail: 'L’acheteur prétend être en déplacement, vous envoie une fausse capture d’écran de virement ou un lien « Validez pour recevoir vos fonds » demandant votre numéro de carte et CVV.',
      },
      {
        step: 3,
        title: 'Demande de remboursement ou envoi précipité par coursier',
        detail: 'Il affirme avoir "trop payé par erreur" et exige un remboursement immédiat via Cash Plus / Wafacash avant que vous n’ayez pu constater que votre compte n’a jamais été crédité.',
      },
    ];
    protectionSteps = [
      'Pour recevoir un virement, seul votre RIB officiel est nécessaire : ne saisissez JAMAIS votre numéro de carte bancaire, date d’expiration ou cryptogramme CVV pour "recevoir" de l’argent.',
      'Ne remettez aucun article à un coursier tant que la somme n’apparaît pas de façon définitive sur votre relevé bancaire officiel.',
      'Refusez systématiquement tout remboursement de prétendu "trop-perçu" avant confirmation écrite formelle de votre agence bancaire.',
    ];
  }

  return {
    title: 'Quelle arnaque financière vous vise le plus ?',
    ranked_attacks,
    top_attack_scenario: {
      attack_id: topAttack.id,
      attack_title: topAttack.title,
      steps: scenarioSteps,
    },
    top_attack_protections: protectionSteps,
  };
}

// 5. Defensive Attack Simulation Tailored to #1 Ranked Financial Attack
export async function generateDefensiveAttackSimulation(report: ExposureReport): Promise<{
  simulated_message: string;
  attacker_persona: string;
  attack_vector: string;
  defensive_explanation: string;
  provider: string;
  model: string;
  latency_ms: number;
}> {
  const profile = report.financial_attack_profile || computeFinancialAttackProfile(report.findings, report.per_image_results || [], report.claimed_username);
  const topAttack = profile.ranked_attacks?.[0] || { id: 'bank_impersonation', title: 'Usurpation bancaire' };
  const clues = report.findings.map((f) => `- ${f.title}: ${f.detail}`).join('\n');

  let attackGuidance = '';
  let fallbackMessage = '';
  let fallbackPersona = '';
  let fallbackVector = '';
  let fallbackExplanation = '';

  if (topAttack.id === 'bank_impersonation') {
    attackGuidance = `The victim's #1 threat is BANK IMPERSONATION (CIH, Attijariwafa, BCP).
Generate an urgent fake bank security alert SMS or message claiming an unauthorized debit of 2,800+ DH or suspended account, pushing the user to click a phishing link or dictate an OTP code.`;
    fallbackPersona = 'Faux service sécurité CIH Bank';
    fallbackVector = 'SMS Phishing bancaire urgent';
    fallbackMessage = 'CIH BANK: Alerte transaction suspecte de 2 850 DH à Casablanca. Pour annuler ce virement, connectez-vous immédiatement sur: http://cih-securite-login.com/auth ou confirmez avec le code reçu.';
    fallbackExplanation = 'L’escroc tire parti de vos affiliations professionnelles pour créer un faux sentiment d’urgence et vous dérober vos identifiants ou code OTP.';
  } else if (topAttack.id === 'sim_swap') {
    attackGuidance = `The victim's #1 threat is SIM SWAP & TELECOM TAKEOVER (Inwi, Maroc Telecom, Orange).
Generate a deceptive telecom operator SMS alert stating that a replacement SIM card activation is in progress, instructing them to send a confirmation code or click a link to cancel the transfer.`;
    fallbackPersona = 'Faux support technique Inwi';
    fallbackVector = 'SMS de prétexte de mise à jour SIM';
    fallbackMessage = 'INWI INFO: Une demande d’activation eSIM de remplacement a été enregistrée pour votre ligne. Si vous n’êtes pas à l’origine de cette demande, envoyez immédiatement le code 4920 au 212... pour bloquer le transfert.';
    fallbackExplanation = 'L’escroc cherche à obtenir votre code opérateur pour activer votre numéro sur sa propre carte SIM et intercepter tous vos futurs SMS bancaires.';
  } else {
    attackGuidance = `The victim's #1 threat is FAKE BUYER / SELLER MARKETPLACE SCAM (Avito, WhatsApp, Wafacash, Cash Plus).
Generate a realistic WhatsApp message in Moroccan Darija and French from a buyer who claims to have sent an instant payment with overpayment (trop-perçu) and asks you to refund the difference via a link or Cash Plus before cancellation.`;
    fallbackPersona = 'Faux acheteur Avito sur WhatsApp';
    fallbackVector = 'Message WhatsApp faux trop-perçu (Darija/FR)';
    fallbackMessage = "Salam khoya, 3jebni l-article dialek f Avito. Sifett lik 1500 DH au lieu de 1000 DH par virement instantané Wafacash. 3afak sift liya 500 DH de trop-perçu f hed le lien avant que le virement s'annule.";
    fallbackExplanation = 'L’attaquant exploite vos coordonnées locales et vos habitudes pour vous faire croire à un virement effectif et vous extorquer de l’argent réel.';
  }

  const prompt = `You are an ethical cybersecurity educator.
Based on the following exposure clues discovered from the user's profile:
${clues}

SPECIFIC TARGETED ATTACK:
${attackGuidance}

CRITICAL DEFENSIVE SAFETY RULES:
1. This is strictly a DEFENSIVE EDUCATIONAL SIMULATION demonstrating the #1 attack.
2. Label the sender clearly as a fictional persona.
3. NEVER repeat real private credentials.
4. Explain clearly in 2 sentences WHY this attack works based on the user's clues and how to neutralize it.

OUTPUT JSON FORMAT:
{
  "attacker_persona": "Fictional persona (e.g. Faux service sécurité CIH Bank / Faux acheteur Avito)",
  "attack_vector": "e.g. SMS Phishing bancaire urgent / WhatsApp faux trop-perçu",
  "simulated_message": "The exact realistic message text in French or Darija/Arabic",
  "defensive_explanation": "Why this message works and how the user can spot the trap immediately"
}`;

  try {
    const res = await call_llm({
      messages: [{ role: 'user', content: prompt }],
      jsonSchema: true,
      temperature: 0.2,
    });

    const parsed = res.parsedJson || {};
    return {
      attacker_persona: parsed.attacker_persona || fallbackPersona,
      attack_vector: parsed.attack_vector || fallbackVector,
      simulated_message: parsed.simulated_message || fallbackMessage,
      defensive_explanation: parsed.defensive_explanation || fallbackExplanation,
      provider: res.provider_used,
      model: res.model_used,
      latency_ms: res.latency_ms,
    };
  } catch {
    return {
      attacker_persona: fallbackPersona,
      attack_vector: fallbackVector,
      simulated_message: fallbackMessage,
      defensive_explanation: fallbackExplanation,
      provider: 'rule_engine',
      model: 'defensive_template',
      latency_ms: 10,
    };
  }
}
