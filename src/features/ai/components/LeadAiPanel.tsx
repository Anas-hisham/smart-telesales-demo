import { AlertTriangle, Languages, RefreshCw, Sparkles, Target, X, ArrowRight } from 'lucide-react';
import { useEffect, useState } from 'react';
import { BriefTab } from '@/features/ai/components/BriefTab';
import { NextStepsTab } from '@/features/ai/components/NextStepsTab';
import { ObjectionsTab } from '@/features/ai/components/ObjectionsTab';
import { ScriptTab } from '@/features/ai/components/ScriptTab';
import { AI_LANG_KEY, AI_LANG_OPTIONS, AI_NAME, AI_TAGLINE, INTENT_STYLE } from '@/features/ai/constants/ai.constants';
import { useLeadAnalysis } from '@/features/ai/hooks/useLeadAnalysis';
import type { AiLang, LeadAnalysis } from '@/features/ai/types/ai.types';
import type { Lead } from '@/domain/types';

type TabId = 'script' | 'objections' | 'brief' | 'next';

function loadLang(): AiLang {
  try {
    const saved = localStorage.getItem(AI_LANG_KEY);
    if (AI_LANG_OPTIONS.some(option => option.value === saved)) return saved as AiLang;
  } catch { /* storage blocked */ }
  return 'ar_en';
}

const LOADING_STEPS = ['Reading the call history…', 'Checking the company knowledge…', 'Preparing your call script…', 'Predicting the objections…', 'Almost ready…'];

function LoadingView() {
  const [step, setStep] = useState(0);
  useEffect(() => {
    const timer = setInterval(() => setStep(previous => Math.min(previous + 1, LOADING_STEPS.length - 1)), 700);
    return () => clearInterval(timer);
  }, []);
  return (
    <div className="flex-1 flex flex-col items-center justify-center gap-4 p-8 text-center" role="status" aria-live="polite">
      <div className="relative w-14 h-14">
        <div className="absolute inset-0 rounded-full border-4 border-violet-100" />
        <div className="absolute inset-0 rounded-full border-4 border-transparent border-t-violet-600 animate-spin" />
        <Sparkles className="absolute inset-0 m-auto w-6 h-6 text-violet-600" />
      </div>
      <div>
        <p className="text-sm font-semibold text-slate-900">{LOADING_STEPS[step]}</p>
        <p className="text-xs text-slate-500 mt-1">Demo mode: the analysis is simulated from this lead's data.</p>
      </div>
    </div>
  );
}

function describeError(error: unknown): { title: string; hint: string } {
  return { title: 'Could not get the analysis', hint: error instanceof Error ? error.message : 'Try again in a moment.' };
}

function ErrorView({ error, onRetry }: { error: unknown; onRetry: () => void }) {
  const { title, hint } = describeError(error);
  return (
    <div className="flex-1 flex flex-col items-center justify-center gap-3 p-8 text-center" role="alert">
      <div className="w-12 h-12 rounded-full bg-rose-100 flex items-center justify-center"><AlertTriangle className="w-6 h-6 text-rose-600" /></div>
      <div><p className="text-sm font-semibold text-slate-900">{title}</p><p className="text-sm text-slate-600 mt-1 max-w-sm">{hint}</p></div>
      <button type="button" onClick={onRetry} className="px-4 py-2 rounded-lg text-sm font-medium text-white bg-violet-600 hover:bg-violet-700 flex items-center gap-1.5"><RefreshCw className="w-3.5 h-3.5" />Try again</button>
    </div>
  );
}

/** Three things to know before dialing: the goal of the call, what stands in the way, and the next step. */
function GlanceStrip({ analysis }: { analysis: LeadAnalysis }) {
  const { strategy, opportunity } = analysis;
  const cells = [
    { icon: Target, label: 'Goal of this call', text: strategy.objective },
    { icon: AlertTriangle, label: 'Main obstacle', text: opportunity.mainObstacle },
    { icon: ArrowRight, label: 'Next step', text: opportunity.recommendedNextStep },
  ].filter(cell => cell.text);
  if (cells.length === 0) return null;
  return (
    <div className="grid sm:grid-cols-3 gap-px bg-slate-200 border-b border-slate-200">
      {cells.map(cell => (
        <div key={cell.label} className="bg-white px-4 sm:px-5 py-3">
          <div className="flex items-center gap-1.5 text-xs font-medium text-slate-500 mb-1"><cell.icon className="w-3.5 h-3.5" />{cell.label}</div>
          <p dir="auto" className="text-sm text-slate-900 font-medium leading-snug">{cell.text}</p>
        </div>
      ))}
    </div>
  );
}

/**
 * The popup of the AI assistant. Opens on a lead, asks the server for the analysis and shows it as a call guide:
 * Script (what to say) / Objections (what they may answer) / Brief (who they are) / Next steps (what to do after).
 */
