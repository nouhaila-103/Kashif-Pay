import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { call_llm } from './llm_provider.ts';
import { runDeterministicGuardrail, mergeVerdicts } from './guardrail.ts';
import { maskPII } from './masking.ts';
import { RedFlag, ScamShieldResponse, Verdict, PaymentScamCategory } from './types.ts';
import { decode_qr_codes, DecodedQrCode } from './qr_utils.ts';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..');
const patternsPath = path.join(rootDir, 'knowledge', 'scam_patterns.json');

interface ScamPattern {
  id: string;
  name: string;
  name_fr: string;
  name_ar: string;
  severity: string;
  target: string;
  keywords: string[];
  description: string;
  advice: string;
  report_to: string;
}

let loadedPatterns: ScamPattern[] = [];
try {
  if (fs.existsSync(patternsPath)) {
    loadedPatterns = JSON.parse(fs.readFileSync(patternsPath, 'utf-8'));
  }
} catch (e) {
  console.warn('Failed to load scam patterns:', e);
}

function retrieveRelevantPatterns(text: string): ScamPattern[] {
  const normalized = text.toLowerCase();
  const scored = loadedPatterns.map((p) => {
    let score = 0;
    for (const kw of p.keywords) {
      if (normalized.includes(kw.toLowerCase())) {
        score += 2;
      }
    }
    return { pattern: p, score };
  });

  scored.sort((a, b) => b.score - a.score);
  // Return top 5 or all matches with score > 0
  const matched = scored.filter((s) => s.score > 0).map((s) => s.pattern);
  return matched.length > 0 ? matched.slice(0, 5) : loadedPatterns.slice(0, 4);
}

/**
 * Deterministic Fast-Path check: Return immediately (< 1s, no LLM) if payload has no link,
 * no domain, no phone, no destination RIB/IBAN, no OTP/PIN/CVV, no urgency/threat, and no lookalike brand.
 */
export function isDeterministicSafePayload(
  text: string,
  qrCodes: DecodedQrCode[] = []
): { isSafe: boolean; reason?: string } {
  const normalized = text.toLowerCase().trim();

  // 1. Any QR classified as url, phone, or wifi is not a plain-text fast path
  for (const qr of qrCodes) {
    if (qr.kind === 'url' || qr.kind === 'phone' || qr.kind === 'wifi') {
      return { isSafe: false };
    }
  }

  // 2. Check for URL, protocol, or domain name
  const hasUrlOrDomain =
    /(?:https?:\/\/|ftp:\/\/|www\.|\b[a-zA-Z0-9-]+\.(?:com|ma|me|org|net|io|site|online|xyz|top|tk|cf|ga|ml|app|shop|gov|co|fr|edu|info|example)\b)/i.test(
      normalized
    );
  if (hasUrlOrDomain) {
    return { isSafe: false };
  }

  // 3. Check for phone numbers or destination RIB/IBAN to send money to
  const hasPhone = /(?:\+?212|0[5-7])[0-9\s\-().]{8,15}/.test(normalized);
  const hasRibOrIban = /\b\d{24}\b|MA\d{2}\s*\d{24}/i.test(normalized);
  if (hasPhone || hasRibOrIban) {
    return { isSafe: false };
  }

  // 4. Check for OTP / CVV / PIN / credential request
  const hasCredentialRequest =
    /(?:otp|cvv|cvc|code\s*pin|code\s*secret|code\s*confidentiel|mot\s*de\s*passe|identifiant|رمز\s*التأكيد|رمز\s*الأمان|الكود|كود\s*التأكيد)/i.test(
      normalized
    );
  if (hasCredentialRequest) {
    return { isSafe: false };
  }

  // 5. Check for urgency or threat wording
  const hasUrgencyOrThreat =
    /(?:urgent|imm[ée]diatement|de\s*toute\s*urgence|bloqu[ée]|suspendu|restreint|colis\s*bloqu[ée]|dernier\s*avis|avant\s*minuit|sous\s*24h|sous\s*48h|expiration|s[ée]curit[ée]\s*compromise|عاجل|ضروري|حساب\s*موقوف|طرد\s*معلق|قبل\s*فوات\s*الأوان|انتهت\s*الصلاحية)/i.test(
      normalized
    );
  if (hasUrgencyOrThreat) {
    return { isSafe: false };
  }

  // 6. Check for look-alike bank names or brand impersonation
  const hasLookalikeBrand =
    /(?:cih-securite|cih-login|attijari-auth|wafacash-paiement|barid-colis|amana-suivi|cashplus-transfert)/i.test(
      normalized
    );
  if (hasLookalikeBrand) {
    return { isSafe: false };
  }

  // 7. Check if deterministic guardrail triggers any scam/suspicious rule
  const guard = runDeterministicGuardrail(text);
  if (guard.verdict !== 'safe' || guard.triggered_rules.length > 0) {
    return { isSafe: false };
  }

  return { isSafe: true, reason: 'Plain text payload without links, credentials, urgency or lookalike brands' };
}

