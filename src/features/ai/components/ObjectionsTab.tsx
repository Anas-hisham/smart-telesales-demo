import { ChevronDown, MessageCircle, ShieldAlert } from 'lucide-react';
import { useState } from 'react';
import { AiText, CopyButton, EmptyNote } from '@/features/ai/components/aiPrimitives';
import { LIKELIHOOD_STYLE } from '@/features/ai/constants/ai.constants';
import type { LeadAnalysis } from '@/features/ai/types/ai.types';

/** What the customer may say next, and exactly what to answer. The most likely objections come first. */
export function ObjectionsTab({ analysis }: { analysis: LeadAnalysis }) {
  const objections = analysis.predictedObjections;
  const [open, setOpen] = useState<Set<number>>(new Set([0]));
  const toggle = (index: number) => setOpen(previous => { const next = new Set(previous); if (next.has(index)) next.delete(index); else next.add(index); return next; });

  if (objections.length === 0) return <EmptyNote>No objections were predicted for this lead.</EmptyNote>;

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between gap-2">
        <p className="text-sm text-slate-600">{objections.length} objection{objections.length === 1 ? '' : 's'} you may hear. Open one to see the answer.</p>
        <button type="button" onClick={() => setOpen(open.size === objections.length ? new Set() : new Set(objections.map((_, index) => index)))}
          className="text-xs font-medium text-blue-700 hover:underline shrink-0">{open.size === objections.length ? 'Collapse all' : 'Expand all'}</button>
      </div>

      {objections.map((item, index) => {
        const style = LIKELIHOOD_STYLE[item.likelihood];
        const isOpen = open.has(index);
        return (
          <div key={index} className="rounded-xl border border-slate-200 bg-white overflow-hidden">
            <button type="button" onClick={() => toggle(index)} aria-expanded={isOpen} className="w-full flex items-center gap-3 px-4 py-3 text-left hover:bg-slate-50">
              <span className={`w-2.5 h-2.5 rounded-full shrink-0 ${style.dot}`} />
              <span dir="auto" className="flex-1 min-w-0 text-sm font-semibold text-slate-900">“{item.objection}”</span>
              <span className={`text-xs px-2 py-0.5 rounded-full font-medium shrink-0 ${style.chip}`}>{style.label}</span>
              <ChevronDown className={`w-4 h-4 text-slate-400 shrink-0 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
            </button>
            {isOpen && (
              <div className="px-4 pb-4 space-y-3 border-t border-slate-100 pt-3">
                {item.reason && (
                  <div className="flex items-start gap-2">
                    <ShieldAlert className="w-4 h-4 text-amber-600 mt-0.5 shrink-0" />
                    <div><div className="text-xs font-medium text-slate-500 mb-0.5">Why they may say it</div><AiText>{item.reason}</AiText></div>
                  </div>
                )}
                {item.response && (
                  <div className="rounded-xl border border-emerald-200 bg-emerald-50/60 p-3.5">
                    <div className="flex items-center gap-2 mb-1.5">
                      <MessageCircle className="w-4 h-4 text-emerald-700" />
                      <span className="text-xs font-semibold text-emerald-900 flex-1">Say this</span>
                      <CopyButton text={item.response} />
                    </div>
                    <AiText className="text-[15px] leading-7">{item.response}</AiText>
                  </div>
                )}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
