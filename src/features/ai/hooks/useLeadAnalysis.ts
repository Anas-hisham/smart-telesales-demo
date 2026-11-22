import { useCallback, useEffect, useRef, useState } from 'react';
import { aiApi } from '@/features/ai/api/ai.api';
import type { Lead } from '@/domain/types';
import type { AiLang, LeadAnalysisResult } from '@/features/ai/types/ai.types';
import { normalizeAnalysis } from '@/features/ai/utils/normalizeAnalysis';

export type AnalysisState =
  | { status: 'loading' }
  | { status: 'ready'; result: LeadAnalysisResult }
  | { status: 'error'; error: unknown };

/**
 * POST /leads/:id/ai-analysis when the panel opens (the server answers at once when nothing changed on the lead: saved result),
 * again when the language changes, and on "Regenerate" (refresh: true = ignore the saved result).
 */
export function useLeadAnalysis(lead: Lead, lang: AiLang) {
  const [state, setState] = useState<AnalysisState>({ status: 'loading' });
  const latest = useRef(0);

  const run = useCallback((refresh: boolean) => {
    const requestId = ++latest.current;
    setState({ status: 'loading' });
    aiApi.analyzeLead(lead, { lang, refresh })
      .then(response => {
        if (requestId !== latest.current) return;   // a newer request replaced this one
        setState({ status: 'ready', result: { analysis: normalizeAnalysis(response.analysis), generatedAt: response.generatedAt, cached: response.cached } });
      })
      .catch(error => { if (requestId === latest.current) setState({ status: 'error', error }); });
  }, [lead.id, lead.callLogs.length, lang]);

  useEffect(() => {
    run(false);
    return () => { latest.current += 1; };          // closing the panel ignores a late answer
  }, [run]);

  return { state, retry: () => run(false), regenerate: () => run(true) };
}
