/**
 * Bill template registry.
 *
 * To add a store: create `templates/<Name>/index.tsx` exporting a `TBillTemplate`,
 * then append it to BILL_TEMPLATES below. The form, preview, projector and API pick it up.
 */
import { aeonTemplate } from '@/components/Bills/templates/Aeon';
import { aeonCitimartTemplate } from '@/components/Bills/templates/AeonCitimart';
import { circleKTemplate } from '@/components/Bills/templates/CircleK';
import { coopmartTemplate } from '@/components/Bills/templates/Coopmart';
import { emartTemplate } from '@/components/Bills/templates/Emart';
import { familyMartTemplate } from '@/components/Bills/templates/FamilyMart';
import { farmersMarketTemplate } from '@/components/Bills/templates/FarmersMarket';
import { goTopsTemplate } from '@/components/Bills/templates/GoTops';
import { winMartTemplate } from '@/components/Bills/templates/WinMart';
import type { TBillTemplate } from '@/components/Bills/types';

export const BILL_TEMPLATES: TBillTemplate[] = [
  circleKTemplate,
  goTopsTemplate,
  aeonTemplate,
  aeonCitimartTemplate,
  coopmartTemplate,
  emartTemplate,
  winMartTemplate,
  familyMartTemplate,
  farmersMarketTemplate,
];

export const BILL_TEMPLATE_MAP: Record<string, TBillTemplate> = Object.fromEntries(
  BILL_TEMPLATES.map((template) => [template.id, template]),
);

export const DEFAULT_TEMPLATE_ID = BILL_TEMPLATES[0].id;

export const getBillTemplate = (templateId?: string) =>
  BILL_TEMPLATE_MAP[templateId ?? ''] ?? BILL_TEMPLATE_MAP[DEFAULT_TEMPLATE_ID];
