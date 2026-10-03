import type { Meta, StoryObj } from '@storybook/react';

import BillFontFaces from '@/components/Bills/BillFontFaces';
import BillRenderer from '@/components/Bills/BillRenderer';
import { normalizeBillData } from '@/components/Bills/helpers/normalize';
import { BILL_TEMPLATES } from '@/components/Bills/registry';

type TStoryArgs = { templateId: string; vatRate: number; seed: string };

const meta: Meta<TStoryArgs> = {
  title: 'Bills/Templates',
  tags: ['autodocs'],
  argTypes: {
    templateId: { control: 'select', options: BILL_TEMPLATES.map((template) => template.id) },
    vatRate: { control: { type: 'number', min: 0, max: 100 } },
  },
  args: { vatRate: 10, seed: 'storybook' },
  render: ({ templateId, vatRate, seed }) => (
    <>
      <BillFontFaces />
      <BillRenderer
        data={normalizeBillData({
          templateId,
          tax: { vatRate },
          display: { seed },
          transaction: { dateTime: '2026-01-09T14:15:00.000Z' },
        })}
      />
    </>
  ),
};

export default meta;

type TStory = StoryObj<TStoryArgs>;

// One story per registered template — adding a template adds a story.
export const CircleK: TStory = { args: { templateId: 'circle-k' } };
export const GoTops: TStory = { args: { templateId: 'go-tops' } };
export const Aeon: TStory = { args: { templateId: 'aeon' } };
export const AeonCitimart: TStory = { args: { templateId: 'aeon-citimart' } };
export const Coopmart: TStory = { args: { templateId: 'coopmart' } };
export const Emart: TStory = { args: { templateId: 'emart' } };
export const LotteMart: TStory = { args: { templateId: 'lotte-mart' } };
export const WinMart: TStory = { args: { templateId: 'winmart' } };
export const FamilyMart: TStory = { args: { templateId: 'familymart' } };
export const FarmersMarket: TStory = { args: { templateId: 'farmers-market' } };
