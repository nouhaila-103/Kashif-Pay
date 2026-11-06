import React from 'react';
import {
  QrCode,
  AlertTriangle,
  ShieldAlert,
  Link as LinkIcon,
  Phone,
  Wifi,
  FileText,
  Globe,
  ShieldCheck,
} from 'lucide-react';
import { Language, Verdict } from '../../types.ts';
import { translations } from '../../i18n.ts';

export interface QrCodeItem {
  data: string;
  kind: 'url' | 'phone' | 'wifi' | 'text';
}

export interface QrFindingCardProps {
  qrCodes?: QrCodeItem[];
  lang: Language;
  verdict?: Verdict;
}

// Known official Moroccan financial & utility domains
const VERIFIED_OFFICIAL_DOMAINS = [
  'cihbank.ma',
  'attijariwafabank.com',
  'groupebcp.ma',
  'bpnet.gbp.ma',
  'banquepopulaire.ma',
  'bankofafrica.ma',
  'bmcebank.ma',
  'sgmaroc.com',
  'albaridbank.ma',
  'baridpay.ma',
  'poste.ma',
  'wafacash.com',
  'cashplus.ma',
  'damane-cash.ma',
  'cmi.co.ma',
  'iam.ma',
  'inwi.ma',
  'orange.ma',
];

const KNOWN_SHORTENERS = [
  'bit.ly',
  'tinyurl.com',
  't.co',
  'cutt.ly',
  'is.gd',
  'rb.gy',
  'shorturl.at',
  'rebrand.ly',
  'ow.ly',
  'linktr.ee',
];

function analyzeUrlDestination(urlString: string) {
  try {
    const raw = urlString.trim();
    const url = new URL(raw.startsWith('http://') || raw.startsWith('https://') ? raw : `https://${raw}`);
    const host = url.hostname.toLowerCase();

    const isShortened = KNOWN_SHORTENERS.some((s) => host === s || host.endsWith('.' + s));
    const isOfficial = VERIFIED_OFFICIAL_DOMAINS.some((d) => host === d || host.endsWith('.' + d));

    const moroccanBrands = ['cih', 'attijari', 'wafa', 'chaabi', 'bcp', 'bmce', 'barid', 'amana', 'cashplus', 'damane', 'cmi'];
    const brandMatch = moroccanBrands.find((b) => host.includes(b));
    const isLookalike = !!brandMatch && !isOfficial;

    const isHttp = url.protocol === 'http:';

    return {
      parsed: true,
      protocol: url.protocol,
      hostname: host,
      pathname: url.pathname,
      isShortened,
      isOfficial,
      isLookalike,
      brandMatch,
      isHttp,
    };
  } catch {
    return {
      parsed: false,
      hostname: urlString,
      isShortened: false,
      isOfficial: false,
      isLookalike: false,
      brandMatch: undefined,
      isHttp: false,
    };
  }
}

