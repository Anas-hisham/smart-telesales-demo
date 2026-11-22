import { AlertTriangle, BookOpen, Pencil, Plus, RefreshCw, Search, Trash2 } from 'lucide-react';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { aiApi } from '@/features/ai/api/ai.api';
import { KnowledgeEditorModal } from '@/features/ai/components/KnowledgeEditorModal';
import { AI_NAME, KNOWLEDGE_BUDGET } from '@/features/ai/constants/ai.constants';
import type { KnowledgeDraft, KnowledgeItem } from '@/features/ai/types/ai.types';
const errorText = (error: unknown) => (error instanceof Error ? error.message : 'Something went wrong');
const attempt = async <T,>(run: () => Promise<T>): Promise<T | null> => { try { return await run(); } catch { return null; } };
import { useConfirm } from '@/shared/components/ConfirmDialog';
import { TEXT_INPUT_CLASS } from '@/features/lead-pool/formStyles';
import { useStore } from '@/store';

const clamp3 = { display: '-webkit-box', WebkitLineClamp: 3, WebkitBoxOrient: 'vertical', overflow: 'hidden' } as const;
const byTitle = (first: KnowledgeItem, second: KnowledgeItem) => first.title.localeCompare(second.title);

/** Admin and Operation Manager write what the AI assistant knows. Agents never see this page, they see its effect in the assistant. */
export function KnowledgePage() {
  const { state } = useStore();
  const { ask, dialog } = useConfirm();
  const [items, setItems] = useState<KnowledgeItem[] | null>(null);
  const [loadError, setLoadError] = useState('');
  const [search, setSearch] = useState('');
  const [scope, setScope] = useState('all');            // 'all' | 'general' | a campaign code
  const [editing, setEditing] = useState<KnowledgeItem | 'new' | null>(null);

  const load = useCallback(async () => {
    setLoadError('');
    try { setItems((await aiApi.listKnowledge()).sort(byTitle)); }
    catch (error) { setLoadError(errorText(error)); }
  }, []);
  useEffect(() => { void load(); }, [load]);

  // campaigns for the filter and the editor: the ones of the system plus any code that already has knowledge
  const campaigns = useMemo(() => {
    const known = new Map(state.workflows.map(workflow => [workflow.campaignCode, workflow.name]));
    for (const item of items ?? []) if (item.campaignCode && !known.has(item.campaignCode)) known.set(item.campaignCode, '');
    return [...known].map(([code, name]) => ({ code, name })).sort((first, second) => first.code.localeCompare(second.code));
  }, [state.workflows, items]);

  const visible = useMemo(() => {
    const needle = search.trim().toLowerCase();
    return (items ?? []).filter(item =>
      (scope === 'all' || (scope === 'general' ? item.campaignCode === null : item.campaignCode === scope)) &&
      (!needle || item.title.toLowerCase().includes(needle) || item.content.toLowerCase().includes(needle)));
  }, [items, search, scope]);

  // the server gives the model at most KNOWLEDGE_BUDGET characters per analysis: general + that campaign (active items only)
  const budget = useMemo(() => {
    const active = (items ?? []).filter(item => item.active);
    const generalChars = active.filter(item => item.campaignCode === null).reduce((sum, item) => sum + item.content.length, 0);
    const used = (code: string) => generalChars + active.filter(item => item.campaignCode === code).reduce((sum, item) => sum + item.content.length, 0);
    const over = campaigns.map(campaign => campaign.code).filter(code => used(code) > KNOWLEDGE_BUDGET);
    return { generalChars, over, activeCount: active.length };
  }, [items, campaigns]);

  const replaceItem = (saved: KnowledgeItem) => setItems(previous => [...(previous ?? []).filter(item => item.id !== saved.id), saved].sort(byTitle));

  const save = async (draft: KnowledgeDraft) => {
    const saved = editing === 'new' || editing === null ? await aiApi.createKnowledge(draft) : await aiApi.updateKnowledge(editing.id, draft);
    replaceItem(saved);
    setEditing(null);
  };

  const toggleActive = async (item: KnowledgeItem) => {
    replaceItem({ ...item, active: !item.active });                       // instant, undone when the server refuses
    const saved = await attempt(() => aiApi.updateKnowledge(item.id, { active: !item.active }));
    replaceItem(saved ?? item);
  };

  const askRemove = (item: KnowledgeItem) => ask(
    { title: 'Delete this knowledge?', message: <><b>{item.title}</b> will be deleted and the assistant will stop using it. To keep it but stop using it, switch it off instead.</>, confirmLabel: 'Delete', tone: 'danger' },
    async () => { const result = await attempt(async () => { await aiApi.removeKnowledge(item.id); return true; }); if (result) setItems(previous => (previous ?? []).filter(other => other.id !== item.id)); },
  );

  return (
    <div className="p-4 sm:p-6 max-w-5xl mx-auto">
      <div className="flex items-center justify-between flex-wrap gap-3 mb-6">
        <div>
          <h2 className="text-lg font-bold text-slate-900">Knowledge Base</h2>
          <p className="text-sm text-slate-600">What the {AI_NAME} knows about your products, rules and objections</p>
        </div>
        <button onClick={() => setEditing('new')} className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 transition-all flex items-center gap-1.5"><Plus className="w-3.5 h-3.5" />New knowledge</button>
      </div>

      <div className="rounded-xl border border-violet-200 bg-violet-50/60 px-4 py-3 mb-5 text-sm text-violet-900">
        The assistant only uses what is written here (and the call notes of the lead). Active items are sent with every analysis: <b>general</b> items for all campaigns, and the items of the lead's own campaign.
        {items && <span className="block text-xs text-violet-700 mt-1">{budget.activeCount} active item{budget.activeCount === 1 ? '' : 's'} · {budget.generalChars.toLocaleString()} characters of general knowledge</span>}
      </div>

      {budget.over.length > 0 && (
        <div className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 mb-5 flex items-start gap-2.5 text-sm text-amber-900" role="alert">
          <AlertTriangle className="w-4 h-4 mt-0.5 shrink-0 text-amber-600" />
          <span>Too much active knowledge for {budget.over.join(', ')} (limit {KNOWLEDGE_BUDGET.toLocaleString()} characters per analysis). The last items will be left out. Shorten them or switch some off.</span>
        </div>
      )}

      <div className="flex flex-col sm:flex-row gap-3 mb-5">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input value={search} onChange={event => setSearch(event.target.value)} placeholder="Search title or content…" aria-label="Search knowledge" className={`${TEXT_INPUT_CLASS} pl-9`} />
        </div>
        <select value={scope} onChange={event => setScope(event.target.value)} aria-label="Filter by campaign" className={`${TEXT_INPUT_CLASS} sm:w-60`}>
          <option value="all">All items</option>
          <option value="general">General only</option>
          {campaigns.map(campaign => <option key={campaign.code} value={campaign.code}>{campaign.code}{campaign.name ? ` — ${campaign.name}` : ''}</option>)}
        </select>
      </div>

      {items === null && !loadError && <p className="text-sm text-slate-500 py-10 text-center" role="status">Loading…</p>}

      {loadError && (
        <div className="text-center py-10" role="alert">
          <p className="text-sm text-rose-700 mb-3">{loadError}</p>
          <button onClick={() => void load()} className="px-4 py-2 rounded-lg text-sm font-medium border border-slate-300 hover:bg-slate-50 inline-flex items-center gap-1.5"><RefreshCw className="w-3.5 h-3.5" />Try again</button>
        </div>
      )}

      {items && items.length === 0 && (
        <div className="text-center py-14 text-slate-500">
          <BookOpen className="w-12 h-12 mx-auto mb-3 opacity-30" />
          <p className="text-sm font-medium text-slate-700">The Knowledge Base is empty</p>
          <p className="text-xs mt-1 mb-4">Add your products, prices rules and approved answers. Without them the assistant can only use the call notes.</p>
          <button onClick={() => setEditing('new')} className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 inline-flex items-center gap-1.5"><Plus className="w-3.5 h-3.5" />Add the first item</button>
        </div>
      )}

      {items && items.length > 0 && visible.length === 0 && <p className="text-sm text-slate-500 py-10 text-center">No item matches your search.</p>}

      <div className="space-y-3">
        {visible.map(item => (
          <div key={item.id} className={`bg-white rounded-xl border shadow-sm p-4 sm:p-5 transition-opacity ${item.active ? 'border-slate-200' : 'border-slate-200 opacity-60'}`}>
            <div className="flex items-start gap-3">
              <div className="w-9 h-9 rounded-lg bg-violet-100 flex items-center justify-center shrink-0"><BookOpen className="w-4 h-4 text-violet-700" /></div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <h3 dir="auto" className="font-semibold text-sm text-slate-900">{item.title}</h3>
                  <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${item.campaignCode ? 'bg-cyan-50 text-cyan-800 font-mono' : 'bg-slate-100 text-slate-700'}`}>{item.campaignCode ?? 'General'}</span>
                  {!item.active && <span className="text-xs px-2 py-0.5 rounded-full font-medium bg-amber-100 text-amber-800">Off</span>}
                </div>
                <p dir="auto" style={clamp3} className="text-sm text-slate-600 leading-relaxed mt-2 whitespace-pre-line">{item.content}</p>
                <p className="text-xs text-slate-500 mt-2">{item.content.length.toLocaleString()} characters · updated {new Date(item.updatedAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</p>
              </div>
              <div className="flex items-center gap-1.5 shrink-0">
                <button role="switch" aria-checked={item.active} aria-label={item.active ? 'Switch off' : 'Switch on'} title={item.active ? 'On: the assistant uses it' : 'Off: the assistant ignores it'} onClick={() => void toggleActive(item)}
                  className={`relative w-10 h-6 rounded-full transition-colors ${item.active ? 'bg-emerald-500' : 'bg-slate-300'}`}>
                  <span className={`absolute top-0.5 left-0.5 w-5 h-5 rounded-full bg-white shadow transition-transform ${item.active ? 'translate-x-4' : ''}`} />
                </button>
                <button onClick={() => setEditing(item)} aria-label="Edit" title="Edit" className="w-8 h-8 rounded-lg text-slate-600 hover:bg-slate-100 flex items-center justify-center"><Pencil className="w-4 h-4" /></button>
                <button onClick={() => askRemove(item)} aria-label="Delete" title="Delete" className="w-8 h-8 rounded-lg text-slate-500 hover:bg-rose-50 hover:text-rose-600 flex items-center justify-center"><Trash2 className="w-4 h-4" /></button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {editing && <KnowledgeEditorModal item={editing === 'new' ? null : editing} campaigns={campaigns} onSave={save} onClose={() => setEditing(null)} />}
      {dialog}
    </div>
  );
}
