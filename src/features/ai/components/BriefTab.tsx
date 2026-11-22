import { AlertCircle, CheckCircle2, History, Target, UserRound } from 'lucide-react';
import { AiText, BulletList, Chips, EmptyNote, Field, SectionCard } from '@/features/ai/components/aiPrimitives';
import { INTENT_STYLE } from '@/features/ai/constants/ai.constants';
import type { LeadAnalysis } from '@/features/ai/types/ai.types';

/** Who this customer is, what happened before, and how likely a sale is. Confirmed facts are kept apart from the AI's guesses. */
export function BriefTab({ analysis }: { analysis: LeadAnalysis }) {
  const { customerSummary: summary, history, opportunity } = analysis;
  const hasHistory = history.callOutcomes || history.lastCall || history.repeatedObjections.length || history.concerns.length || history.buyingSignals.length || history.promisesOrCallbacks.length;
  const hasCustomer = summary.who || summary.needs || summary.interests.length || summary.painPoints.length || summary.confirmed.length || summary.assumptions.length;
  if (!hasCustomer && !hasHistory && !opportunity.intentReason) return <EmptyNote>Not enough information for a brief yet.</EmptyNote>;

  return (
    <div className="space-y-4">
      <SectionCard title="Opportunity" icon={Target} tone="blue" action={<span className={`text-xs px-2.5 py-1 rounded-full font-medium ${INTENT_STYLE[opportunity.intent].className}`}>{INTENT_STYLE[opportunity.intent].label}</span>}>
        <div className="space-y-3">
          {opportunity.intentReason && <AiText>{opportunity.intentReason}</AiText>}
          {opportunity.mainObstacle && <Field label="Main obstacle"><AiText>{opportunity.mainObstacle}</AiText></Field>}
        </div>
      </SectionCard>

      {hasCustomer && (
        <SectionCard title="The customer" icon={UserRound} tone="slate">
          <div className="space-y-3">
            {summary.who && <Field label="Who"><AiText>{summary.who}</AiText></Field>}
            {summary.needs && <Field label="What they need"><AiText>{summary.needs}</AiText></Field>}
            {summary.interests.length > 0 && <Field label="Interests"><Chips items={summary.interests} className="bg-blue-50 text-blue-800" /></Field>}
            {summary.painPoints.length > 0 && <Field label="Pain points"><Chips items={summary.painPoints} className="bg-rose-50 text-rose-800" /></Field>}
          </div>
          {(summary.confirmed.length > 0 || summary.assumptions.length > 0) && (
            <div className="grid sm:grid-cols-2 gap-3 mt-4">
              {summary.confirmed.length > 0 && (
                <div className="rounded-lg bg-emerald-50 border border-emerald-100 p-3">
                  <div className="flex items-center gap-1.5 text-xs font-semibold text-emerald-800 mb-2"><CheckCircle2 className="w-3.5 h-3.5" />Confirmed in the calls</div>
                  <BulletList items={summary.confirmed} dotClass="bg-emerald-500" />
                </div>
              )}
              {summary.assumptions.length > 0 && (
                <div className="rounded-lg bg-amber-50 border border-amber-100 p-3">
                  <div className="flex items-center gap-1.5 text-xs font-semibold text-amber-800 mb-2"><AlertCircle className="w-3.5 h-3.5" />Assumptions — check them</div>
                  <BulletList items={summary.assumptions} dotClass="bg-amber-500" />
                </div>
              )}
            </div>
          )}
        </SectionCard>
      )}

      {hasHistory && (
        <SectionCard title="What happened so far" icon={History} tone="slate">
          <div className="space-y-3">
            {history.callOutcomes && <Field label="Call outcomes"><AiText>{history.callOutcomes}</AiText></Field>}
            {history.lastCall && <Field label="Last call"><AiText>{history.lastCall}</AiText></Field>}
            {history.promisesOrCallbacks.length > 0 && <Field label="Promises and callbacks"><BulletList items={history.promisesOrCallbacks} dotClass="bg-blue-500" /></Field>}
            {history.buyingSignals.length > 0 && <Field label="Buying signals"><BulletList items={history.buyingSignals} dotClass="bg-emerald-500" /></Field>}
            {history.repeatedObjections.length > 0 && <Field label="Repeated objections"><BulletList items={history.repeatedObjections} dotClass="bg-rose-500" /></Field>}
            {history.concerns.length > 0 && <Field label="Concerns"><BulletList items={history.concerns} dotClass="bg-amber-500" /></Field>}
          </div>
        </SectionCard>
      )}
    </div>
  );
}
