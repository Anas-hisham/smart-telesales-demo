import { AlertTriangle, ArrowRight, BookOpen, Clock, ListChecks, ShieldAlert } from 'lucide-react';
import { AiText, BulletList, EmptyNote, Field, SectionCard } from '@/features/ai/components/aiPrimitives';
import type { LeadAnalysis } from '@/features/ai/types/ai.types';

/** After the call: what to do next and when, what to collect, and what could go wrong. */
export function NextStepsTab({ analysis }: { analysis: LeadAnalysis }) {
  const { followUp, risks, knowledgeGaps, opportunity } = analysis;
  const action = followUp.action || opportunity.recommendedNextStep;
  if (!action && !followUp.timing && !followUp.infoToCollect.length && !risks.reasonsNotToConvert.length && !risks.avoid.length && !knowledgeGaps.length) {
    return <EmptyNote>No follow-up suggestions this time.</EmptyNote>;
  }
  return (
    <div className="space-y-4">
      {(action || followUp.timing) && (
        <SectionCard title="Recommended next step" icon={ArrowRight} tone="emerald">
          <div className="grid sm:grid-cols-2 gap-4">
            {action && <Field label="Action"><AiText className="font-medium">{action}</AiText></Field>}
            {followUp.timing && <Field label="When"><div className="flex items-start gap-1.5"><Clock className="w-4 h-4 text-emerald-700 mt-0.5 shrink-0" /><AiText>{followUp.timing}</AiText></div></Field>}
          </div>
        </SectionCard>
      )}
      {followUp.infoToCollect.length > 0 && (
        <SectionCard title="Information to collect" icon={ListChecks} tone="cyan"><BulletList items={followUp.infoToCollect} dotClass="bg-cyan-500" /></SectionCard>
      )}
      {(risks.reasonsNotToConvert.length > 0 || risks.avoid.length > 0) && (
        <div className="grid sm:grid-cols-2 gap-4">
          {risks.reasonsNotToConvert.length > 0 && <SectionCard title="Why it may not convert" icon={AlertTriangle} tone="amber"><BulletList items={risks.reasonsNotToConvert} dotClass="bg-amber-500" /></SectionCard>}
          {risks.avoid.length > 0 && <SectionCard title="Avoid" icon={ShieldAlert} tone="rose"><BulletList items={risks.avoid} dotClass="bg-rose-500" /></SectionCard>}
        </div>
      )}
      {knowledgeGaps.length > 0 && (
        <SectionCard title="Missing from the company knowledge" icon={BookOpen} tone="slate">
          <p className="text-xs text-slate-500 mb-2">The assistant could not find these in the Knowledge Base. Ask your manager to add them, and do not guess them on the call.</p>
          <BulletList items={knowledgeGaps} dotClass="bg-slate-400" />
        </SectionCard>
      )}
    </div>
  );
}
