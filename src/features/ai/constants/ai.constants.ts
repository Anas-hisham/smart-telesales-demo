import type { AiLang, Intent, Likelihood } from '@/features/ai/types/ai.types';

/** The name of the helper on screen. Change it here and every button, title and message follows. */
export const AI_NAME = 'Call Assistant';
export const AI_TAGLINE = 'Your AI partner for this call';

export const AI_LANG_OPTIONS: { value: AiLang; label: string }[] = [
  { value: 'ar_en', label: 'Arabic notes + English script' },
  { value: 'en', label: 'All English' },
  { value: 'ar', label: 'All Arabic' },
];
export const AI_LANG_KEY = 'salesflow-ai-lang';

export const INTENT_STYLE: Record<Intent, { label: string; className: string }> = {
  high: { label: 'High interest', className: 'bg-emerald-100 text-emerald-800' },
  medium: { label: 'Medium interest', className: 'bg-amber-100 text-amber-800' },
  low: { label: 'Low interest', className: 'bg-rose-100 text-rose-800' },
  unknown: { label: 'Not enough data yet', className: 'bg-slate-100 text-slate-700' },
};

export const LIKELIHOOD_STYLE: Record<Likelihood, { label: string; chip: string; dot: string }> = {
  high: { label: 'Very likely', chip: 'bg-rose-100 text-rose-800', dot: 'bg-rose-500' },
  medium: { label: 'Possible', chip: 'bg-amber-100 text-amber-800', dot: 'bg-amber-500' },
  low: { label: 'Less likely', chip: 'bg-slate-100 text-slate-700', dot: 'bg-slate-400' },
};

/** Limits of the back end (knowledge). */
export const KNOWLEDGE_TITLE_MAX = 200;
export const KNOWLEDGE_CONTENT_MAX = 20000;
/** The server sends the model at most this many characters of knowledge per analysis (general + that lead's campaign). */
export const KNOWLEDGE_BUDGET = 40000;
