import { GuardrailResult, PaymentScamCategory, Verdict } from './types.ts';

// Severity order for comparison: safe < suspicious < scam
export const VERDICT_SEVERITY: Record<Verdict, number> = {
  safe: 0,
  suspicious: 1,
  scam: 2,
};

export function compareVerdicts(a: Verdict, b: Verdict): Verdict {
  return VERDICT_SEVERITY[a] >= VERDICT_SEVERITY[b] ? a : b;
}

// Multilingual token dictionaries
const REWARD_HOOKS = [
  'gagné', 'gagne', 'gagner', 'félicitations', 'felicitations', 'tirage au sort', 'lot', 'cadeau', 'cadeaux',
  'ربحتي', 'مبروك', 'مبروك عليك', 'جائزة', 'هدايا', 'قرعة', 'فزت', 'فوز', 'مكافأة',
  'rbe7ti', 'rbhti', 'mabrouk', 'mabrok', 'jaiza', 'rebe7ti', 'khediti',
  'won', 'winner', 'winning', 'prize', 'reward', 'congratulations', 'lottery', 'selected to win',
];

const URGENCY_HOOKS = [
  'urgent', 'immédiatement', 'de toute urgence', 'compte bloqué', 'compte suspendu', 'compte restreint', 'colis bloqué',
  'dernier avis', 'avant minuit', 'sous 24h', 'sous 48h', 'action requise', 'expiration', 'bloque', 'sécurité compromise',
  'عاجل', 'ضروري', 'حساب موقوف', 'طرد معلق', 'قبل فوات الأوان', 'انتهت الصلاحية', 'حالة طارئة', 'دابا بسرعة', 'توقيف الحساب',
  'tbloqa', 'tblooka', 'daba', 'zarba', 'urgent', 'expirer',
  'immediate', 'suspended', 'account blocked', 'parcel on hold', 'final notice', 'within 24 hours', 'urgent action',
];

const AUTHORITY_HOOKS = [
  'cnss', 'cnops', 'dgi', 'barid', 'amana', 'chronopost', 'aramex',
  'cih', 'attijari', 'bcp', 'chaabi', 'bmce', 'bank of africa', 'crédit agricole', 'sgmb', 'barid bank',
  'wafacash', 'cash plus', 'damane', 'al barid bank',
  'police', 'gendarmerie', 'douane', 'trésorerie', 'anapec', 'maroc telecom', 'inwi', 'orange',
  'الضمان الاجتماعي', 'البريد', 'أمانة', 'التجاري', 'الشعبي', 'الجمارك', 'اتصالات المغرب', 'بنك العمل',
];

const SENSITIVE_DATA_OR_ACTION = [
  'cin', 'بطاقة وطنية', 'بطاقة التعريف', 'carte nationale', 'cnie',
  'rib', 'carte bancaire', 'cvv', 'cvc', 'mot de passe', 'code secret', 'code confidentiel', 'identifiant', 'pin',
  'code', 'الكود', 'كود', 'رمز التأكيد', 'رمز الأمان', 'otp', 'sms de confirmation',
  'frais', 'paiement', 'virement', 'payer', 'avance', 'caution', 'frais de dossier', 'recharge',
  'مصاريف', 'دفع', 'تحويل', 'تسبيق', 'أرسل المال', 'صيفط فلوس', 'كود سري',
  'sifet flous', 'khalas', 'khlass', 'dariba', 'scratch card',
  'bit.ly', 'tinyurl', 'is.gd', 'cutt.ly', 't.ly', 'rb.gy', 'wa.me',
  'cliquez ici', 'cliquer sur le lien', 'اضغط على الرابط', 'انقر هنا', 'dkhul l lien',
];

const FORWARD_OTP_PATTERNS = [
  /صيفطت?\s*(?:ليك|لك)\s*(?:كود|الكود)/i,
  /غلطت?\s*و?\s*(?:رسلت|صيفطت)\s*لك\s*(?:كود|الكود)/i,
  /عفاك\s*(?:رجعو|صيفطو)\s*ليا/i,
  /كود\s*(?:لي|الذي)\s*وصلك/i,
  /renvoy(?:er|ez)\s*le\s*code/i,
  /envoy(?:er|ez)\s*moi\s*le\s*code/i,
  /code\s*(?:reçu|envoyé\s*par\s*erreur)/i,
  /forward\s*(?:the\s*)?(?:verification|otp|code)/i,
  /send\s*back\s*the\s*code/i,
  /عطيني\s*الكود/i,
  /a3tini\s*l\s*code/i,
  /donne[zr]?\s*(?:moi)?\s*(?:le)?\s*(?:code|otp)/i,
];

