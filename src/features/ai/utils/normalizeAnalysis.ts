import type { Intent, LeadAnalysis, Likelihood } from '@/features/ai/types/ai.types';

/** The model sometimes leaves a field out or sends a wrong type. The screen must never crash on that, so every field gets a safe value. */
const text = (value: unknown): string => (typeof value === 'string' ? value.trim() : '');
const list = (value: unknown): string[] => (Array.isArray(value) ? value.map(text).filter(Boolean) : []);
const record = (value: unknown): Record<string, unknown> => (value && typeof value === 'object' && !Array.isArray(value) ? value as Record<string, unknown> : {});
const records = (value: unknown): Record<string, unknown>[] => (Array.isArray(value) ? value.map(record) : []);
const oneOf = <T extends string>(value: unknown, allowed: readonly T[], fallback: T): T => (allowed.includes(value as T) ? value as T : fallback);

const LIKELIHOOD_ORDER: Record<Likelihood, number> = { high: 0, medium: 1, low: 2 };

export function normalizeAnalysis(raw: unknown): LeadAnalysis {
  const root = record(raw);
  const summary = record(root.customerSummary);
  const history = record(root.history);
  const opportunity = record(root.opportunity);
  const strategy = record(root.strategy);
  const script = record(root.script);
  const risks = record(root.risks);
  const followUp = record(root.followUp);

  return {
    customerSummary: { who: text(summary.who), needs: text(summary.needs), interests: list(summary.interests), painPoints: list(summary.painPoints), confirmed: list(summary.confirmed), assumptions: list(summary.assumptions) },
    history: { callOutcomes: text(history.callOutcomes), repeatedObjections: list(history.repeatedObjections), concerns: list(history.concerns), buyingSignals: list(history.buyingSignals), promisesOrCallbacks: list(history.promisesOrCallbacks), lastCall: text(history.lastCall) },
    opportunity: { intent: oneOf<Intent>(opportunity.intent, ['high', 'medium', 'low', 'unknown'], 'unknown'), intentReason: text(opportunity.intentReason), mainObstacle: text(opportunity.mainObstacle), recommendedNextStep: text(opportunity.recommendedNextStep) },
    strategy: { objective: text(strategy.objective), approach: text(strategy.approach), questionsToAsk: list(strategy.questionsToAsk), avoidRepeating: list(strategy.avoidRepeating) },
    salesAngles: records(root.salesAngles).map(angle => ({ angle: text(angle.angle), why: text(angle.why), proofFromKnowledge: text(angle.proofFromKnowledge) })).filter(angle => angle.angle),
    script: { opening: text(script.opening), personalizedTalk: text(script.personalizedTalk), discoveryQuestions: list(script.discoveryQuestions), closing: text(script.closing) },
    predictedObjections: records(root.predictedObjections)
      .map(item => ({ objection: text(item.objection), likelihood: oneOf<Likelihood>(item.likelihood, ['high', 'medium', 'low'], 'medium'), reason: text(item.reason), response: text(item.response) }))
      .filter(item => item.objection)
      .sort((first, second) => LIKELIHOOD_ORDER[first.likelihood] - LIKELIHOOD_ORDER[second.likelihood]),
    risks: { reasonsNotToConvert: list(risks.reasonsNotToConvert), avoid: list(risks.avoid) },
    followUp: { action: text(followUp.action), timing: text(followUp.timing), infoToCollect: list(followUp.infoToCollect) },
    knowledgeGaps: list(root.knowledgeGaps),
  };
}
