import React from 'react';
import { Cpu, Terminal, ShieldCheck } from 'lucide-react';
import { Language } from '../types.ts';
import { translations } from '../i18n.ts';

interface FooterProps {
  lastExecution?: {
    provider: string;
    model: string;
    latency_ms: number;
    fallback_used?: boolean;
  };
  onOpenDebug: () => void;
  onOpenBenchmarks?: () => void;
  lang: Language;
}

export const Footer: React.FC<FooterProps> = ({
  lastExecution,
  onOpenDebug,
  onOpenBenchmarks,
  lang,
}) => {
  const t = translations[lang];

  return (
    <footer className="w-full border-t border-[#E8E2EE] bg-[#FAF8F5]/90 py-6 mt-16 text-xs text-[#706A82]">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 space-y-4">
        {/* Top footer row: Technical indicator & Benchmark link */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pb-3 border-b border-[#E8E2EE]/70">
          {/* Brand lockup & Hackathon badge */}
          <div className="flex items-center gap-2.5">
            <div className="w-6 h-6 rounded-md bg-gradient-to-tr from-[#6366F1] to-[#8B5CF6] flex items-center justify-center text-white shadow-sm">
              <ShieldCheck className="w-3.5 h-3.5" />
            </div>
            <div className="flex items-baseline gap-2">
              <span className="font-semibold text-[#161824] tracking-tight">Kashif Pay <span className="font-arabic font-normal text-xs text-[#706A82]">كاشف</span></span>
              <span className="text-[11px] text-[#6366F1] font-medium hidden sm:inline">· Vérifie avant de payer</span>
              <span className="text-[11px] px-2 py-0.5 rounded-full bg-[#EEF2FF] text-[#4F46E5] border border-[#C7D2FE] font-medium">
                AI Fintech Hackathon · Alliance Access
              </span>
            </div>
          </div>

          {/* Small footer link opening the Reliability & Benchmarks page */}
          {onOpenBenchmarks && (
            <button
              onClick={onOpenBenchmarks}
              className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#161824] hover:text-[#6366F1] transition-colors underline decoration-[#6366F1]/30 underline-offset-4 hover:decoration-[#6366F1]"
            >
              <span>{t.footer.reliabilityLink}</span>
            </button>
          )}
        </div>

        {/* Middle footer row: Technical execution indicator */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 text-[11px] text-[#706A82]">
          <div className="flex items-center gap-2">
            <Cpu className="w-3.5 h-3.5 text-[#6366F1]" />
            {lastExecution ? (
              <span>
                {t.footer.poweredBy}{' '}
                <span className="font-semibold text-[#161824]">
                  {lastExecution.provider.toUpperCase()} ({lastExecution.model})
                </span>{' '}
                · {(lastExecution.latency_ms / 1000).toFixed(2)}s
                {lastExecution.fallback_used && (
                  <span className="ml-2 rtl:mr-2 text-xs px-2 py-0.5 rounded-full bg-[#FFFBEB] text-[#D97706] border border-[#FDE68A] font-medium">
                    {t.footer.autoFallback}
                  </span>
                )}
              </span>
            ) : (
              <span>{t.footer.stackDesc}</span>
            )}
          </div>

          <button
            onClick={onOpenDebug}
            className="flex items-center gap-1.5 text-[#6B647B] hover:text-[#6366F1] hover:underline transition-colors"
            title="Inspect raw model payload and guardrail debug logs"
          >
            <Terminal className="w-3.5 h-3.5 text-[#6366F1]" />
            <span className="font-mono text-[11px]">{t.footer.debugPanel}</span>
          </button>
        </div>

        {/* Bottom footer row: Responsible AI Disclaimer */}
        <div className="text-[11px] text-[#867F95] text-center sm:text-left rtl:sm:text-right pt-1">
          <span>{t.footer.zeroPersistence}</span>
        </div>
      </div>
    </footer>
  );
};
