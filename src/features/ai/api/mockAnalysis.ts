import type { Lead } from '@/domain/types';
import type { AiLang, Intent, KnowledgeItem, LeadAnalysis } from '@/features/ai/types/ai.types';

/** [English, Arabic]. The analysis picks one per field: "ar_en" = Arabic notes for the agent + English words to say to the customer. */
type T = readonly [string, string];

const INTENT_BY_STATUS: Record<Lead['status'], Intent> = { new: 'unknown', discovery: 'medium', lvm: 'low', nvm: 'low', no_response: 'low', arranged_meeting: 'high' };

const OBSTACLE: Record<Lead['status'], T> = {
  new: ['Nothing is known about the customer yet', 'لا توجد معلومات عن العميل حتى الآن'],
  discovery: ['Not enough details about the current team and purchase volume', 'عدم توفر تفاصيل كافية حول احتياجات الفريق الحالية وحجم المشتريات'],
  lvm: ['The customer did not answer; only a voicemail was left', 'العميل لم يرد وتم ترك رسالة صوتية فقط'],
  nvm: ['The customer did not answer and no voicemail could be left', 'العميل لم يرد ولم يمكن ترك رسالة صوتية'],
  no_response: ['No response after several attempts', 'لا يوجد رد بعد عدة محاولات'],
  arranged_meeting: ['The meeting must lead to a decision, not only a presentation', 'يجب أن يؤدي الاجتماع إلى قرار وليس مجرد عرض'],
};

const pick = (lang: AiLang, [en, ar]: T, part: 'notes' | 'script') => (part === 'notes' ? (lang === 'en' ? en : ar) : (lang === 'ar' ? ar : en));

