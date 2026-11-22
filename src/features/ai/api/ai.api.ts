import type { AiLang, KnowledgeDraft, KnowledgeItem, LeadAnalysisResponse } from '@/features/ai/types/ai.types';
import { SEED_KNOWLEDGE } from '@/features/ai/api/mockKnowledge';
import { buildMockAnalysis } from '@/features/ai/api/mockAnalysis';
import type { Lead } from '@/domain/types';

/**
 * DEMO VERSION. Same functions as the real api (analyzeLead, list/create/update/removeKnowledge) but nothing leaves the browser:
 * knowledge lives in localStorage, the analysis is written by buildMockAnalysis after a short fake "thinking" delay.
 * To connect the real back end later, replace this file with the one that calls /ai/knowledge and /leads/:id/ai-analysis.
 */
const KEY = 'salesflow-demo-ai-knowledge';
const wait = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

function read(): KnowledgeItem[] {
  try { const raw = localStorage.getItem(KEY); if (raw) return JSON.parse(raw) as KnowledgeItem[]; } catch { /* storage blocked */ }
  return SEED_KNOWLEDGE;
}
function write(items: KnowledgeItem[]) { try { localStorage.setItem(KEY, JSON.stringify(items)); } catch { /* storage blocked */ } }

/** saved analyses: opening the same lead again answers at once ("Saved"), "Regenerate" writes a new one */
const saved = new Map<string, LeadAnalysisResponse>();

export const aiApi = {
  async analyzeLead(lead: Lead, options: { lang: AiLang; refresh: boolean }): Promise<LeadAnalysisResponse> {
    const key = `${lead.id}|${options.lang}|${lead.callLogs.length}`;
    const hit = saved.get(key);
    if (hit && !options.refresh) { await wait(250); return { ...hit, cached: true }; }
    await wait(3200);
    const knowledge = read().filter(k => k.active && (k.campaignCode === null || k.campaignCode === lead.campaignCode));
    const fresh: LeadAnalysisResponse = { analysis: buildMockAnalysis(lead, options.lang, knowledge), generatedAt: new Date().toISOString(), cached: false };
    saved.set(key, fresh);
    return fresh;
  },
  async listKnowledge() { await wait(200); return read(); },
  async createKnowledge(body: KnowledgeDraft) {
    await wait(250);
    const created: KnowledgeItem = { id: `k-${Date.now()}`, ...body, active: true, updatedAt: new Date().toISOString() };
    write([...read(), created]); return created;
  },
  async updateKnowledge(id: string, body: Partial<KnowledgeDraft> & { active?: boolean }) {
    await wait(150);
    const items = read(); const current = items.find(k => k.id === id);
    if (!current) throw new Error('This knowledge item no longer exists.');
    const updated = { ...current, ...body, updatedAt: new Date().toISOString() };
    write(items.map(k => (k.id === id ? updated : k))); return updated;
  },
  async removeKnowledge(id: string) { await wait(150); write(read().filter(k => k.id !== id)); },
};
