import { CheckCircle2, Circle, HelpCircle, Lightbulb, MessageCircle, Phone, ThumbsUp, TrendingUp, XCircle } from 'lucide-react';
import { useState } from 'react';
import { AiText, BulletList, CopyButton, EmptyNote, SectionCard, TONE, type Tone } from '@/features/ai/components/aiPrimitives';
import type { LeadAnalysis } from '@/features/ai/types/ai.types';

/** What to SAY, in the order of a real call: opening -> conversation -> questions -> closing. */
export function ScriptTab({ analysis }: { analysis: LeadAnalysis }) {
  const { script, strategy, salesAngles } = analysis;
  const [asked, setAsked] = useState<Set<number>>(new Set());

  const questions = [...new Set([...script.discoveryQuestions, ...strategy.questionsToAsk])];
  const fullScript = [
    script.opening && `OPENING\n${script.opening}`,
    script.personalizedTalk && `CONVERSATION\n${script.personalizedTalk}`,
    questions.length > 0 && `QUESTIONS\n${questions.map((question, index) => `${index + 1}. ${question}`).join('\n')}`,
    script.closing && `CLOSING\n${script.closing}`,
  ].filter(Boolean).join('\n\n');

  const toggleAsked = (index: number) => setAsked(previous => { const next = new Set(previous); if (next.has(index)) next.delete(index); else next.add(index); return next; });

  const speech: { title: string; hint: string; tone: Tone; icon: typeof Phone; text: string }[] = [
    { title: 'Opening', hint: 'The first 15 seconds', tone: 'blue', icon: Phone, text: script.opening },
    { title: 'The conversation', hint: 'Personalized to this customer', tone: 'violet', icon: MessageCircle, text: script.personalizedTalk },
  ];
  const closing = { title: 'Closing', hint: 'Agree one clear next step', tone: 'emerald' as Tone, icon: ThumbsUp, text: script.closing };

  if (!fullScript && salesAngles.length === 0) return <EmptyNote>The assistant did not write a script this time. Try “Regenerate”.</EmptyNote>;

  const renderSpeech = (step: { title: string; hint: string; tone: Tone; icon: typeof Phone; text: string }, number: number) => step.text ? (
    <li key={step.title} className="relative pl-12">
      <span className={`absolute left-0 top-0 w-9 h-9 rounded-full flex items-center justify-center text-sm font-bold ${TONE[step.tone].icon}`}>{number}</span>
      <div className="flex items-center gap-2 mb-1.5">
        <step.icon className="w-4 h-4 text-slate-500" />
        <h3 className="text-sm font-semibold text-slate-900">{step.title}</h3>
        <span className="text-xs text-slate-500 flex-1 min-w-0 truncate">{step.hint}</span>
        <CopyButton text={step.text} />
      </div>
      <div className={`rounded-xl border-l-4 bg-white border border-slate-200 p-3.5 ${TONE[step.tone].rail}`}><AiText className="text-[15px] leading-7">{step.text}</AiText></div>
    </li>
  ) : null;

  return (
    <div className="space-y-5">
      {strategy.approach && (
        <SectionCard title="Approach for this call" icon={Lightbulb} tone="amber"><AiText>{strategy.approach}</AiText></SectionCard>
      )}

      <div className="flex items-center justify-between gap-2">
        <h2 className="text-sm font-bold text-slate-900">Call flow</h2>
        {fullScript && <CopyButton text={fullScript} label="Copy full script" />}
      </div>

      <ol className="space-y-5 relative before:absolute before:left-[17px] before:top-6 before:bottom-6 before:w-px before:bg-slate-200">
        {renderSpeech(speech[0], 1)}
        {renderSpeech(speech[1], 2)}
        {questions.length > 0 && (
          <li className="relative pl-12">
            <span className={`absolute left-0 top-0 w-9 h-9 rounded-full flex items-center justify-center text-sm font-bold ${TONE.cyan.icon}`}>3</span>
            <div className="flex items-center gap-2 mb-1.5">
              <HelpCircle className="w-4 h-4 text-slate-500" />
              <h3 className="text-sm font-semibold text-slate-900">Questions to ask</h3>
              <span className="text-xs text-slate-500 flex-1 min-w-0 truncate">{asked.size}/{questions.length} asked — tick them as you go</span>
              <CopyButton text={questions.map((question, index) => `${index + 1}. ${question}`).join('\n')} />
            </div>
            <ul className="rounded-xl border border-slate-200 bg-white divide-y divide-slate-100">
              {questions.map((question, index) => {
                const done = asked.has(index);
                return (
                  <li key={index}>
                    <button type="button" onClick={() => toggleAsked(index)} aria-pressed={done} className="w-full flex items-start gap-3 px-3.5 py-3 text-left hover:bg-slate-50">
                      {done ? <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" /> : <Circle className="w-5 h-5 text-slate-300 shrink-0 mt-0.5" />}
                      <AiText className={`flex-1 ${done ? 'line-through text-slate-400' : ''}`}>{question}</AiText>
                    </button>
                  </li>
                );
              })}
            </ul>
          </li>
        )}
        {renderSpeech(closing, 4)}
      </ol>

      {salesAngles.length > 0 && (
        <SectionCard title="How to convince this customer" icon={TrendingUp} tone="violet">
          <div className="grid sm:grid-cols-2 gap-3">
            {salesAngles.map((angle, index) => (
              <div key={index} className="rounded-lg bg-white border border-violet-100 p-3 space-y-1.5">
                <AiText className="font-semibold text-slate-900">{angle.angle}</AiText>
                {angle.why && <AiText className="text-slate-600">{angle.why}</AiText>}
                {angle.proofFromKnowledge && <p className="text-xs rounded-md bg-violet-50 text-violet-800 px-2 py-1.5" dir="auto"><b>From our knowledge:</b> {angle.proofFromKnowledge}</p>}
              </div>
            ))}
          </div>
        </SectionCard>
      )}

      {strategy.avoidRepeating.length > 0 && (
        <SectionCard title="Do not ask again" icon={XCircle} tone="rose">
          <BulletList items={strategy.avoidRepeating} dotClass="bg-rose-400" />
        </SectionCard>
      )}
    </div>
  );
}
