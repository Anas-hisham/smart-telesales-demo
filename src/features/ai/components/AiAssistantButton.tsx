import { ChevronRight, Sparkles } from 'lucide-react';
import { useState } from 'react';
import { createPortal } from 'react-dom';
import { LeadAiPanel } from '@/features/ai/components/LeadAiPanel';
import { AI_NAME } from '@/features/ai/constants/ai.constants';
import type { Lead } from '@/domain/types';

/**
 * The entry to the assistant, placed in the lead details (Work Queue drawer and My Leads drawer).
 * The popup is drawn on document.body: the drawers slide in with a CSS transform, which would otherwise trap a fixed popup inside the drawer.
 */
export function AiAssistantButton({ lead }: { lead: Lead }) {
  const [open, setOpen] = useState(false);
  return (
    <>
      <button type="button" onClick={() => setOpen(true)}
        className="w-full flex items-center gap-3 p-3.5 rounded-xl text-left text-white bg-gradient-to-r from-violet-600 to-blue-600 hover:from-violet-700 hover:to-blue-700 shadow-sm transition-all">
        <span className="w-10 h-10 rounded-lg bg-white/20 flex items-center justify-center shrink-0"><Sparkles className="w-5 h-5" /></span>
        <span className="flex-1 min-w-0">
          <span className="block text-sm font-semibold">Prepare with {AI_NAME}</span>
          <span className="block text-xs text-white/85">Call script, likely objections and a customer brief in one click</span>
        </span>
        <ChevronRight className="w-5 h-5 shrink-0 text-white/80" />
      </button>
      {open && createPortal(<LeadAiPanel lead={lead} onClose={() => setOpen(false)} />, document.body)}
    </>
  );
}
