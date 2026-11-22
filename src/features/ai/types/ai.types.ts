/** Shapes of the back end AI module (POST /leads/:id/ai-analysis and /ai/knowledge). */
export type AiLang = 'ar' | 'en' | 'ar_en';
export type Intent = 'high' | 'medium' | 'low' | 'unknown';
export type Likelihood = 'high' | 'medium' | 'low';

export interface PredictedObjection { objection: string; likelihood: Likelihood; reason: string; response: string }
export interface SalesAngle { angle: string; why: string; proofFromKnowledge: string }

export interface LeadAnalysis {
  customerSummary: { who: string; needs: string; interests: string[]; painPoints: string[]; confirmed: string[]; assumptions: string[] };
  history: { callOutcomes: string; repeatedObjections: string[]; concerns: string[]; buyingSignals: string[]; promisesOrCallbacks: string[]; lastCall: string };
  opportunity: { intent: Intent; intentReason: string; mainObstacle: string; recommendedNextStep: string };
  strategy: { objective: string; approach: string; questionsToAsk: string[]; avoidRepeating: string[] };
  salesAngles: SalesAngle[];
  script: { opening: string; personalizedTalk: string; discoveryQuestions: string[]; closing: string };
  predictedObjections: PredictedObjection[];
  risks: { reasonsNotToConvert: string[]; avoid: string[] };
  followUp: { action: string; timing: string; infoToCollect: string[] };
  knowledgeGaps: string[];
}

/** What the server sends: the analysis is read defensively (see normalizeAnalysis), the model may leave fields out. */
export interface LeadAnalysisResponse { analysis: unknown; generatedAt: string; cached: boolean }
export interface LeadAnalysisResult { analysis: LeadAnalysis; generatedAt: string; cached: boolean }

export interface KnowledgeItem {
  id: string;
  /** null = general knowledge, used for every campaign */
  campaignCode: string | null;
  title: string;
  content: string;
  active: boolean;
  updatedAt: string;
}
export interface KnowledgeDraft { campaignCode: string | null; title: string; content: string }