// Direct CVV / PIN / Secret password demand
const SENSITIVE_CREDENTIALS_REQUEST = [
  /(?:cvv|cvc|code\s*pin|code\s*secret|code\s*confidentiel|mot\s*de\s*passe\s*bancaire|الرقم\s*السري|رمز\s*الامان)/i,
  /(?:entrez|donnez|saisissez|saisir|renseigner)\s*(?:vos\s*coordonn[ée]es\s*bancaires|votre\s*carte|le\s*cryptogramme|votre\s*cvv)/i,
];

// Lookalike or suspicious phishing domains mimicking Moroccan banks & services
const LOOKALIKE_FINANCIAL_DOMAINS = [
  /(?:https?:\/\/)?(?:[a-zA-Z0-9\-]+\.)?(?:cih|attijari|wafabank|banquepopulaire|chaabi|bmce|bankofafrica|sgmb|baridbank|amana|wafacash|cashplus)[\-_][a-zA-Z0-9\-]+\.[a-zA-Z]{2,}/i,
  /(?:https?:\/\/)?[a-zA-Z0-9\-]+(?:-securite|-connexion|-espace|-verification|-compte|-login|-auth|-bloque|-alerte)\.(?:com|me|online|site|xyz|top|tk|cf|ga|ml|shop)/i,
];

// Urgency combined with money transfer
const URGENCY_PLUS_TRANSFER_PATTERNS = [
  /(?:urgent|bloqu[ée]|suspendu|daba|imm[ée]diatement|zarba|ضروري|عاجل).{1,80}(?:virement|virer|wafacash|cash\s*plus|flous|صيفط|فلوس|تحويل|avance|caution|payer)/i,
  /(?:virement|virer|wafacash|cash\s*plus|flous|صيفط|فلوس|تحويل).{1,80}(?:urgent|bloqu[ée]|suspendu|daba|imm[ée]diatement|zarba|ضروري|عاجل)/i,
];