export async function transcribeScreenshot(
  imageBase64: string,
  mimeType = 'image/png'
): Promise<{
  sender?: string;
  channel?: string;
  links?: string[];
  raw_text: string;
  provider: string;
  model: string;
  latency_ms: number;
}> {
  const prompt = `You are a forensic OCR and message transcriber for Kashif, a cybersecurity tool.
Examine this screenshot (SMS, WhatsApp, Instagram, Telegram, Email, or Web DM).
Transcribe the content VERBATIM without correcting typos or dialect spelling.
Detect:
1. Sender name or phone number shown (if any).
2. App / channel (e.g. WhatsApp, SMS, Instagram, Email, Browser).
3. Any URLs or links visible in the message.
4. The exact verbatim text content of the message.

Output valid JSON with the exact structure:
{
  "sender": "string or null",
  "channel": "string or null",
  "links": ["string"],
  "raw_text": "string verbatim transcription"
}`;

  const cleanBase64 = imageBase64.replace(/^data:image\/\w+;base64,/, '');

  const res = await call_llm({
    messages: [
      {
        role: 'user',
        content: prompt,
      },
    ],
    images: [{ mimeType, base64Data: cleanBase64 }],
    jsonSchema: true,
    temperature: 0.1,
    timeoutMs: 6000,
    maxOutputTokens: 600,
    minimalThinking: true,
  });

  const parsed = res.parsedJson || {};
  return {
    sender: parsed.sender || undefined,
    channel: parsed.channel || undefined,
    links: Array.isArray(parsed.links) ? parsed.links : [],
    raw_text: parsed.raw_text || res.content || '',
    provider: res.provider_used,
    model: res.model_used,
    latency_ms: res.latency_ms,
  };
}

