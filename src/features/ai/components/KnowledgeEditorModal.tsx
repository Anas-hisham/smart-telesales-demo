import { Lightbulb, XCircle } from 'lucide-react';
import { useEffect, useState } from 'react';
import { KNOWLEDGE_CONTENT_MAX, KNOWLEDGE_TITLE_MAX } from '@/features/ai/constants/ai.constants';
import type { KnowledgeDraft, KnowledgeItem } from '@/features/ai/types/ai.types';
const errorText = (error: unknown) => (error instanceof Error ? error.message : 'Something went wrong');
import { TEXT_INPUT_CLASS } from '@/features/lead-pool/formStyles';

export interface CampaignOption { code: string; name: string }

/** Create or edit one knowledge item: what the assistant may say about a product, a price, a rule or an objection. */
export function KnowledgeEditorModal({ item, campaigns, onSave, onClose }: {
  item: KnowledgeItem | null;            // null = a new item
  campaigns: CampaignOption[];
  onSave: (draft: KnowledgeDraft) => Promise<void>;
  onClose: () => void;
}) {
  const [title, setTitle] = useState(item?.title ?? '');
  const [campaignCode, setCampaignCode] = useState<string>(item?.campaignCode ?? '');
  const [content, setContent] = useState(item?.content ?? '');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    const closeOnEscape = (event: KeyboardEvent) => { if (event.key === 'Escape' && !saving) onClose(); };
    document.addEventListener('keydown', closeOnEscape);
    return () => document.removeEventListener('keydown', closeOnEscape);
  }, [onClose, saving]);

  const trimmedTitle = title.trim();
  const trimmedContent = content.trim();
  const problem = !trimmedTitle ? 'Give the item a title.' : !trimmedContent ? 'Write the content.' : trimmedContent.length > KNOWLEDGE_CONTENT_MAX ? `The content is too long (maximum ${KNOWLEDGE_CONTENT_MAX.toLocaleString()} characters).` : '';
  const label = 'block text-sm font-medium text-slate-700 mb-1.5';

  const save = async () => {
    if (problem || saving) return;
    setSaving(true); setError('');
    try { await onSave({ title: trimmedTitle, content: trimmedContent, campaignCode: campaignCode || null }); }
    catch (caughtError) { setError(errorText(caughtError)); setSaving(false); }
  };

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center" role="dialog" aria-modal="true" aria-label={item ? 'Edit knowledge' : 'New knowledge'}>
      <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm animate-fade-in" onClick={() => { if (!saving) onClose(); }} />
      <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-2xl mx-4 animate-slide-up max-h-[92dvh] flex flex-col overflow-hidden">
        <div className="px-4 sm:px-6 py-4 border-b border-slate-200 flex items-center justify-between shrink-0">
          <div><h2 className="text-lg font-bold text-slate-900">{item ? 'Edit knowledge' : 'New knowledge'}</h2><p className="text-sm text-slate-600">What the assistant is allowed to say</p></div>
          <button onClick={onClose} disabled={saving} className="w-8 h-8 rounded-lg hover:bg-slate-100 flex items-center justify-center" aria-label="Close"><XCircle className="w-4 h-4 text-slate-600" /></button>
        </div>

        <div className="px-4 sm:px-6 py-5 space-y-4 overflow-y-auto scrollbar-thin">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="sm:col-span-2">
              <label className={label} htmlFor="kb-title">Title *</label>
              <input id="kb-title" className={TEXT_INPUT_CLASS} value={title} maxLength={KNOWLEDGE_TITLE_MAX} onChange={event => setTitle(event.target.value)} placeholder="e.g. Business Prime plans" autoFocus />
            </div>
            <div>
              <label className={label} htmlFor="kb-campaign">Used for</label>
              <select id="kb-campaign" className={TEXT_INPUT_CLASS} value={campaignCode} onChange={event => setCampaignCode(event.target.value)}>
                <option value="">All campaigns (general)</option>
                {campaigns.map(campaign => <option key={campaign.code} value={campaign.code}>{campaign.code}{campaign.name ? ` — ${campaign.name}` : ''}</option>)}
              </select>
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-sm font-medium text-slate-700" htmlFor="kb-content">Content *</label>
              <span className={`text-xs ${trimmedContent.length > KNOWLEDGE_CONTENT_MAX ? 'text-rose-600 font-medium' : 'text-slate-500'}`}>{trimmedContent.length.toLocaleString()} / {KNOWLEDGE_CONTENT_MAX.toLocaleString()}</span>
            </div>
            <textarea id="kb-content" dir="auto" rows={14} value={content} onChange={event => setContent(event.target.value)}
              placeholder={'Write the facts exactly as the agent should use them.\n\nFeatures, rules, approved answers to objections, questions to ask...'}
              className={`${TEXT_INPUT_CLASS} font-mono leading-relaxed resize-y min-h-[180px]`} />
          </div>

          <div className="rounded-lg bg-amber-50 border border-amber-100 px-3 py-2.5 flex gap-2">
            <Lightbulb className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
            <ul className="text-xs text-amber-900 space-y-0.5 list-disc pl-4">
              <li>One topic per item (a product, a feature, an objection) works better than one huge text.</li>
              <li>Write only what is true and approved. The assistant repeats it to agents.</li>
              <li>Leave a price out if it changes often; the assistant will tell the agent to confirm it.</li>
            </ul>
          </div>

          {(problem && (title || content)) && <p className="text-xs text-rose-700 bg-rose-50 rounded-lg px-3 py-2">{problem}</p>}
          {error && <p role="alert" className="text-sm text-rose-700 bg-rose-50 rounded-lg px-3 py-2">{error}</p>}
        </div>

        <div className="px-4 sm:px-6 py-4 border-t border-slate-100 flex justify-end gap-2 shrink-0">
          <button onClick={onClose} disabled={saving} className="px-4 py-2 rounded-lg text-sm font-medium text-slate-600 hover:bg-slate-100">Cancel</button>
          <button onClick={() => void save()} disabled={!!problem || saving} className="px-4 py-2 rounded-lg text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 disabled:opacity-40">{saving ? 'Saving…' : item ? 'Save changes' : 'Add knowledge'}</button>
        </div>
      </div>
    </div>
  );
}