// Fake buyer / Marketplace overpayment trap
const FAKE_BUYER_OVERPAYMENT_PATTERNS = [
  /(?:avito|marketplace|vendeur|acheteur).{1,80}(?:recevoir\s*(?:l'argent|les\s*fonds|le\s*paiement)|cliquez\s*pour\s*encaisser|recevez\s*vos\s*fonds|lien\s*de\s*r[ée]ception)/i,
  /(?:trop-perçu|surpay[ée]|erreur\s*de\s*montant).{1,80}(?:rembourser|renvoyer|wafacash|cash\s*plus|virement)/i,
  /(?:coursier|livreur\s*ctm|livreur\s*amana).{1,80}(?:cliquez\s*sur\s*ce\s*lien|entrez\s*vos\s*coordonn[ée]es\s*bancaires)/i,
];

// SIM Swap pretext
const SIM_SWAP_PATTERNS = [
  /(?:carte\s*sim|sim\s*swap|d[ée]sactivation\s*de\s*votre\s*ligne|puce\s*bloqu[ée]|r[ée]activer\s*votre\s*ligne|changement\s*de\s*carte\s*sim|شريحة|ايقاف\s*الخط|تفعيل\s*البطاقة).{1,80}(?:code|sms|otp|lien|cin)/i,
  /(?:inwi|orange|iam|maroc\s*telecom).{1,80}(?:mise\s*à\s*jour\s*ligne|bloqu[ée]|code\s*de\s*confirmation\s*sim)/i,
];

const UPFRONT_FEE_BEFORE_PRIZE_OR_JOB = [
  /(?:gagn|rbeh|ربح|won|prize).{1,60}(?:frais|frais\s*de\s*dossier|payer|avance|recharge|تحويل|مصاريف|بطاقة)/i,
  /(?:visa|contrat|emploi|recrutement|عمل|وظيفة).{1,60}(?:frais\s*de\s*dossier|visite\s*m[ée]dicale|avance|virement|wafacash|cash\s*plus|رسوم)/i,
  /(?:colis|amana|barid|chronopost|طرد).{1,60}(?:frais|dh|payez|régulariser|15\s*dh|20\s*dh|دفع|رسوم)/i,
  /(?:remboursement|dgi|cnss|cnops|استرجاع).{1,60}(?:coordonn[ée]es\s*bancaires|carte|rib|cvv|bit\.ly)/i,
  /(?:سلفة|قرض|prêt|crédit).{1,60}(?:frais|مصاريف|dossier|avance)/i,
];

const SHORTLINK_PATTERNS = [
  /bit\.ly\/[a-zA-Z0-9_\-]+/i,
  /tinyurl\.com\/[a-zA-Z0-9_\-]+/i,
  /is\.gd\/[a-zA-Z0-9_\-]+/i,
  /cutt\.ly\/[a-zA-Z0-9_\-]+/i,
  /t\.ly\/[a-zA-Z0-9_\-]+/i,
  /rb\.gy\/[a-zA-Z0-9_\-]+/i,
  /t\.me\/[a-zA-Z0-9_\-]+/i,
  /wa\.me\/[0-9]+/i,
  /http:\/\/[^\s]+/i, // Non-secure plain HTTP links
];

export function runDeterministicGuardrail(text: string): GuardrailResult {
  const normalized = text.toLowerCase();
  const triggered_rules: string[] = [];
  const matched_keywords: string[] = [];
  let verdict: Verdict = 'safe';
  let category: PaymentScamCategory = 'other';
  let forced = false;

  // 1. Check Forwarding OTP rule (Force SCAM)
  for (const regex of FORWARD_OTP_PATTERNS) {
    if (regex.test(normalized)) {
      verdict = 'scam';
      category = 'otp_request';
      forced = true;
      triggered_rules.push('RULE_FORWARD_OTP: Direct request to forward verification code or SMS OTP');
      matched_keywords.push('forward_otp_hijack');
      break;
    }
  }

  // 1b. Check Direct CVV / PIN / Secret password demand (Force SCAM)
  for (const regex of SENSITIVE_CREDENTIALS_REQUEST) {
    if (regex.test(normalized)) {
      verdict = 'scam';
      category = 'otp_request';
      forced = true;
      triggered_rules.push('RULE_PAYMENT_CREDENTIALS: Request for credit card CVV, PIN code, or banking credentials');
      matched_keywords.push('payment_credentials_demand');
      break;
    }
  }

  // 1c. Lookalike or phishing bank domain (Force SCAM)
  for (const regex of LOOKALIKE_FINANCIAL_DOMAINS) {
    if (regex.test(text)) {
      verdict = 'scam';
      category = 'fake_bank_sms';
      forced = true;
      triggered_rules.push('RULE_LOOKALIKE_BANK_DOMAIN: Cloned or lookalike Moroccan bank/payment domain');
      matched_keywords.push('lookalike_bank_domain');
      break;
    }
  }

  // 1d. Urgency + Money transfer (Force SCAM)
  for (const regex of URGENCY_PLUS_TRANSFER_PATTERNS) {
    if (regex.test(normalized)) {
      verdict = 'scam';
      if (category === 'other') category = 'fake_bank_sms';
      forced = true;
      triggered_rules.push('RULE_URGENCY_PLUS_TRANSFER: High urgency combined with instant money transfer or fee demand');
      matched_keywords.push('urgency_plus_transfer');
      break;
    }
  }

  // 1e. Fake buyer / marketplace overpayment (Force SCAM)
  for (const regex of FAKE_BUYER_OVERPAYMENT_PATTERNS) {
    if (regex.test(normalized)) {
      verdict = 'scam';
      category = 'fake_buyer_or_seller';
      forced = true;
      triggered_rules.push('RULE_FAKE_BUYER_OVERPAYMENT: Marketplace fake buyer, fake receipt link or overpayment refund trap');
      matched_keywords.push('fake_buyer_or_seller_trap');
      break;
    }
  }

  // 1f. SIM Swap pretext (Force SCAM)
  for (const regex of SIM_SWAP_PATTERNS) {
    if (regex.test(normalized)) {
      verdict = 'scam';
      category = 'sim_swap_pretext';
      forced = true;
      triggered_rules.push('RULE_SIM_SWAP_PRETEXT: Pretext alleging line blockage, SIM update, or telecom code interception');
      matched_keywords.push('sim_swap_pretext');
      break;
    }
  }

  // 2. Check Upfront Fee rule (Force SCAM)
  for (const regex of UPFRONT_FEE_BEFORE_PRIZE_OR_JOB) {
    if (regex.test(normalized)) {
      verdict = 'scam';
      forced = true;
      if (/(?:colis|amana|barid|chronopost|طرد)/i.test(normalized)) {
        category = 'fake_delivery_fee';
      } else if (category === 'other') {
        category = 'fake_payment_link_or_qr';
      }
      triggered_rules.push('RULE_UPFRONT_FEE: Fee or bank card requested before prize, job, parcel, refund or loan');
      matched_keywords.push('upfront_fee_trap');
      break;
    }
  }

  // 3. Check Combination: (Reward OR Urgency OR Authority) + Sensitive Data/Action (Force SCAM)
  const normalizedWithoutQrMeta = normalized.replace(
    /qr\s*code|(?:scan|scannez|scanner|scani|امسح)\s*(?:ce|le|un|had|hada|hada\s*l|l)?\s*code/gi,
    'qr_token'
  );
  const normalizedWithoutMotive = normalized.replace(/motif\s*:[^.\n\r]*/gi, '');
  const foundRewards = REWARD_HOOKS.filter((k) => normalizedWithoutMotive.includes(k));
  const foundUrgency = URGENCY_HOOKS.filter((k) => normalized.includes(k));
  const foundAuthority = AUTHORITY_HOOKS.filter((k) => normalized.includes(k));
  const foundSensitive = SENSITIVE_DATA_OR_ACTION.filter((k) =>
    k === 'code' ? normalizedWithoutQrMeta.includes('code') : normalized.includes(k)
  );

  matched_keywords.push(...foundRewards, ...foundUrgency, ...foundAuthority, ...foundSensitive);

  const hasHook = foundRewards.length > 0 || foundUrgency.length > 0 || foundAuthority.length > 0;
  const hasSensitive = foundSensitive.length > 0;

  // Do not flag legitimate emitted/executed transfer notifications without links, urgency, or requests
  const isExecutedTransferNotification =
    /(?:virement\s+(?:de\s+[\d\s]+dh\s+)?(?:[ée]mis|effectu[ée]|re[çc]u|ex[ée]cut[ée])|confirmation\s+de\s+virement|avis\s+d['’]op[ée]ration)/i.test(
      normalized
    ) &&
    !/(?:https?:\/\/|www\.|\.com|\.me|\.ma|\.online|\.site|\.xyz|bit\.ly|tinyurl|is\.gd|cliquez|cliquer|validez|connectez|rembourser|renvoyer|saisissez|code|otp|mot\s*de\s*passe|urgent)/i.test(
      normalized
    );

  if (hasHook && hasSensitive && !isExecutedTransferNotification) {
    verdict = 'scam';
    forced = true;
    if (category === 'other') {
      if (foundAuthority.some((a) => ['cih', 'attijari', 'bcp', 'chaabi', 'bmce', 'bank of africa', 'sgmb'].includes(a))) {
        category = 'fake_bank_sms';
      } else if (foundAuthority.some((a) => ['amana', 'barid', 'chronopost', 'البريد', 'أمانة'].includes(a))) {
        category = 'fake_delivery_fee';
      } else if (normalized.includes('otp') || normalized.includes('كود') || normalized.includes('code')) {
        category = 'otp_request';
      } else {
        category = 'fake_payment_link_or_qr';
      }
    }
    triggered_rules.push('RULE_HOOK_PLUS_SENSITIVE_DATA: Combination of hook (reward/urgency/authority) with request for money, credentials, ID, or suspicious links');
  }

  // 4. Check Shortlinks or suspicious links (At least SUSPICIOUS)
  let hasShortlink = false;
  for (const regex of SHORTLINK_PATTERNS) {
    if (regex.test(text)) {
      hasShortlink = true;
      matched_keywords.push('shortlink_or_insecure_url');
      break;
    }
  }

  if (hasShortlink) {
    triggered_rules.push('RULE_SHORTLINK: Contains shortened or non-verified link');
    if (verdict === 'safe') {
      verdict = 'suspicious';
      if (category === 'other') category = 'fake_payment_link_or_qr';
    }
  }

  // 5. Urgency alone or Unknown authority alone without sensitive data -> SUSPICIOUS
  if (verdict === 'safe' && (foundUrgency.length > 0 || foundRewards.length > 0)) {
    verdict = 'suspicious';
    triggered_rules.push('RULE_UNVERIFIED_URGENCY_OR_PRIZE: Contains high urgency or unverified prize hook');
  }

  // 6. QR Code Guardrail Rules (Escalation only, never downgrade)
  // Extract any decoded QR data present in working text or passed context
  const qrDataItems: string[] = [];
  const qrMatches = text.matchAll(/QR code found in image:\s*([^\n\r]+)/gi);
  for (const m of qrMatches) {
    if (m[1]) qrDataItems.push(m[1].trim());
  }

  const MOROCCAN_BRANDS = [
    'cnss', 'cnops', 'dgi', 'amana', 'chronopost', 'poste', 'barid',
    'cih', 'attijari', 'bcp', 'chaabi', 'bmce', 'bank of africa', 'sgmb',
    'maroc telecom', 'iam', 'inwi', 'orange', 'cash plus', 'wafacash'
  ];

  const hasScanAction = /(?:scan|scannez|scanner|scani|سكان|امسح|فلاشي|flash)/i.test(normalized);
  const hasPrizeRefundFee =
    foundRewards.length > 0 ||
    /(?:remboursement|rembourser|استرجاع|frais|payez|payer|paiement|15\s*dh|20\s*dh|مصاريف|رسوم|دفع)/i.test(normalized);
  const scanForPrizeRefundFee = hasScanAction && hasPrizeRefundFee;

  let qrShortener = false;
  let qrIpAddress = false;
  let qrBrandLookalike = false;

  for (const qrData of qrDataItems) {
    const qrLower = qrData.toLowerCase();
    // Shortener URL
    if (/(?:bit\.ly|tinyurl\.com|is\.gd|cutt\.ly|t\.ly|rb\.gy|shorturl\.at|ow\.ly|buff\.ly|goo\.gl|wa\.me|t\.me)\//i.test(qrData)) {
      qrShortener = true;
      matched_keywords.push('qr_shortener');
    }
    // IP address URL
    if (/(?:https?:\/\/)?(?:\d{1,3}\.){3}\d{1,3}(?::\d+)?(?:\/|$)/i.test(qrData)) {
      qrIpAddress = true;
      matched_keywords.push('qr_ip_address');
    }
    // Moroccan brand lookalike
    for (const brand of MOROCCAN_BRANDS) {
      if (qrLower.includes(brand)) {
        qrBrandLookalike = true;
        matched_keywords.push(`qr_brand_lookalike_${brand}`);
        break;
      }
    }
  }

  const isQrSuspicious = qrShortener || qrIpAddress || qrBrandLookalike || scanForPrizeRefundFee;
  if (isQrSuspicious) {
    category = 'fake_payment_link_or_qr';
    const hasPaymentOrId =
      /(?:cin\b|cnie\b|carte\s*bancaire|carte\s*nationale|بطاقة|rib\b|cvv\b|paiement|payer\b|payez\b|virement|avance|flous|فلوس|دفع|identifiant|mot\s*de\s*passe|frais|caution|code\s+(?:de\s+confirmation|sms|secret|otp|pin|re[çc]u)|(?:sms|otp)\s+code|رمز\s*التأكيد|كود\s*التأكيد)/i.test(
        normalizedWithoutQrMeta
      );

    if (hasPaymentOrId) {
      verdict = 'scam';
      forced = true;
      triggered_rules.push(
        'RULE_QR_MALICIOUS_PLUS_PAYMENT_OR_ID: QR code with shortener, IP, brand lookalike, or scan lure combined with payment/ID request'
      );
    } else {
      if (verdict === 'safe') {
        verdict = 'suspicious';
      }
      triggered_rules.push(
        'RULE_QR_SUSPICIOUS: QR code points to shortened link, IP address, Moroccan brand lookalike, or scan-for-prize/refund/fee lure'
      );
    }
  }

  // Remove duplicates from matched keywords
  const uniqueKeywords = Array.from(new Set(matched_keywords));

  const reasoning =
    triggered_rules.length > 0
      ? `Deterministic guardrail triggered ${triggered_rules.length} rule(s): ${triggered_rules.join('; ')}`
      : 'No suspicious security patterns or forbidden keyword combinations detected.';

  return {
    verdict,
    category,
    triggered_rules,
    matched_keywords: uniqueKeywords,
    reasoning,
    forced,
  };
}

/**
 * Merge LLM verdict and Guardrail verdict.
 * Rule: Guardrail can ONLY ESCALATE, NEVER DOWNGRADE.
 * safe < suspicious < scam
 * Safe requires ALL of: LLM says safe AND guardrail found nothing AND no request for money/code/personal data/click AND no pattern match AND no urgency.
 */
export function mergeVerdicts(
  llmVerdict: Verdict,
  guardrail: GuardrailResult,
  text: string
): { finalVerdict: Verdict; escalated: boolean } {
  let finalVerdict = compareVerdicts(llmVerdict, guardrail.verdict);
  const escalated = VERDICT_SEVERITY[finalVerdict] > VERDICT_SEVERITY[llmVerdict];

  // Hard safety check: To be 'safe', strict requirements must be satisfied
  if (finalVerdict === 'safe') {
    const hasAnyTrigger = guardrail.triggered_rules.length > 0;
    if (hasAnyTrigger) {
      finalVerdict = 'suspicious';
    }
  }

  return { finalVerdict, escalated };
}