export async function analyzeScamRisk(params: {
  text: string;
  imageBase64?: string;
  imageMimeType?: string;
  personalExposureCategories?: string[];
  userLanguage?: 'fr' | 'ar' | 'en';
}): Promise<ScamShieldResponse> {
  const startTime = performance.now();
  let workingText = params.text.trim();
  let transcriptionData: any = undefined;
  let ocrLatency = 0;

  let detectedQrCodes: DecodedQrCode[] = [];

  // 1. If an image is provided: decode QR codes first (fast local decoding)
  if (params.imageBase64 && params.imageBase64.length > 50) {
    try {
      const cleanBase64 = params.imageBase64.replace(/^data:image\/\w+;base64,/, '');
      const imgBuffer = Buffer.from(cleanBase64, 'base64');
      detectedQrCodes = await decode_qr_codes(imgBuffer);
      for (const qr of detectedQrCodes) {
        workingText = workingText
          ? `${workingText}\n\nQR code found in image: ${qr.data}`
          : `QR code found in image: ${qr.data}`;
      }
    } catch (qrErr) {
      console.warn('QR decode error (non-fatal):', qrErr);
    }

    // Only invoke slow Vision OCR if NO QR was decoded AND user provided no text (e.g. Chat/SMS screenshot)
    if (detectedQrCodes.length === 0 && !workingText) {
      try {
        const transcription = await transcribeScreenshot(params.imageBase64, params.imageMimeType || 'image/png');
        transcriptionData = {
          sender: transcription.sender,
          channel: transcription.channel,
          links: transcription.links,
          raw_text: transcription.raw_text,
        };
        ocrLatency = transcription.latency_ms;
        if (!workingText && transcription.raw_text) {
          workingText = transcription.raw_text;
        } else if (transcription.raw_text && !workingText.includes(transcription.raw_text.substring(0, 20))) {
          workingText = `${workingText}\n\n[Transcribed message]: ${transcription.raw_text}`;
        }
      } catch (ocrErr) {
        console.warn('OCR transcription failed, falling back to provided text:', ocrErr);
      }
    }
  }

  if (!workingText) {
    throw new Error('Please provide text or an image containing text to analyze.');
  }

  // 2. DETERMINISTIC FAST PATH (Change 1):
  // If payload contains no URL/domain, no phone, no RIB/IBAN, no OTP/PIN/CVV, no urgency/threat, and no lookalike bank name:
  // Return immediately in < 1s without calling LLM!
  const fastPathCheck = isDeterministicSafePayload(workingText, detectedQrCodes);
  if (fastPathCheck.isSafe) {
    const fastPathAdvice =
      params.userLanguage === 'ar'
        ? 'تحقق من تطابق اسم التاجر والمبلغ مع مشترياتك الفعلية قبل الدفع.'
        : params.userLanguage === 'en'
        ? 'Verify that the merchant name and amount match what you expect before paying.'
        : 'Vérifiez que le nom du commerçant et le montant correspondent à ce que vous attendez avant de payer.';

    const fastPathExplanation =
      params.userLanguage === 'ar'
        ? 'يحتوي رمز QR هذا على نص عادي محايد (اسم التاجر والمبلغ المطلوب). لا يتضمن أي رابط إلكتروني، أو رقم مجهول، أو طلباً لبيانات سرية.'
        : params.userLanguage === 'en'
        ? 'This QR code contains plain neutral text (e.g. merchant name and amount). No web links, suspicious numbers, or credential requests are present.'
        : 'Ce QR code contient un texte brut neutre (ex: nom de commerçant et montant). Aucun lien web, numéro suspect ou demande d’identifiant n’est présent.';

    const fastPathWhatToDo =
      params.userLanguage === 'ar'
        ? [
            'تأكد من أن المبلغ واسم المحل التجاري يتطابقان مع عملية شرائك.',
            'لا تدخل أي رقم سري أو رمز تأكيد على أجهزة غير موثوقة.',
            'في حال الشك، اطلب تأكيد العملية مباشرة من التاجر الحاضر أمامك.',
          ]
        : params.userLanguage === 'en'
        ? [
            'Ensure the displayed merchant name and amount match your actual purchase.',
            'Never enter any PIN, OTP, or banking password on an untrusted device.',
            'If in doubt, ask the physical merchant for in-person confirmation.',
          ]
        : [
            'Assurez-vous que le montant et le commerçant affichés correspondent à votre achat.',
            'Ne saisissez aucun code secret, PIN ou mot de passe sur un terminal inconnu.',
            'En cas de doute, demandez confirmation directement au commerçant physique.',
          ];

    return {
      verdict: 'safe',
      category: 'other',
      action_recommendation: fastPathAdvice,
      llm_verdict: 'safe',
      guardrail_verdict: 'safe',
      guardrail_escalated: false,
      confidence: 0.7, // Objective, never 100% or "Safe" absolute
      confidence_reason: 'Évaluation déterministe immédiate : contenu textuel sans lien URL, sans demande de code ni redirection suspecte.',
      matched_patterns: [],
      red_flags: [],
      explanation: fastPathExplanation,
      what_to_do: fastPathWhatToDo,
      report_to: [], // Removed authority links for LOW risk
      transcription: transcriptionData,
      provider_used: 'deterministic_fast_path',
      model_used: 'payload_rule_engine',
      latency_ms: Math.round(performance.now() - startTime),
      fallback_used: false,
      is_basic_check: true,
      qr_codes: detectedQrCodes.length > 0 ? detectedQrCodes : undefined,
    };
  }

  // 3. Parallel Guardrail execution (deterministic keyword & pattern rules)
  const guardrailResult = runDeterministicGuardrail(workingText);

  // 4. Grounding Context retrieval from scam_patterns.json
  const relevantPatterns = retrieveRelevantPatterns(workingText);

  // Personalization risk check context
  const personalCategories = params.personalExposureCategories || [];
  const personalizationContext =
    personalCategories.length > 0
      ? `\nSESSION EXPOSURE CONTEXT:\nThe current user has previously exposed the following information categories online: [${personalCategories.join(
          ', '
        )}].\nAssess whether the analyzed message specifically exploits any of these categories (e.g. mentions their workplace, city, family, schedule). If so, set personalization_risk.detected = true with explanation.`
      : '';

  const systemPrompt = `You are Kashif Pay (كاشف) Fraud Shield ("Vérifie avant de payer"), an expert AI fraud shield specialized in detecting Moroccan financial scams and payment fraud across Moroccan Darija (Arabic script & Latin Arabizi), French, standard Arabic, and English.

SPECIALIZED FRAUD CATEGORIES IN MOROCCO:
1. fake_bank_sms: Impersonating Moroccan banks (CIH, Attijariwafa, Banque Populaire / Chaabi, BMCE / Bank of Africa, Crédit Agricole du Maroc, SGMB, Al Barid Bank) claiming locked accounts, suspicious transactions, or security audits with a link.
2. otp_request: Demanding the 6-digit SMS verification code, OTP, WhatsApp transfer code, or card CVV/PIN under pretexts ("sift lik l-code b l-ghalat", bank security officer, or lottery claim).
3. fake_delivery_fee: Smishing pretending to be Barid Al-Maghrib, Amana Express, or Chronopost claiming a parcel is stuck for unpaid fees (e.g. 15 to 30 DH) linking to a payment clone.
4. fake_buyer_or_seller: Avito, Facebook Marketplace or WhatsApp buyers claiming to have paid via instant transfer or overpaid and demanding a refund via Wafacash / Cash Plus, or asking sellers to enter card credentials on a fake receipt link.
5. fake_payment_link_or_qr: Shortened links, malicious payment gateways, or rogue QR codes redirecting to credential harvesters or unauthorized payment endpoints.
6. sim_swap_pretext: Posing as telecom operators (Maroc Telecom, Inwi, Orange) claiming line deactivation, SIM expiration, or 5G upgrades to steal SIM authorization codes.
7. other: General financial phishing or scams not listed above.

CONTEXT AND INFERENCE RESTRICTIONS (STRICT COMPLIANCE REQUIRED):
1. DO NOT ASSUME CONTEXT: Never claim that a QR code, link, or message is "unsolicited", "non sollicité", "reçu par message", or "spontané" UNLESS the input text explicitly states how it was received.
2. A QR code alone is NEVER an indicator of fraud. Standard merchant payment QR codes, point-of-sale receipts, or invoices containing merchant names and amounts are standard legitimate payment tools.
3. QR AND PAYMENT LINK INDICATORS: Only raise the verdict (to "suspicious" or "scam") for REAL, CONCRETE signals:
   - Shortened URL (bit.ly, tinyurl, is.gd, etc.) hiding the real destination.
   - Look-alike, misspelled, or phishing bank/brand domain (e.g., cih-securite.example, attijari-connexion.com).
   - A domain unrelated to the named merchant, or claiming official bank status on an untrusted generic domain.
   - A payment link directing to a form requesting bank card details, CVV, PIN, or OTP confirmation code.
   - An unexpected personal mule account or wallet address with urgent pressure to transfer funds.
4. SINGLE INDICATOR CONFIDENCE CAPPING: When only a single indicator or unverified link is present, cap the confidence score at 0.70 (70%) maximum.

STRICT VERDICT RULES:
- "scam": High likelihood of deception, financial fraud, theft, or phishing.
- "suspicious": Contains unverified links, urgency, unknown payment requests, or vague pretexts requiring caution.
- "safe": Normal, benign communication or legitimate merchant payload. "safe" requires: no request for money/code/personal credentials/unverified link, no suspicious pattern match, and no artificial urgency.

REASONING LANGUAGE:
Provide the "explanation" and "action_recommendation" strictly in the language/dialect of the incoming message (especially Moroccan Darija if the message is in Darija, French if French, Arabic if Arabic).

OUTPUT FORMAT:
Return ONLY valid JSON matching this schema:
{
  "verdict": "safe" | "suspicious" | "scam",
  "category": "fake_bank_sms" | "otp_request" | "fake_delivery_fee" | "fake_buyer_or_seller" | "fake_payment_link_or_qr" | "sim_swap_pretext" | "other",
  "confidence": number between 0.00 and 1.00 (cap at 0.70 if only a single unverified link/indicator is present),
  "confidence_reason": "string explaining how the confidence was computed",
  "matched_patterns": ["string ids of matched patterns, or empty"],
  "red_flags": [
    {
      "flag": "string describing the red flag",
      "quote_from_message": "exact verbatim excerpt from message"
    }
  ],
  "explanation": "2-3 clear sentences in the language of the message (or ${params.userLanguage || 'French'})",
  "action_recommendation": "Single direct action line: Que faire maintenant (e.g. 'Vérifiez que le nom du commerçant et le montant correspondent à ce que vous attendez avant de payer.')",
  "what_to_do": ["3 concrete, numbered action steps for the user"],
  "report_to": ["Specific Moroccan organizations to report this to, or empty array if safe/low risk"],
  "personalization_risk": {
    "detected": boolean,
    "reason": "string explaining connection to exposed data, or empty"
  }
}`;

  let llmResult: any = null;
  let isBasicCheck = false;
  let providerUsed = 'guardrail_fallback';
  let modelUsed = 'rule_engine';
  let totalLatency = 0;
  let fallbackUsed = false;
  let fallbackChain: string[] = [];

  try {
    const response = await call_llm({
      messages: [
        { role: 'system', content: systemPrompt },
        {
          role: 'user',
          content: `Analyze this message for social engineering / scam risk:\n\n"""\n${workingText}\n"""`,
        },
      ],
      jsonSchema: true,
      temperature: 0.1,
      timeoutMs: 6000, // 6s strict timeout for responsive Scam Shield checks
      maxOutputTokens: 800, // Low max tokens to avoid verbose reasoning latency
      minimalThinking: true, // Minimal thinking to avoid 20s+ latency
    });

    llmResult = response.parsedJson;
    providerUsed = response.provider_used;
    modelUsed = response.model_used;
    totalLatency = Math.round(performance.now() - startTime);
    fallbackUsed = response.fallback_used;
    fallbackChain = response.fallback_chain;
  } catch (llmErr) {
    console.warn('[ScamShield] LLM call failed or timed out. Falling back to deterministic guardrail.', llmErr);
    isBasicCheck = true;
    totalLatency = Math.round(performance.now() - startTime);
  }

  // 5. Merge LLM verdict and Guardrail verdict
  let llmVerdict: Verdict = 'safe';
  let confidence = 0.5;
  let confidenceReason = 'Computed from deterministic rule evaluation';
  let matchedPatterns: string[] = [];
  let redFlags: RedFlag[] = [];
  let explanation = '';
  let actionRecommendation = '';
  let whatToDo: string[] = [];
  let reportTo: string[] = [];
  let personalizationRisk = { detected: false, reason: '' };
  let category: PaymentScamCategory = guardrailResult.category || 'other';

  const VALID_CATEGORIES = new Set<string>([
    'fake_bank_sms',
    'otp_request',
    'fake_delivery_fee',
    'fake_buyer_or_seller',
    'fake_payment_link_or_qr',
    'sim_swap_pretext',
    'other',
  ]);

  if (llmResult && !isBasicCheck) {
    llmVerdict = (llmResult.verdict || 'suspicious').toLowerCase() as Verdict;
    if (!['safe', 'suspicious', 'scam'].includes(llmVerdict)) {
      llmVerdict = 'suspicious';
    }
    if (llmResult.category && VALID_CATEGORIES.has(llmResult.category)) {
      category = llmResult.category as PaymentScamCategory;
    } else if (guardrailResult.category && guardrailResult.category !== 'other') {
      category = guardrailResult.category;
    }

    confidence = typeof llmResult.confidence === 'number' ? Math.min(Math.max(llmResult.confidence, 0.05), 0.99) : 0.85;
    confidenceReason = llmResult.confidence_reason || 'Evaluated through multi-step pattern grounding and semantic risk analysis';
    matchedPatterns = Array.isArray(llmResult.matched_patterns) ? llmResult.matched_patterns : [];
    redFlags = Array.isArray(llmResult.red_flags) ? llmResult.red_flags : [];
    explanation = llmResult.explanation || '';
    actionRecommendation = llmResult.action_recommendation || '';
    whatToDo = Array.isArray(llmResult.what_to_do) ? llmResult.what_to_do : [];
    reportTo = Array.isArray(llmResult.report_to) ? llmResult.report_to : [];
    if (llmResult.personalization_risk) {
      personalizationRisk = llmResult.personalization_risk;
    }
  } else {
    // Basic check when AI is unavailable or timed out
    llmVerdict = guardrailResult.verdict;
    category = guardrailResult.category || 'other';
    confidence = guardrailResult.forced ? 0.92 : guardrailResult.verdict === 'safe' ? 0.6 : 0.78;
    confidenceReason = 'Basic check — AI unavailable. Result calculated solely via deterministic security guardrail rules.';
    explanation =
      guardrailResult.verdict === 'scam'
        ? 'Ce message correspond aux signatures d’arnaques de paiement connues au Maroc (demande de code OTP, faux frais ou usurpation bancaire).'
        : guardrailResult.verdict === 'suspicious'
        ? 'Ce message contient des éléments nécessitant une vigilance financière accrue (liens courts ou demande pressante).'
        : 'Aucun motif suspect flagrant n’a été relevé par le filtre de base. Restez toutefois vigilant avant tout paiement.';
    whatToDo = [
      'Ne communiquez jamais aucun code reçu par SMS, mot de passe ou identifiant bancaire.',
      'Ne cliquez sur aucun lien raccourci ou suspect dans ce message.',
      'En cas de doute sur un organisme officiel, contactez son service client par un numéro vérifié.',
    ];
    reportTo = guardrailResult.verdict !== 'safe' ? ['DGSN Brigade Anti-Cybercriminalité', 'Centre d’assistance client'] : [];
  }

  // Combine red flags if guardrail found specific keywords not listed in LLM red flags
  if (guardrailResult.triggered_rules.length > 0 && redFlags.length === 0) {
    for (const rule of guardrailResult.triggered_rules) {
      redFlags.push({
        flag: rule,
        quote_from_message: guardrailResult.matched_keywords.slice(0, 3).join(', ') || 'Triggered security rule',
      });
    }
  }

  const { finalVerdict, escalated } = mergeVerdicts(llmVerdict, guardrailResult, workingText);

  // If escalated by guardrail, adjust confidence and category if guardrail detected a specific category
  let finalConfidence = confidence;
  if (escalated) {
    finalConfidence = Math.max(confidence, 0.91);
    if (guardrailResult.category && guardrailResult.category !== 'other') {
      category = guardrailResult.category;
    }
    confidenceReason = `${confidenceReason} (Escalated to '${finalVerdict}' by deterministic guardrail: ${guardrailResult.triggered_rules[0] || 'critical risk rules'})`;
  }

  // Rule 3: Single indicator confidence capping (cap at 70% if only single indicator)
  if (redFlags.length <= 1 && (finalVerdict === 'suspicious' || llmVerdict === 'suspicious')) {
    finalConfidence = Math.min(finalConfidence, 0.70);
  }

  // Rule 5: For LOW risk results, remove authority links and set low risk advice
  if (finalVerdict === 'safe') {
    reportTo = []; // Remove irrelevant authority links for LOW risk
    finalConfidence = Math.min(finalConfidence, 0.70);
    if (!actionRecommendation) {
      actionRecommendation =
        params.userLanguage === 'ar'
          ? 'تحقق من تطابق اسم التاجر والمبلغ مع مشترياتك الفعلية قبل الدفع.'
          : params.userLanguage === 'en'
          ? 'Verify that the merchant name and amount match what you expect before paying.'
          : 'Vérifiez que le nom du commerçant et le montant correspondent à ce que vous attendez avant de payer.';
    }
  }

  // Fallback action recommendation if missing
  if (!actionRecommendation) {
    if (finalVerdict === 'scam') {
      if (category === 'otp_request') {
        actionRecommendation = 'Ne partagez aucun code SMS ou OTP et changez immédiatement vos identifiants.';
      } else if (category === 'fake_bank_sms') {
        actionRecommendation = 'Ne cliquez pas sur ce lien : votre banque ne demande jamais de confirmation par SMS.';
      } else if (category === 'fake_delivery_fee') {
        actionRecommendation = 'Ne réglez aucun frais via ce lien : les transporteurs officiels ne demandent pas de paiement sur des domaines inconnus.';
      } else if (category === 'fake_buyer_or_seller') {
        actionRecommendation = 'N’envoyez aucun article ni remboursement : attendez la confirmation effective sur votre relevé bancaire.';
      } else {
        actionRecommendation = 'Interrompez tout échange et ne validez aucune transaction ni redirection.';
      }
    } else if (finalVerdict === 'suspicious') {
      actionRecommendation = 'Ne cliquez sur aucun lien et vérifiez l’identité de l’émetteur par un canal officiel avant de continuer.';
    } else {
      actionRecommendation = 'Vérifiez que le nom du commerçant et le montant correspondent à ce que vous attendez avant de payer.';
    }
  }

  // Mask PII in returned quotes and explanations
  const sanitizedRedFlags = redFlags.map((rf) => ({
    flag: rf.flag,
    quote_from_message: maskPII(rf.quote_from_message),
  }));

  const sanitizedExplanation = maskPII(explanation);
  const sanitizedAction = maskPII(actionRecommendation);

  return {
    verdict: finalVerdict,
    category,
    action_recommendation: sanitizedAction,
    llm_verdict: llmVerdict,
    guardrail_verdict: guardrailResult.verdict,
    guardrail_escalated: escalated,
    confidence: Math.round(finalConfidence * 100) / 100,
    confidence_reason: confidenceReason,
    matched_patterns: matchedPatterns,
    red_flags: sanitizedRedFlags,
    explanation: sanitizedExplanation,
    what_to_do: whatToDo,
    report_to: reportTo,
    transcription: transcriptionData,
    provider_used: providerUsed,
    model_used: modelUsed,
    latency_ms: totalLatency,
    fallback_used: fallbackUsed,
    is_basic_check: isBasicCheck,
    personalization_risk: personalizationRisk.detected ? personalizationRisk : undefined,
    qr_codes: detectedQrCodes.length > 0 ? detectedQrCodes : undefined,
    debug_info: {
      raw_llm_json: llmResult,
      guardrail: guardrailResult,
      fallback_chain: fallbackChain,
    },
  };
}