export function LeadAiPanel({ lead, onClose }: { lead: Lead; onClose: () => void }) {
  const [lang, setLang] = useState<AiLang>(loadLang);
  const [tab, setTab] = useState<TabId>('script');
  const { state, retry, regenerate } = useLeadAnalysis(lead, lang);

  useEffect(() => {
    const closeOnEscape = (event: KeyboardEvent) => { if (event.key === 'Escape') onClose(); };
    document.addEventListener('keydown', closeOnEscape);
    return () => document.removeEventListener('keydown', closeOnEscape);
  }, [onClose]);

  const changeLang = (value: AiLang) => {
    setLang(value);
    try { localStorage.setItem(AI_LANG_KEY, value); } catch { /* storage blocked */ }
  };

  const analysis = state.status === 'ready' ? state.result.analysis : null;
  const firstCall = lead.callLogs.length === 0;
  const tabs: { id: TabId; label: string; count?: number }[] = [
    { id: 'script', label: 'Script' },
    { id: 'objections', label: 'Objections', count: analysis?.predictedObjections.length },
    { id: 'brief', label: 'Customer brief' },
    { id: 'next', label: 'Next steps' },
  ];

  return (
    <div className="fixed inset-0 z-[70] flex items-end sm:items-center justify-center" role="dialog" aria-modal="true" aria-label={AI_NAME}>
      <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm animate-fade-in" onClick={onClose} />
      <div className="relative bg-white w-full sm:max-w-4xl sm:mx-4 rounded-t-2xl sm:rounded-2xl shadow-2xl animate-slide-up h-[92dvh] sm:h-[88dvh] flex flex-col overflow-hidden">

        {/* Header */}
        <div className="bg-gradient-to-r from-violet-600 to-blue-600 text-white px-4 sm:px-6 py-4 flex items-center gap-3 shrink-0">
          <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center shrink-0"><Sparkles className="w-5 h-5" /></div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <h2 className="text-base sm:text-lg font-bold leading-tight">{AI_NAME}</h2>
              <span className="text-[10px] font-bold tracking-wide px-1.5 py-0.5 rounded bg-white/25">AI</span>
              {analysis && <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${INTENT_STYLE[analysis.opportunity.intent].className}`}>{INTENT_STYLE[analysis.opportunity.intent].label}</span>}
            </div>
            <p className="text-xs sm:text-sm text-white/85 truncate">{lead.leadCode} • {lead.companyName} • {lead.contactName}</p>
          </div>
          <label className="hidden sm:flex items-center gap-1.5 text-xs text-white/90 shrink-0">
            <Languages className="w-4 h-4" />
            <select value={lang} onChange={event => changeLang(event.target.value as AiLang)} aria-label="Language of the analysis"
              className="bg-white/15 border border-white/25 rounded-lg px-2 py-1.5 text-xs text-white focus:outline-none">
              {AI_LANG_OPTIONS.map(option => <option key={option.value} value={option.value} className="text-slate-900">{option.label}</option>)}
            </select>
          </label>
          <button type="button" onClick={regenerate} disabled={state.status === 'loading'} title="Write a new analysis" aria-label="Regenerate"
            className="w-9 h-9 rounded-lg bg-white/15 hover:bg-white/25 flex items-center justify-center shrink-0 disabled:opacity-50"><RefreshCw className={`w-4 h-4 ${state.status === 'loading' ? 'animate-spin' : ''}`} /></button>
          <button type="button" onClick={onClose} aria-label="Close" className="w-9 h-9 rounded-lg bg-white/15 hover:bg-white/25 flex items-center justify-center shrink-0"><X className="w-4 h-4" /></button>
        </div>

        {state.status === 'loading' && <LoadingView />}
        {state.status === 'error' && <ErrorView error={state.error} onRetry={retry} />}

        {analysis && state.status === 'ready' && (
          <>
            <GlanceStrip analysis={analysis} />

            {/* Tabs */}
            <div className="flex gap-1 px-3 sm:px-5 pt-2 border-b border-slate-200 overflow-x-auto scrollbar-thin shrink-0" role="tablist">
              {tabs.map(item => (
                <button key={item.id} type="button" role="tab" aria-selected={tab === item.id} onClick={() => setTab(item.id)}
                  className={`px-3.5 py-2.5 text-sm font-medium border-b-2 -mb-px whitespace-nowrap transition-colors ${tab === item.id ? 'border-violet-600 text-violet-700' : 'border-transparent text-slate-500 hover:text-slate-800'}`}>
                  {item.label}
                  {item.count !== undefined && item.count > 0 && <span className={`ml-1.5 text-xs px-1.5 py-0.5 rounded-full ${tab === item.id ? 'bg-violet-100 text-violet-700' : 'bg-slate-100 text-slate-600'}`}>{item.count}</span>}
                </button>
              ))}
            </div>

            <div className="flex-1 overflow-y-auto scrollbar-thin px-4 sm:px-6 py-5 bg-slate-50/60" role="tabpanel">
              {firstCall && (
                <p className="mb-4 text-xs rounded-lg bg-blue-50 border border-blue-100 text-blue-800 px-3 py-2">
                  First call with this lead: this plan is built from the company knowledge and the campaign. Write good call notes and the next analysis will be much sharper.
                </p>
              )}
              {tab === 'script' && <ScriptTab analysis={analysis} />}
              {tab === 'objections' && <ObjectionsTab analysis={analysis} />}
              {tab === 'brief' && <BriefTab analysis={analysis} />}
              {tab === 'next' && <NextStepsTab analysis={analysis} />}
            </div>

            <div className="px-4 sm:px-6 py-2.5 border-t border-slate-200 bg-white flex items-center justify-between gap-3 text-xs text-slate-500 shrink-0">
              <span className="min-w-0 truncate">{AI_TAGLINE}. Suggestions come from your call notes and the company knowledge — check anything important before promising it.</span>
              <span className="shrink-0">{state.result.cached ? 'Saved' : 'New'} · {new Date(state.result.generatedAt).toLocaleString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}</span>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
