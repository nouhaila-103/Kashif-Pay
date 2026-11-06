import React, { useState } from 'react';
import {
  ShieldAlert,
  ChevronRight,
  CheckCircle2,
  PhoneCall,
  CreditCard,
  Smartphone,
  ShieldCheck,
  MessageSquare,
  Sparkles,
  ArrowRight,
} from 'lucide-react';
import { FinancialAttackProfile, ExposureReport, Language } from '../../types.ts';
import { translations } from '../../i18n.ts';

interface FinancialAttackSectionProps {
  attackProfile?: FinancialAttackProfile;
  report?: ExposureReport;
  onTestInScamShield?: (text: string) => void;
  lang: Language;
}

export const FinancialAttackSection: React.FC<FinancialAttackSectionProps> = ({
  attackProfile,
  report,
  onTestInScamShield,
  lang,
}) => {
  if (!attackProfile || !attackProfile.ranked_attacks || attackProfile.ranked_attacks.length === 0) {
    return null;
  }

  const t = translations[lang] || translations.fr;
  const faT = t.financialAttack;
  const isRtl = lang === 'ar';

  const [simulation, setSimulation] = useState<{
    attacker_persona?: string;
    attack_vector?: string;
    simulated_message?: string;
    defensive_explanation?: string;
  } | null>(null);
  const [isSimulating, setIsSimulating] = useState(false);

  const getAttackIcon = (id: string) => {
    switch (id) {
      case 'bank_impersonation':
        return <CreditCard className="w-5 h-5" />;
      case 'sim_swap':
        return <Smartphone className="w-5 h-5" />;
      case 'fake_seller_buyer':
        return <PhoneCall className="w-5 h-5" />;
      default:
        return <ShieldAlert className="w-5 h-5" />;
    }
  };

  const getSeverityBadge = (level: string) => {
    switch (level) {
      case 'critical':
        return 'bg-[#FEF2F2] text-[#C0392B] border-[#FECACA]';
      case 'high':
        return 'bg-[#FFF7ED] text-[#C2540A] border-[#FED7AA]';
      case 'medium':
        return 'bg-[#FFFBEB] text-[#B45309] border-[#FDE68A]';
      default:
        return 'bg-[#F0FDF4] text-[#16A34A] border-[#BBF7D0]';
    }
  };

  const handleSimulateAttack = async () => {
    if (!report) return;
    setIsSimulating(true);
    try {
      const res = await fetch('/api/exposure/simulate-attack', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ report }),
      });
      const data = await res.json();
      setSimulation(data);
    } catch (err) {
      console.error(err);
    } finally {
      setIsSimulating(false);
    }
  };

  const scenario = attackProfile.top_attack_scenario;
  const protections = attackProfile.top_attack_protections || [];

  return (
    <div className="rounded-3xl border border-[#DDD6FE] bg-gradient-to-b from-[#FAF8FF] via-white to-[#F5F3FF] p-6 sm:p-8 shadow-sm space-y-6 text-left rtl:text-right animate-in fade-in">
      {/* Section Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#E8E2EE] pb-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-bold uppercase tracking-wider bg-[#EEF2FF] text-[#4F46E5] border border-[#C7D2FE]">
              <ShieldAlert className="w-3.5 h-3.5" />
              FINTECH FRAUD PROFILE · MAROC
            </span>
            <span className="text-[10px] font-medium text-[#706A82] bg-white px-2.5 py-0.5 rounded-full border border-[#E8E2EE]">
              Score calculé par code · Zéro persistance
            </span>
          </div>
          <h2 className="font-serif-headline text-2xl sm:text-3xl font-bold text-[#161824] tracking-tight">
            {faT.title}
          </h2>
          <p className="text-xs sm:text-sm text-[#706A82] max-w-2xl leading-relaxed">
            {faT.subtitle}
          </p>
        </div>
      </div>

      {/* 3 Ranked Attacks Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {attackProfile.ranked_attacks.map((item, idx) => {
          const isTop = idx === 0;
          return (
            <div
              key={item.id}
              className={`rounded-2xl p-4 sm:p-5 border transition-all relative flex flex-col justify-between ${
                isTop
                  ? 'bg-gradient-to-br from-white to-[#FEF2F2] border-[#FECACA] shadow-md ring-2 ring-[#C0392B]/20'
                  : 'bg-white border-[#E8E2EE] shadow-2xs hover:border-[#DDD6FE]'
              }`}
            >
              <div className="space-y-3">
                {/* Rank & Risk Level */}
                <div className="flex items-center justify-between gap-2">
                  <span
                    className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-mono font-black ${
                      isTop
                        ? 'bg-[#C0392B] text-white shadow-xs'
                        : 'bg-[#EDE8F7] text-[#645D73]'
                    }`}
                  >
                    #{item.rank || idx + 1}
                  </span>
                  <span
                    className={`text-[10px] uppercase font-bold px-2 py-0.5 rounded-full border ${getSeverityBadge(
                      item.risk_level
                    )}`}
                  >
                    {item.risk_level.toUpperCase()}
                  </span>
                </div>

                {/* Title & Icon */}
                <div className="flex items-center gap-2.5 pt-1">
                  <div
                    className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${
                      isTop
                        ? 'bg-[#FEF2F2] text-[#C0392B] border border-[#FECACA]'
                        : 'bg-[#FAF8FF] text-[#6366F1] border border-[#DDD6FE]'
                    }`}
                  >
                    {getAttackIcon(item.id)}
                  </div>
                  <h3 className="font-bold text-sm text-[#161824] leading-snug">
                    {item.title}
                  </h3>
                </div>

                {/* Score bar */}
                <div className="space-y-1">
                  <div className="flex justify-between text-[11px] font-semibold text-[#706A82]">
                    <span>{faT.likelihoodLabel}</span>
                    <span className="font-mono font-bold text-[#161824]">{item.score}/100</span>
                  </div>
                  <div className="w-full bg-[#EDE8F7] h-2 rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full ${
                        item.score >= 70
                          ? 'bg-[#C0392B]'
                          : item.score >= 40
                          ? 'bg-[#E07B1A]'
                          : 'bg-[#2E7D4F]'
                      }`}
                      style={{ width: `${item.score}%` }}
                    />
                  </div>
                </div>

                {/* Explanation */}
                <p className="text-xs text-[#645D73] leading-relaxed">
                  {item.explanation}
                </p>
              </div>

              {/* Exploited Data */}
              {item.exploited_data && item.exploited_data.length > 0 && (
                <div className="mt-4 pt-3 border-t border-[#E8E2EE] space-y-1.5">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-[#867F95]">
                    {faT.exploitedCluesLabel}
                  </span>
                  <div className="flex flex-wrap gap-1">
                    {item.exploited_data.map((clue: string, cIdx: number) => (
                      <span
                        key={cIdx}
                        className="text-[10px] px-2 py-0.5 rounded-md bg-[#FAF8FF] border border-[#DDD6FE] text-[#4F46E5] font-medium truncate max-w-full"
                      >
                        {clue}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Top Attack Deep-Dive: Scenario & Protection Steps */}
      {scenario && (
        <div className="rounded-2xl border border-[#FECACA] bg-[#FEF2F2]/40 p-5 sm:p-6 space-y-5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-[#FECACA]/60 pb-3">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-[#C0392B] animate-pulse" />
              <h3 className="font-serif-headline text-lg sm:text-xl font-bold text-[#161824]">
                {faT.topScenarioTitle} : <span className="text-[#C0392B]">{scenario.attack_title}</span>
              </h3>
            </div>
            <span className="text-xs font-semibold text-[#867F95]">
              {faT.topScenarioSub}
            </span>
          </div>

          {/* 3 Step Attack Scenario */}
          {scenario.steps && scenario.steps.length > 0 && (
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {scenario.steps.map((st: { step: number; title: string; detail: string }, idx: number) => (
                <div
                  key={idx}
                  className="p-4 rounded-xl bg-white border border-[#FECACA] shadow-2xs space-y-2 relative"
                >
                  <div className="flex items-center justify-between">
                    <span className="font-mono text-xs font-bold text-[#C0392B] bg-[#FEF2F2] px-2 py-0.5 rounded-md border border-[#FECACA]">
                      {faT.stepPrefix} {st.step || idx + 1}
                    </span>
                    {idx < scenario.steps.length - 1 && (
                      <ChevronRight className="w-4 h-4 text-[#867F95] hidden sm:block rtl:rotate-180" />
                    )}
                  </div>
                  <h4 className="text-xs font-bold text-[#161824]">{st.title}</h4>
                  <p className="text-xs text-[#2C2A36] leading-relaxed font-medium">
                    {st.detail}
                  </p>
                </div>
              ))}
            </div>
          )}

          {/* 3 Concrete Protection Steps */}
          {protections.length > 0 && (
            <div className="space-y-3 pt-3 border-t border-[#FECACA]/60">
              <h4 className="text-xs font-bold uppercase tracking-wider text-[#161824] flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-[#16A34A]" />
                {faT.topProtectionsTitle}
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {protections.map((prot: string, idx: number) => (
                  <div
                    key={idx}
                    className="p-3.5 rounded-xl bg-[#F0FDF4] border border-[#BBF7D0] shadow-2xs flex items-start gap-2.5"
                  >
                    <CheckCircle2 className="w-4 h-4 text-[#16A34A] shrink-0 mt-0.5" />
                    <p className="text-xs text-[#166534] font-medium leading-snug">
                      {prot}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Targeted Spear-Phishing Simulation Generator directly for #1 attack */}
          <div className="mt-5 pt-5 border-t border-[#FECACA]/60 space-y-4">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
              <div>
                <h4 className="text-sm font-bold text-[#161824] flex items-center gap-2">
                  <MessageSquare className="w-4 h-4 text-[#C0392B]" />
                  <span>
                    {lang === 'ar'
                      ? 'محاكاة رسالة الهجوم المالي رقم 1'
                      : lang === 'en'
                      ? 'Simulate Attack Message for #1 Threat'
                      : 'Simulation du message d’attaque ciblé (#1)'}
                  </span>
                </h4>
                <p className="text-xs text-[#706A82] mt-0.5">
                  {lang === 'ar'
                    ? 'يولّد النموذج الرسالة الدقيقة التي قد يرسلها المهاجم لاستغلال هذه الثغرة (SMS بنكي، رسالة مشتري Avito، أو احتيال SIM)'
                    : lang === 'en'
                    ? 'Generates the exact deceptive message an attacker would craft for this dominant vulnerability.'
                    : 'Génère le message frauduleux exact que concevrait un attaquant pour exploiter cette vulnérabilité.'}
                </p>
              </div>

              <button
                onClick={handleSimulateAttack}
                disabled={isSimulating}
                className="px-5 py-2.5 rounded-full bg-gradient-to-r from-[#C0392B] to-[#991B1B] hover:from-[#A8281A] hover:to-[#7F1D1D] text-white text-xs font-bold transition-all shrink-0 shadow-sm flex items-center gap-2"
              >
                {isSimulating ? (
                  <>
                    <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    <span>{lang === 'ar' ? 'جاري المحاكاة...' : lang === 'en' ? 'Simulating...' : 'Génération du message...'}</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>
                      {lang === 'ar'
                        ? 'توليد رسالة الهجوم #1'
                        : lang === 'en'
                        ? 'Generate #1 Attack Message'
                        : 'Simuler le message d’attaque #1'}
                    </span>
                  </>
                )}
              </button>
            </div>

            {/* Generated Attack Message Result */}
            {simulation && simulation.simulated_message && (
              <div className="p-5 rounded-2xl bg-white border border-[#FECACA] space-y-3.5 shadow-sm animate-in fade-in">
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between text-xs border-b border-[#FEE2E2] pb-2 gap-1">
                  <span className="font-bold text-[#C0392B] uppercase tracking-wide flex items-center gap-1.5">
                    🚨 {simulation.attacker_persona || 'Faux expéditeur ciblé'}
                  </span>
                  <span className="font-mono text-[#706A82]">
                    {simulation.attack_vector}
                  </span>
                </div>

                <div className="p-4 rounded-2xl bg-[#FFF8F8] border border-[#FECACA] font-mono text-xs sm:text-sm text-[#161824] whitespace-pre-wrap leading-relaxed shadow-inner">
                  "{simulation.simulated_message}"
                </div>

                <p className="text-xs text-[#645D73] italic leading-relaxed">
                  <strong className="text-[#161824] not-italic">Mécanisme de tromperie :</strong>{' '}
                  {simulation.defensive_explanation}
                </p>

                {/* "Tester ce message dans le Bouclier" CTA Button */}
                {onTestInScamShield && (
                  <div className="pt-2 flex justify-end">
                    <button
                      onClick={() => onTestInScamShield(simulation.simulated_message!)}
                      className="w-full sm:w-auto px-5 py-2.5 rounded-full bg-gradient-to-r from-[#6366F1] to-[#7C3AED] hover:from-[#4F46E5] hover:to-[#6D28D9] text-white text-xs font-bold transition-all flex items-center justify-center gap-2 shadow-sm"
                    >
                      <ShieldAlert className="w-4 h-4" />
                      <span>
                        {lang === 'ar'
                          ? 'اختبر هذه الرسالة في درع الاحتيال'
                          : lang === 'en'
                          ? 'Test this message in Scam Shield'
                          : 'Tester ce message dans le Bouclier'}
                      </span>
                      <ArrowRight className={`w-3.5 h-3.5 ${isRtl ? 'rotate-180' : ''}`} />
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
