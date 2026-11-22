import { Check, Copy } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import { type ReactNode, useState } from 'react';
const reportError = (message: string) => window.alert(message);

export type Tone = 'blue' | 'violet' | 'cyan' | 'emerald' | 'amber' | 'rose' | 'slate';

/** Full class names (Tailwind only keeps classes it can read in the source). */
export const TONE: Record<Tone, { box: string; icon: string; title: string; rail: string }> = {
  blue: { box: 'border-blue-200 bg-blue-50/60', icon: 'bg-blue-100 text-blue-700', title: 'text-blue-900', rail: 'border-blue-300' },
  violet: { box: 'border-violet-200 bg-violet-50/60', icon: 'bg-violet-100 text-violet-700', title: 'text-violet-900', rail: 'border-violet-300' },
  cyan: { box: 'border-cyan-200 bg-cyan-50/60', icon: 'bg-cyan-100 text-cyan-700', title: 'text-cyan-900', rail: 'border-cyan-300' },
  emerald: { box: 'border-emerald-200 bg-emerald-50/60', icon: 'bg-emerald-100 text-emerald-700', title: 'text-emerald-900', rail: 'border-emerald-300' },
  amber: { box: 'border-amber-200 bg-amber-50/70', icon: 'bg-amber-100 text-amber-700', title: 'text-amber-900', rail: 'border-amber-300' },
  rose: { box: 'border-rose-200 bg-rose-50/60', icon: 'bg-rose-100 text-rose-700', title: 'text-rose-900', rail: 'border-rose-300' },
  slate: { box: 'border-slate-200 bg-white', icon: 'bg-slate-100 text-slate-600', title: 'text-slate-900', rail: 'border-slate-300' },
};

/** Text written by the AI. dir="auto": Arabic lines read right-to-left, English lines left-to-right, in the same panel. */
export function AiText({ children, className = '' }: { children: string; className?: string }) {
  return <p dir="auto" className={`text-sm text-slate-800 leading-relaxed whitespace-pre-wrap ${className}`}>{children}</p>;
}

export function CopyButton({ text, label = 'Copy', className = '' }: { text: string; label?: string; className?: string }) {
  const [copied, setCopied] = useState(false);
  const copy = async () => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 1600);
    } catch { reportError('Could not copy. Select the text and copy it by hand.'); }
  };
  return (
    <button type="button" onClick={() => void copy()} aria-label={copied ? 'Copied' : label}
      className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-medium border transition-all ${copied ? 'border-emerald-300 bg-emerald-50 text-emerald-700' : 'border-slate-200 bg-white text-slate-600 hover:bg-slate-50'} ${className}`}>
      {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}{copied ? 'Copied' : label}
    </button>
  );
}

export function SectionCard({ title, icon: Icon, tone = 'slate', action, children }: { title: string; icon: LucideIcon; tone?: Tone; action?: ReactNode; children: ReactNode }) {
  const style = TONE[tone];
  return (
    <section className={`rounded-xl border p-4 ${style.box}`}>
      <div className="flex items-center gap-2 mb-3">
        <span className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 ${style.icon}`}><Icon className="w-4 h-4" /></span>
        <h3 className={`text-sm font-semibold flex-1 min-w-0 ${style.title}`}>{title}</h3>
        {action}
      </div>
      {children}
    </section>
  );
}

export function BulletList({ items, dotClass = 'bg-slate-400' }: { items: string[]; dotClass?: string }) {
  return (
    <ul className="space-y-1.5">
      {items.map((item, index) => (
        <li key={index} className="flex items-start gap-2">
          <span className={`w-1.5 h-1.5 rounded-full mt-2 shrink-0 ${dotClass}`} />
          <AiText className="flex-1">{item}</AiText>
        </li>
      ))}
    </ul>
  );
}

export function Chips({ items, className = 'bg-slate-100 text-slate-700' }: { items: string[]; className?: string }) {
  return (
    <div className="flex flex-wrap gap-1.5">
      {items.map((item, index) => <span key={index} dir="auto" className={`text-xs px-2.5 py-1 rounded-full font-medium ${className}`}>{item}</span>)}
    </div>
  );
}

export function EmptyNote({ children }: { children: ReactNode }) {
  return <p className="text-sm text-slate-500 py-8 text-center">{children}</p>;
}

/** A small caption above a value: "Main obstacle" / text. */
export function Field({ label, children }: { label: string; children: ReactNode }) {
  return <div><div className="text-xs font-medium text-slate-500 mb-1">{label}</div>{children}</div>;
}