export function buildMockAnalysis(lead: Lead, lang: AiLang, knowledge: KnowledgeItem[]): LeadAnalysis {
  const n = (t: T) => pick(lang, t, 'notes');
  const s = (t: T) => pick(lang, t, 'script');
  const logs = [...lead.callLogs].sort((a, b) => a.timestamp.localeCompare(b.timestamp));
  const last = logs[logs.length - 1];
  const callCount = logs.length;
  const has = (word: string) => knowledge.some(k => k.title.toLowerCase().includes(word));
  const agent = last?.agentName ?? 'your account manager';
  const when = last ? new Date(last.timestamp).toISOString().slice(0, 16).replace('T', ' ') : '';
  const priceSaid = logs.some(l => l.reason === 'price' || /price|expensive|سعر|غالي/i.test(l.description));
  const callbackSaid = logs.filter(l => l.reason === 'callback' || /tomorrow|callback|call back|لاحقا|بكرة/i.test(l.description));
  const proof = (word: string, text: T) => (has(word) ? `${lang === 'en' ? 'From our knowledge' : 'من قاعدة المعرفة'}: ${n(text)}` : '');

  return {
    customerSummary: {
      who: `${lead.contactName} ${lang === 'en' ? 'from' : 'من'} ${lead.companyName}`,
      needs: n(['Explore Amazon Business benefits and organize company purchasing', 'استكشاف ميزات أمازون بزنس وتنظيم المشتريات المؤسسية']),
      interests: [n(['Amazon Business benefits', 'ميزات أمازون بزنس'])],
      painPoints: priceSaid ? [n(['Worried about the cost', 'قلق من التكلفة'])] : [],
      confirmed: callCount ? [n([`First call made on ${when.slice(0, 10)} and a follow-up was scheduled`, `تم إجراء الاتصال الأول في ${when.slice(0, 10)} وتم جدولة معاودة الاتصال`])] : [],
      assumptions: [n(['Still in early exploration and needs the multi-user benefits explained', 'العميل لا يزال في مرحلة الاستكشاف ويحتاج إلى توضيح فوائد الحساب الجماعي'])],
    },
    history: {
      callOutcomes: callCount ? n([`${callCount} call(s) made. Last outcome: ${last.type}.`, `تم إجراء ${callCount} مكالمة. آخر نتيجة: ${last.type}.`]) : n(['No calls yet', 'لا توجد مكالمات بعد']),
      repeatedObjections: priceSaid ? [n(['Price came up more than once', 'السعر تكرر ذكره'])] : [],
      concerns: [],
      buyingSignals: callbackSaid.length ? [n(['Agreed to a next call', 'الموافقة على جدولة المكالمة التالية'])] : [],
      promisesOrCallbacks: callbackSaid.length ? [n(['A follow-up call is scheduled', 'مكالمة متابعة مجدولة'])] : [],
      lastCall: last ? `${when} - ${last.type}` : '',
    },
    opportunity: {
      intent: INTENT_BY_STATUS[lead.status],
      intentReason: n(['Based on the status and the call notes', 'بناءً على الحالة وملاحظات المكالمات']),
      mainObstacle: n(OBSTACLE[lead.status]),
      recommendedNextStep: n(['Send a short email summary and set a follow-up date', 'إرسال ملخص عبر البريد الإلكتروني وتحديد موعد للمتابعة']),
    },
    strategy: {
      objective: n(['Understand the team size and purchase needs to offer the right solution such as the multi-user account', 'فهم حجم الفريق واحتياجات المشتريات لتقديم الحلول المناسبة مثل حساب المستخدمين المتعددين']),
      approach: n(['A friendly consultative style: discover the needs first, then connect them to Amazon Business benefits', 'أسلوب استشاري ودي يعتمد على استكشاف الاحتياجات وربطها بفوائد أمازون بزنس']),
      questionsToAsk: [
        s(['How many people currently place orders for your company?', 'كم عدد الأشخاص الذين يقومون بالطلب لشركتكم حالياً؟']),
        s(['How do your team members pay for purchases today?', 'كيف يدفع فريقكم مقابل المشتريات اليوم؟']),
        s(['Do you track spending by department or project?', 'هل تتابعون الإنفاق حسب القسم أو المشروع؟']),
      ],
      avoidRepeating: callCount ? [n(['Questions that were already answered in earlier calls', 'طرح أسئلة تم الإجابة عليها مسبقاً'])] : [],
    },
    salesAngles: [
      has('multi-user') && { angle: n(['Multi-user accounts and approvals', 'حساب المستخدمين المتعددين والموافقات']), why: n(['Prevents shared logins and gives control over spending', 'يمنع استخدام الحسابات المشتركة ويوطد التحكم في المصروفات']), proofFromKnowledge: proof('multi-user', ['Every user gets a private login and approval workflows can be set up to six levels at no extra fee', 'كل مستخدم لديه تسجيل دخول خاص ويمكن إعداد سير عمل للموافقات حتى ست مستويات دون رسوم إضافية']) },
      has('atep') && { angle: n(['Tax exemption program', 'برنامج الإعفاء الضريبي']), why: n(['Saves time and effort in claiming tax refunds', 'يوفر الوقت والجهد في طلب استرداد الضرائب']), proofFromKnowledge: proof('atep', ['Eligible organizations apply the exemption at checkout instead of asking for a refund later', 'يتيح للمؤسسات المؤهلة تطبيق الإعفاء مباشرة عند الدفع دون طلب استرداد لاحقاً']) },
    ].filter(Boolean) as LeadAnalysis['salesAngles'],
    script: {
      opening: s([`Hello, this is ${agent} following up on our previous conversation regarding Amazon Business. I hope you are having a great day.`, `مرحباً، أنا ${agent} أتابع معكم بخصوص محادثتنا السابقة حول أمازون بزنس. أتمنى أن يكون يومكم رائعاً.`]),
      personalizedTalk: s([`During our last chat, we touched upon how Amazon Business can help streamline your purchasing process. Today, I'd love to understand how ${lead.companyName} buys today, so I can show you only what is useful.`, `خلال حديثنا السابق تناولنا كيف يمكن لأمازون بزنس تبسيط عملية الشراء. اليوم أود أن أفهم كيف تشتري ${lead.companyName} حالياً لأعرض عليكم ما يفيدكم فقط.`]),
      discoveryQuestions: [s(['How many people currently place orders for your company?', 'كم عدد الأشخاص الذين يقومون بالطلب لشركتكم حالياً؟']), s(['Do you currently track spending by department or project?', 'هل تتابعون الإنفاق حالياً حسب القسم أو المشروع؟'])],
      closing: s(['Thank you for your time today. Based on what we discussed, would it make sense to schedule a brief follow-up next week to review the account setup options?', 'شكراً لوقتكم اليوم. بناءً على ما ناقشناه، هل يناسبكم تحديد متابعة قصيرة الأسبوع القادم لمراجعة خيارات إعداد الحساب؟']),
    },
    predictedObjections: [
      { objection: s(['“It’s too expensive”', '“السعر مرتفع”']), likelihood: priceSaid ? 'high' : 'medium', reason: n(['The customer may worry about membership cost', 'قد يتخوف العميل من تكلفة العضوية']), response: s(['I completely understand. Business Prime plans scale with your team size and can save you money on shipping costs you might already be paying, and a free trial may be available depending on eligibility.', 'أتفهم ذلك تماماً. خطط بيزنس برايم تتناسب مع حجم الفريق ويمكن أن توفر عليكم تكاليف الشحن، وقد تتوفر تجربة مجانية حسب الأهلية.']) },
      { objection: s(['“We already have a purchasing system”', '“لدينا نظام مشتريات بالفعل”']), likelihood: 'medium', reason: n(['They may not see why they should change', 'قد لا يرى العميل سبباً للتغيير']), response: s(['That is great. Many teams keep their system and use Amazon Business next to it, starting with one department. Would that be worth a quick look?', 'هذا ممتاز. كثير من الفرق تحتفظ بنظامها وتستخدم أمازون بزنس بجانبه بدءاً بقسم واحد. هل يستحق نظرة سريعة؟']) },
    ],
    risks: {
      reasonsNotToConvert: [n(['An urgent need to change the current system is missing', 'عدم وجود حاجة ملحة لتغيير نظام الشراء الحالي']), n(['Internal approval steps in their company', 'تعقيد إجراءات الموافقة الداخلية للشركة'])],
      avoid: [n(['Pushing the customer to decide fast', 'الضغط على العميل لاتخاذ قرار سريع']), n(['Guaranteeing credit or tax exemption approval', 'ضمان موافقة أكيدة على الائتمان أو الإعفاء الضريبي'])],
    },
    followUp: {
      action: n(['Send a short email summary and set a follow-up date', 'إرسال ملخص عبر البريد الإلكتروني وتحديد موعد للمتابعة']),
      timing: n(['Within a week', 'خلال أسبوع']),
      infoToCollect: [n(['Number of potential users', 'عدد المستخدمين المحتملين']), n(['Current payment method', 'طريقة الدفع الحالية']), n(['Tax exemption status', 'حالة الإعفاء الضريبي'])],
    },
    knowledgeGaps: [],
  };
}