export const QrFindingCard: React.FC<QrFindingCardProps> = ({ qrCodes, lang, verdict }) => {
  if (!qrCodes || qrCodes.length === 0) {
    return null;
  }

  const t = translations[lang] || translations.fr;

  // Check if any detected QR code contains a link/URL
  const hasLink = qrCodes.some(
    (item) =>
      item.kind === 'url' ||
      item.data.startsWith('http://') ||
      item.data.startsWith('https://') ||
      /^[a-zA-Z0-9-]+\.[a-zA-Z]{2,}/.test(item.data.trim())
  );

  const isMediumOrHigher = verdict === 'suspicious' || verdict === 'scam';
  // Rule 4: Show the red banner "Ne scannez pas et n'ouvrez pas ce lien" ONLY when risk is MEDIUM or higher AND a link/destination exists
  const showRedWarningBanner = isMediumOrHigher && hasLink;
  const isPlainPayload = !hasLink;

  const getKindIcon = (kind: QrCodeItem['kind']) => {
    switch (kind) {
      case 'url':
        return <LinkIcon className="w-3.5 h-3.5" />;
      case 'phone':
        return <Phone className="w-3.5 h-3.5" />;
      case 'wifi':
        return <Wifi className="w-3.5 h-3.5" />;
      default:
        return <FileText className="w-3.5 h-3.5" />;
    }
  };

  return (
    <div
      className={`rounded-3xl p-5 sm:p-6 shadow-sm space-y-4 text-left rtl:text-right animate-in fade-in transition-all ${
        showRedWarningBanner
          ? verdict === 'scam'
            ? 'border border-[#FECACA] bg-[#FEF2F2]'
            : 'border border-[#FED7AA] bg-[#FFF7ED]'
          : 'border border-[#E2E8F0] bg-[#F8FAFC]'
      }`}
    >
      {/* Header bar */}
      <div
        className={`flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b ${
          showRedWarningBanner ? 'border-current/15' : 'border-[#E2E8F0]'
        }`}
      >
        <div className="flex items-center gap-3">
          <div
            className={`w-10 h-10 rounded-2xl flex items-center justify-center shrink-0 shadow-xs ${
              showRedWarningBanner
                ? verdict === 'scam'
                  ? 'bg-[#C0392B] text-white'
                  : 'bg-[#C2540A] text-white'
                : 'bg-[#EEF2FF] text-[#4F46E5] border border-[#C7D2FE]'
            }`}
          >
            {isPlainPayload ? <FileText className="w-5 h-5" /> : <QrCode className="w-5 h-5" />}
          </div>
          <div>
            <span
              className={`text-[10px] font-bold uppercase tracking-wider ${
                showRedWarningBanner
                  ? verdict === 'scam'
                    ? 'text-[#C0392B]'
                    : 'text-[#C2540A]'
                  : 'text-[#64748B]'
              }`}
            >
              {isPlainPayload
                ? lang === 'ar'
                  ? 'معاينة الحمولة النصية'
                  : lang === 'en'
                  ? 'Plain Payload Inspection'
                  : 'Inspection de charge utile textuelle'
                : lang === 'ar'
                ? 'فحص وجهة الدفع وQR'
                : 'Analyse de destination paiement QR / Lien'}
            </span>
            <h3
              className={`font-serif-headline text-lg sm:text-xl font-bold ${
                showRedWarningBanner
                  ? verdict === 'scam'
                    ? 'text-[#991B1B]'
                    : 'text-[#9A3412]'
                  : 'text-[#1E293B]'
              }`}
            >
              {isPlainPayload
                ? lang === 'ar'
                  ? 'المحتوى المفكوك : نص عادي'
                  : lang === 'en'
                  ? 'Decoded content: Plain text'
                  : 'Contenu décodé : texte brut'
                : t.qrCard.title}
            </h3>
          </div>
        </div>

        {/* Warning badge (ONLY when risk is MEDIUM or higher AND a link/destination exists) */}
        {showRedWarningBanner ? (
          <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider bg-[#FEF2F2] text-[#C0392B] border border-[#FECACA] shrink-0 self-start sm:self-auto shadow-2xs">
            <AlertTriangle className="w-3.5 h-3.5 shrink-0" />
            <span>{t.qrCard.warningText}</span>
          </div>
        ) : (
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium bg-white text-[#475569] border border-[#CBD5E1] shrink-0 self-start sm:self-auto shadow-2xs">
            <FileText className="w-3.5 h-3.5 text-[#64748B]" />
            <span>
              {lang === 'ar' ? 'نص عادي بدون روابط' : lang === 'en' ? 'Plain text (no links)' : 'Texte brut (aucun lien)'}
            </span>
          </div>
        )}
      </div>

      {/* List of detected codes */}
      <div className="space-y-3">
        {qrCodes.map((item, idx) => {
          const kindLabel = t.qrCard.kindLabels[item.kind] || item.kind.toUpperCase();
          const isUrl =
            item.kind === 'url' ||
            item.data.startsWith('http://') ||
            item.data.startsWith('https://') ||
            /^[a-zA-Z0-9-]+\.[a-zA-Z]{2,}/.test(item.data.trim());
          const urlAnalysis = isUrl ? analyzeUrlDestination(item.data) : null;

          return (
            <div
              key={idx}
              className={`p-4 sm:p-5 rounded-2xl bg-white shadow-2xs space-y-3 ${
                showRedWarningBanner ? 'border border-[#FED7AA]' : 'border border-[#E2E8F0]'
              }`}
            >
              {/* Kind & label */}
              <div className="flex items-center justify-between gap-2">
                <span className="text-xs font-semibold text-[#64748B]">
                  {isUrl
                    ? t.qrCard.decodedLabel
                    : lang === 'ar'
                    ? 'المحتوى المقروء من رمز QR :'
                    : lang === 'en'
                    ? 'Decoded QR payload:'
                    : 'Contenu décodé du QR code :'}
                </span>
                <span
                  className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold uppercase ${
                    isUrl
                      ? 'bg-[#FFF7ED] border border-[#FED7AA] text-[#C2540A]'
                      : 'bg-[#F1F5F9] border border-[#E2E8F0] text-[#475569]'
                  }`}
                >
                  {getKindIcon(item.kind)}
                  {isUrl ? kindLabel : lang === 'ar' ? 'نص عادي' : 'Texte brut'}
                </span>
              </div>

              {/* Decoded verbatim payload (no empty or misleading Destination block for plain text) */}
              <div className="p-3.5 rounded-xl bg-[#F8FAFC] border border-[#E2E8F0] font-mono text-xs sm:text-sm text-[#0F172A] break-all select-all font-semibold flex items-center justify-between gap-2">
                <span>{item.data}</span>
                {isUrl && (
                  <span className="text-[10px] font-sans font-normal text-[#867F95] shrink-0">
                    {lang === 'ar' ? 'الوجهة' : 'Destination'}
                  </span>
                )}
              </div>

              {/* URL Destination Deep Flags (ONLY when payload is an actual URL) */}
              {urlAnalysis && (
                <div className="space-y-2 pt-1">
                  {urlAnalysis.isLookalike && (
                    <div className="p-3 rounded-xl bg-[#FEF2F2] border border-[#FECACA] text-xs text-[#C0392B] flex items-start gap-2 font-medium">
                      <ShieldAlert className="w-4 h-4 shrink-0 text-[#C0392B] mt-0.5" />
                      <div>
                        <span className="font-bold">
                          {lang === 'ar'
                            ? `نطاق منتحل للعلامة (${urlAnalysis.brandMatch})!`
                            : `Domaine usurpateur / imitateur (${urlAnalysis.brandMatch})!`}
                        </span>{' '}
                        {lang === 'ar'
                          ? `هذا العنوان (${urlAnalysis.hostname}) لا يتبع للبوابة الرسمية المعتمدة في المغرب.`
                          : `Ce domaine (${urlAnalysis.hostname}) n'est PAS le portail officiel de la banque.`}
                      </div>
                    </div>
                  )}

                  {urlAnalysis.isShortened && (
                    <div className="p-3 rounded-xl bg-[#FFFBEB] border border-[#FDE68A] text-xs text-[#B45309] flex items-start gap-2 font-medium">
                      <AlertTriangle className="w-4 h-4 shrink-0 text-[#D97706] mt-0.5" />
                      <div>
                        <span className="font-bold">
                          {lang === 'ar' ? 'رابط مختصر يخفي الوجهة الحقيقية' : 'Lien raccourci masquant la destination finale'}
                        </span>{' '}
                        ({urlAnalysis.hostname}) -{' '}
                        {lang === 'ar'
                          ? 'تكتيك متكرر في فواتير الطرود والاحتيال البنكي.'
                          : 'Technique courante pour dissimuler un site de phishing bancaire.'}
                      </div>
                    </div>
                  )}

                  {!urlAnalysis.isOfficial && !urlAnalysis.isLookalike && !urlAnalysis.isShortened && (
                    <div className="p-3 rounded-xl bg-[#FFF7ED] border border-[#FED7AA] text-xs text-[#C2540A] flex items-start gap-2 font-medium">
                      <Globe className="w-4 h-4 shrink-0 text-[#C2540A] mt-0.5" />
                      <div>
                        <span className="font-bold">
                          {lang === 'ar' ? 'وجهة دفع غير موثقة رسمياً' : 'Destination de paiement inconnue / non agréée'}
                        </span>{' '}
                        ({urlAnalysis.hostname}).{' '}
                        {lang === 'ar'
                          ? 'لا تدخل بطاقتك البنكية أو كلمة سر حسابك.'
                          : 'Ne saisissez jamais vos identifiants ou numéros de carte.'}
                      </div>
                    </div>
                  )}

                  {urlAnalysis.isOfficial && (
                    <div className="p-3 rounded-xl bg-[#F0FDF4] border border-[#BBF7D0] text-xs text-[#16A34A] flex items-start gap-2 font-medium">
                      <ShieldCheck className="w-4 h-4 shrink-0 text-[#16A34A] mt-0.5" />
                      <div>
                        <span className="font-bold">
                          {lang === 'ar' ? 'نطاق رسمي موثق' : 'Domaine officiel vérifié'}
                        </span>{' '}
                        ({urlAnalysis.hostname})
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Imperative safety action footer (ONLY when risk is MEDIUM or higher AND a link/destination exists) */}
      {showRedWarningBanner && (
        <div className="pt-1 flex items-center gap-2 text-xs font-bold text-[#C0392B]">
          <ShieldAlert className="w-4 h-4 shrink-0" />
          <span>{t.qrCard.warningText}</span>
        </div>
      )}
    </div>
  );
};
