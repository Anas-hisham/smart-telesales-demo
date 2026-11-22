import type { KnowledgeItem } from '@/features/ai/types/ai.types';

const at = '2026-11-22T10:00:00.000Z';
const item = (id: string, campaignCode: string | null, title: string, content: string): KnowledgeItem => ({ id, campaignCode, title, content, active: true, updatedAt: at });

/** Demo knowledge: what the fake assistant is allowed to say. Edited on the Knowledge Base page, saved in this browser only. */
export const SEED_KNOWLEDGE: KnowledgeItem[] = [
  item('k-1', null, 'AB - ATEP - Amazon Tax Exemption Program',
    'WHAT IT IS: lets an eligible tax-exempt organization apply its exemption to eligible Amazon Business purchases so sales tax is not charged at checkout, without asking customer support for a tax refund after each order. Available for organizations in the US and Canada.\nWHO QUALIFIES: registered non-profits, schools and government bodies with a valid exemption certificate.\nHOW TO TALK ABOUT IT: confirm eligibility first. Never promise an exemption before the certificate is approved.'),
  item('k-2', null, 'AB - BP - Business Prime (plans and benefits)',
    'WHAT IT IS: a paid membership for an Amazon Business account. One membership covers every user on the account (no individual memberships needed). It is different from personal Amazon Prime. Plans and availability vary by country.\nBENEFITS: shipping benefits that scale with team size, a free trial may be available depending on eligibility.\nPRICE: leave the price out and tell the agent to confirm it.'),
  item('k-3', null, 'AB - Business Credit Account (BCA, formerly Pay by Invoice)',
    'WHAT IT IS: an invoice and "buy now, pay later" option for approved Amazon Business customers. It was called Pay by Invoice and was renamed Business Credit Account in 2026; existing settings and terms did not change.\nRULES: approval depends on credit review. Never guarantee approval.'),
  item('k-4', null, 'AB - Multi-user accounts and approval workflows',
    'WHAT IT IS: every team member gets a private login on one shared business account. Admins can set approval workflows with up to six approval levels at no extra fee, and control spending by department or project.\nWHEN TO USE: the customer says several people buy and nobody controls spending.'),
  item('k-5', null, 'AB - Business Analytics and spend reports',
    'WHAT IT IS: dashboards and downloadable reports that show spending by user, department, category and time period. Helps procurement teams find where to save.'),
  item('k-6', 'ACT-001', 'Activation - questions to ask on the first calls',
    'Ask: how many people order for the company, how they pay today, whether they track spending by department, and whether they already use another purchasing system. Goal of the campaign: get the first business account created.'),
  item('k-7', 'RET-002', 'Retention - approved answers to common objections',
    '"It is too expensive": explain that plans scale with team size and can offset shipping costs; mention the free trial only if eligible. "We already have a purchasing system": Amazon Business can sit next to it, start with one team.'),
];
