import React, { useState } from 'react';
import {
  ShieldCheck,
  Server,
  Zap,
  Lock,
  Code2,
  Copy,
  Check,
  Play,
  ArrowRight,
  Database,
  Layers,
  Sparkles,
  BarChart3,
  Activity,
  AlertTriangle,
  Building2,
  Phone,
  FileCheck,
} from 'lucide-react';
import { Language } from '../../types.ts';
import { translations } from '../../i18n.ts';

interface B2BModuleProps {
  lang: Language;
}

export const B2BModule: React.FC<B2BModuleProps> = ({ lang }) => {
  const t = translations[lang] || translations.fr;
  const b2bT = t.b2b;

  const [requestChannel, setRequestChannel] = useState<'sms' | 'whatsapp' | 'transfer_note'>('sms');
  const [requestSender, setRequestSender] = useState('CIH-ALERT');
  const [requestText, setRequestText] = useState(
    'CIH BANK: Votre compte a été temporairement restreint pour activité inhabituelle. Validez immédiatement vos accès sur: http://cih-securite-login.com/auth'
  );
  const [isLoading, setIsLoading] = useState(false);
  const [apiResponse, setApiResponse] = useState<any>(null);
  const [copiedCode, setCopiedCode] = useState(false);
  const [activeCodeTab, setActiveCodeTab] = useState<'curl' | 'node' | 'python'>('curl');

  const presetScenarios = [
    {
      label: 'Phishing SMS CIH',
      channel: 'sms' as const,
      sender: 'CIH-SECURE',
      text: 'CIH BANK: Votre compte a été temporairement restreint pour activité inhabituelle. Validez immédiatement vos accès sur: http://cih-securite-login.com/auth',
    },
    {
      label: 'Arnaque Virement Avito (Darija)',
      channel: 'whatsapp' as const,
      sender: '+212612345678',
      text: "Salam khoya, 3jebni l-article f Avito. Sifett lik 1500 DH au lieu de 1000 DH par virement instantané Wafacash. 3afak sift liya 500 DH de différence f hed le lien avant que le virement s'annule.",
    },
    {
      label: 'Notification virement légitime',
      channel: 'transfer_note' as const,
      sender: 'Banque Populaire',
      text: 'Virement de 250 DH émis vers Salma B. Motif: Cadeau anniversaire. Référence: BCP-9021-392.',
    },
  ];

  const handleTestApi = async () => {
    setIsLoading(true);
    try {
      const res = await fetch('/api/v1/check', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          channel: requestChannel,
          sender: requestSender,
          text: requestText,
          language: lang,
        }),
      });
      const data = await res.json();
      setApiResponse({
        status: res.status,
        statusText: res.statusText,
        data,
      });
    } catch (err: any) {
      setApiResponse({
        status: 500,
        statusText: 'Error',
        data: { error: err.message || 'Network error connecting to API' },
      });
    } finally {
      setIsLoading(false);
    }
  };

  const getCurlSnippet = () => {
    return `curl -X POST https://api.kashifpay.ma/api/v1/check \\
  -H "Content-Type: application/json" \\
  -H "Authorization: Bearer YOUR_FINTECH_API_KEY" \\
  -d '{
    "channel": "${requestChannel}",
    "sender": "${requestSender}",
    "text": "${requestText.replace(/"/g, '\\"')}",
    "language": "${lang}"
  }'`;
  };

  const getNodeSnippet = () => {
    return `const response = await fetch("https://api.kashifpay.ma/api/v1/check", {
  method: "POST",
  headers: {
    "Content-Type": "application/json",
    "Authorization": "Bearer YOUR_FINTECH_API_KEY"
  },
  body: JSON.stringify({
    channel: "${requestChannel}",
    sender: "${requestSender}",
    text: "${requestText.replace(/"/g, '\\"')}",
    language: "${lang}"
  })
});
const result = await response.json();
if (result.verdict === "scam") {
  // Avertir le client ou bloquer le virement instantané
  console.warn("Fraude détectée:", result.category, result.action_recommendation);
}`;
  };

  const getPythonSnippet = () => {
    return `import requests

payload = {
    "channel": "${requestChannel}",
    "sender": "${requestSender}",
    "text": """${requestText}""",
    "language": "${lang}"
}

headers = {
    "Content-Type": "application/json",
    "Authorization": "Bearer YOUR_FINTECH_API_KEY"
}

resp = requests.post("https://api.kashifpay.ma/api/v1/check", json=payload, headers=headers)
data = resp.json()

if data.get("verdict") == "scam":
    print(f"ALERTE FRAUDE: {data.get('category')} - {data.get('action_recommendation')}")`;
  };

  const copyCode = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedCode(true);
    setTimeout(() => setCopiedCode(false), 2000);
  };

  return (
    <div className="w-full max-w-5xl mx-auto space-y-12 text-left rtl:text-right">
      {/* Hero Section */}
      <div className="text-center space-y-4 max-w-3xl mx-auto">
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-gradient-to-r from-[#EEF2FF] to-[#FAF5FF] border border-[#C7D2FE] text-xs font-bold uppercase tracking-widest text-[#4F46E5] shadow-2xs">
          <Building2 className="w-3.5 h-3.5 text-[#4F46E5]" />
          <span>{b2bT.badge}</span>
        </div>
        <h1 className="font-serif-headline text-4xl sm:text-5xl md:text-6xl font-normal text-[#161824] tracking-tight leading-[1.1]">
          {b2bT.title}
        </h1>
        <p className="text-base sm:text-lg text-[#645D73] font-normal leading-relaxed">
          {b2bT.subtitle}
        </p>

        <div className="flex flex-wrap items-center justify-center gap-3 pt-2 text-xs text-[#706A82]">
          <span className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-white border border-[#E8E2EE] shadow-2xs">
            <Zap className="w-3.5 h-3.5 text-[#E07B1A]" />
            Latence sub-seconde (&lt; 650ms)
          </span>
          <span className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-white border border-[#E8E2EE] shadow-2xs">
            <Lock className="w-3.5 h-3.5 text-[#16A34A]" />
            Zéro stockage de données bancaires
          </span>
          <span className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-white border border-[#E8E2EE] shadow-2xs">
            <Server className="w-3.5 h-3.5 text-[#6366F1]" />
            Garde-fous stricts non-contournables
          </span>
        </div>
      </div>

      {/* 3 Core Value Pillars for Banks & Fintechs */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        <div className="p-6 rounded-3xl bg-white border border-[#E8E2EE] shadow-sm space-y-3">
          <div className="w-10 h-10 rounded-2xl bg-[#EEF2FF] text-[#4F46E5] flex items-center justify-center">
            <ShieldCheck className="w-5 h-5" />
          </div>
          <h3 className="font-bold text-base text-[#161824]">
            {b2bT.feature1Title}
          </h3>
          <p className="text-xs text-[#645D73] leading-relaxed">
            {b2bT.feature1Desc}
          </p>
        </div>

        <div className="p-6 rounded-3xl bg-white border border-[#E8E2EE] shadow-sm space-y-3">
          <div className="w-10 h-10 rounded-2xl bg-[#FAF5FF] text-[#7C3AED] flex items-center justify-center">
            <Sparkles className="w-5 h-5" />
          </div>
          <h3 className="font-bold text-base text-[#161824]">
            {b2bT.feature2Title}
          </h3>
          <p className="text-xs text-[#645D73] leading-relaxed">
            {b2bT.feature2Desc}
          </p>
        </div>

        <div className="p-6 rounded-3xl bg-white border border-[#E8E2EE] shadow-sm space-y-3">
          <div className="w-10 h-10 rounded-2xl bg-[#F0FDF4] text-[#16A34A] flex items-center justify-center">
            <Lock className="w-5 h-5" />
          </div>
          <h3 className="font-bold text-base text-[#161824]">
            {b2bT.feature3Title}
          </h3>
          <p className="text-xs text-[#645D73] leading-relaxed">
            {b2bT.feature3Desc}
          </p>
        </div>
      </div>

      {/* Interactive API Sandbox Section */}
      <div className="rounded-3xl border border-[#DDD6FE] bg-white p-6 sm:p-10 shadow-md space-y-8">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#E8E2EE] pb-6">
          <div>
            <div className="flex items-center gap-2">
              <span className="font-mono text-xs font-bold uppercase tracking-wider px-2.5 py-1 rounded-md bg-[#EEF2FF] text-[#4F46E5] border border-[#C7D2FE]">
                POST
              </span>
              <span className="font-mono text-sm sm:text-base font-bold text-[#161824]">
                /api/v1/check
              </span>
            </div>
            <h2 className="font-serif-headline text-2xl font-bold text-[#161824] mt-2">
              {b2bT.apiTitle}
            </h2>
            <p className="text-xs sm:text-sm text-[#706A82] mt-0.5">
              {b2bT.apiSub}
            </p>
          </div>

          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-[#16A34A] animate-pulse" />
            <span className="text-xs font-mono font-semibold text-[#16A34A]">
              Endpoint actif (Live)
            </span>
          </div>
        </div>

        {/* Quick Scenario Preset Pills */}
        <div className="space-y-2">
          <span className="text-xs font-semibold text-[#706A82]">
            Charger un scénario préconfiguré :
          </span>
          <div className="flex flex-wrap gap-2">
            {presetScenarios.map((scen, idx) => (
              <button
                key={idx}
                onClick={() => {
                  setRequestChannel(scen.channel);
                  setRequestSender(scen.sender);
                  setRequestText(scen.text);
                }}
                className="text-xs px-3.5 py-1.5 rounded-xl bg-[#FAF8FF] hover:bg-[#EEF2FF] text-[#161824] border border-[#DDD6EE] hover:border-[#6366F1] font-medium transition-all"
              >
                {scen.label}
              </button>
            ))}
          </div>
        </div>

        {/* Request Input Form */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold uppercase tracking-wider text-[#706A82]">
                Paramètres de la requête
              </label>
              <span className="text-[10px] font-mono text-[#867F95]">application/json</span>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-[11px] font-semibold text-[#645D73] mb-1">
                  Canal (channel)
                </label>
                <select
                  value={requestChannel}
                  onChange={(e) => setRequestChannel(e.target.value as any)}
                  className="w-full text-xs p-2.5 rounded-xl border border-[#DDD6EE] bg-[#FAF8FF] font-mono text-[#161824] outline-none focus:border-[#6366F1]"
                >
                  <option value="sms">sms</option>
                  <option value="whatsapp">whatsapp</option>
                  <option value="transfer_note">transfer_note</option>
                  <option value="qr_scan">qr_scan</option>
                </select>
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-[#645D73] mb-1">
                  Émetteur (sender)
                </label>
                <input
                  type="text"
                  value={requestSender}
                  onChange={(e) => setRequestSender(e.target.value)}
                  placeholder="CIH, Avito, etc."
                  className="w-full text-xs p-2.5 rounded-xl border border-[#DDD6EE] bg-[#FAF8FF] font-mono text-[#161824] outline-none focus:border-[#6366F1]"
                />
              </div>
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-[#645D73] mb-1">
                Contenu du message ou lien à auditer (text / payload)
              </label>
              <textarea
                value={requestText}
                onChange={(e) => setRequestText(e.target.value)}
                rows={5}
                className="w-full text-xs sm:text-sm p-3.5 rounded-xl border border-[#DDD6EE] bg-[#FAF8FF] font-mono text-[#161824] outline-none focus:border-[#6366F1] resize-y"
              />
            </div>

            <button
              onClick={handleTestApi}
              disabled={isLoading || !requestText.trim()}
              className={`w-full py-3.5 rounded-full font-bold text-xs sm:text-sm text-white flex items-center justify-center gap-2 shadow-sm transition-all ${
                isLoading || !requestText.trim()
                  ? 'bg-[#B0A8C0] cursor-not-allowed'
                  : 'bg-gradient-to-r from-[#6366F1] to-[#4F46E5] hover:from-[#4F46E5] hover:to-[#4338CA] active:scale-[0.99]'
              }`}
            >
              {isLoading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  <span>{b2bT.testingBtn}</span>
                </>
              ) : (
                <>
                  <Play className="w-4 h-4 fill-current" />
                  <span>{b2bT.testBtn}</span>
                </>
              )}
            </button>
          </div>

          {/* Response Viewer */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold uppercase tracking-wider text-[#706A82]">
                {b2bT.sampleResTitle}
              </label>
              {apiResponse && (
                <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-full bg-[#F0FDF4] text-[#16A34A] border border-[#BBF7D0]">
                  HTTP {apiResponse.status} OK
                </span>
              )}
            </div>

            <div className="rounded-2xl bg-[#0F172A] border border-[#1E293B] p-4 font-mono text-xs text-[#E2E8F0] overflow-x-auto min-h-[220px] max-h-[300px] select-all shadow-inner">
              {apiResponse ? (
                <pre className="whitespace-pre-wrap leading-relaxed">
                  {JSON.stringify(apiResponse.data, null, 2)}
                </pre>
              ) : (
                <div className="h-full flex flex-col items-center justify-center text-center p-6 text-[#64748B] space-y-2">
                  <Activity className="w-6 h-6 text-[#6366F1] opacity-60 animate-pulse" />
                  <p>Cliquez sur "{b2bT.testBtn}" pour exécuter l'appel API en direct.</p>
                </div>
              )}
            </div>

            {apiResponse && apiResponse.data?.verdict && (
              <div className="p-3 rounded-xl bg-[#FAF8FF] border border-[#DDD6EE] flex items-center justify-between text-xs font-semibold">
                <span>Verdict API :</span>
                <span
                  className={`font-mono font-bold uppercase px-2.5 py-0.5 rounded-md ${
                    apiResponse.data.verdict === 'scam'
                      ? 'bg-[#FEF2F2] text-[#C0392B] border border-[#FECACA]'
                      : apiResponse.data.verdict === 'suspicious'
                      ? 'bg-[#FFF7ED] text-[#C2540A] border border-[#FED7AA]'
                      : 'bg-[#F0FDF4] text-[#16A34A] border border-[#BBF7D0]'
                  }`}
                >
                  {apiResponse.data.verdict} ({apiResponse.data.category || 'other'})
                </span>
              </div>
            )}
          </div>
        </div>

        {/* Code Snippets for SDK integration */}
        <div className="space-y-3 pt-6 border-t border-[#E8E2EE]">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <span className="text-xs font-bold uppercase tracking-wider text-[#706A82]">
              Exemples d'intégration dans votre backend
            </span>

            <div className="flex items-center gap-1 bg-[#FAF8FF] p-1 rounded-xl border border-[#E8E2EE]">
              {(['curl', 'node', 'python'] as const).map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveCodeTab(tab)}
                  className={`text-xs px-3 py-1 rounded-lg font-mono font-medium transition-all ${
                    activeCodeTab === tab
                      ? 'bg-white text-[#4F46E5] shadow-xs border border-[#DDD6EE]'
                      : 'text-[#706A82] hover:text-[#161824]'
                  }`}
                >
                  {tab === 'curl' ? 'cURL' : tab === 'node' ? 'Node.js' : 'Python'}
                </button>
              ))}
            </div>
          </div>

          <div className="relative rounded-2xl bg-[#0F172A] border border-[#1E293B] p-4 font-mono text-xs text-[#E2E8F0] overflow-x-auto">
            <button
              onClick={() => {
                const code =
                  activeCodeTab === 'curl'
                    ? getCurlSnippet()
                    : activeCodeTab === 'node'
                    ? getNodeSnippet()
                    : getPythonSnippet();
                copyCode(code);
              }}
              className="absolute top-3 right-3 rtl:right-auto rtl:left-3 px-2.5 py-1.5 rounded-lg bg-[#1E293B] hover:bg-[#334155] text-xs text-white flex items-center gap-1.5 transition-colors"
            >
              {copiedCode ? <Check className="w-3.5 h-3.5 text-[#4ADE80]" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copiedCode ? 'Copié !' : 'Copier'}</span>
            </button>
            <pre className="whitespace-pre-wrap leading-relaxed pr-16 rtl:pr-0 rtl:pl-16">
              {activeCodeTab === 'curl'
                ? getCurlSnippet()
                : activeCodeTab === 'node'
                ? getNodeSnippet()
                : getPythonSnippet()}
            </pre>
          </div>
        </div>
      </div>

      {/* Demonstrator Mock Dashboard */}
      <div className="rounded-3xl border border-[#FED7AA] bg-[#FFFBEB]/40 p-6 sm:p-8 space-y-6 relative overflow-hidden">
        {/* Prominent Demo Watermark Badge */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#FDE68A] pb-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="text-[11px] font-black uppercase tracking-wider px-3 py-1 rounded-full bg-[#FFFBEB] text-[#B45309] border border-[#FDE68A] shadow-2xs">
                ⚠️ {b2bT.mockNotice}
              </span>
              <span className="text-[11px] text-[#78350F] font-medium hidden sm:inline">
                {b2bT.demoNotice}
              </span>
            </div>
            <h2 className="font-serif-headline text-xl sm:text-2xl font-bold text-[#161824]">
              {b2bT.mockDashboardTitle}
            </h2>
          </div>

          <div className="text-right rtl:text-left text-xs text-[#92400E] font-medium">
            Simulation interbancaire · Hackathon
          </div>
        </div>

        {/* Mock Metric Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="p-4 rounded-2xl bg-white border border-[#FDE68A] shadow-2xs space-y-1">
            <span className="text-[10px] font-bold uppercase tracking-wider text-[#706A82]">
              {b2bT.mockTransfersBlocked}
            </span>
            <div className="font-mono text-2xl font-black text-[#C0392B]">
              1 482
            </div>
            <span className="text-[10px] text-[#92400E]">
              {b2bT.mockNotice} · Simulation sandbox
            </span>
          </div>

          <div className="p-4 rounded-2xl bg-white border border-[#FDE68A] shadow-2xs space-y-1">
            <span className="text-[10px] font-bold uppercase tracking-wider text-[#706A82]">
              {b2bT.mockAvgLatency}
            </span>
            <div className="font-mono text-2xl font-black text-[#4F46E5]">
              410 ms
            </div>
            <span className="text-[10px] text-[#92400E]">
              Temps moyen de réponse mesuré
            </span>
          </div>

          <div className="p-4 rounded-2xl bg-white border border-[#FDE68A] shadow-2xs space-y-1">
            <span className="text-[10px] font-bold uppercase tracking-wider text-[#706A82]">
              {b2bT.mockAccuracy}
            </span>
            <div className="font-mono text-2xl font-black text-[#16A34A]">
              98.4%
            </div>
            <span className="text-[10px] text-[#92400E]">
              Banc d'essai 100 attaques marocaines
            </span>
          </div>
        </div>

        {/* Mock Breakdown Table with Watermark */}
        <div className="rounded-2xl bg-white border border-[#FDE68A] p-4 space-y-3">
          <div className="flex items-center justify-between text-xs font-bold text-[#161824]">
            <span>Répartition des tentatives de fraude interceptées</span>
            <span className="text-[10px] font-mono text-[#B45309] uppercase">
              {b2bT.mockNotice}
            </span>
          </div>

          <div className="space-y-2 text-xs">
            <div className="flex items-center justify-between text-[#645D73]">
              <span className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-[#C0392B]" />
                Faux SMS bancaire (CIH / Attijari)
              </span>
              <span className="font-mono font-semibold">44%</span>
            </div>
            <div className="w-full bg-[#F1F5F9] h-1.5 rounded-full overflow-hidden">
              <div className="bg-[#C0392B] h-full" style={{ width: '44%' }} />
            </div>

            <div className="flex items-center justify-between text-[#645D73]">
              <span className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-[#E07B1A]" />
                Interception OTP / Virement instantané
              </span>
              <span className="font-mono font-semibold">27%</span>
            </div>
            <div className="w-full bg-[#F1F5F9] h-1.5 rounded-full overflow-hidden">
              <div className="bg-[#E07B1A] h-full" style={{ width: '27%' }} />
            </div>

            <div className="flex items-center justify-between text-[#645D73]">
              <span className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-[#6366F1]" />
                Faux acheteur WhatsApp / Avito (surpaiement)
              </span>
              <span className="font-mono font-semibold">18%</span>
            </div>
            <div className="w-full bg-[#F1F5F9] h-1.5 rounded-full overflow-hidden">
              <div className="bg-[#6366F1] h-full" style={{ width: '18%' }} />
            </div>

            <div className="flex items-center justify-between text-[#645D73]">
              <span className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-[#64748B]" />
                Faux frais de douane Amana / Colis
              </span>
              <span className="font-mono font-semibold">11%</span>
            </div>
            <div className="w-full bg-[#F1F5F9] h-1.5 rounded-full overflow-hidden">
              <div className="bg-[#64748B] h-full" style={{ width: '11%' }} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
