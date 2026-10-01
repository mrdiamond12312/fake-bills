/**
 * Pure renderer shared by the browser preview and the /api/bills/render route.
 * No hooks — satori calls this directly.
 */
import React from 'react';

import { getFontPreset } from '@/components/Bills/fonts';
import { calculateTotals } from '@/components/Bills/helpers/calc';
import { generateBillCodes } from '@/components/Bills/helpers/codes';
import { createReceiptT } from '@/components/Bills/helpers/receipt-text';
import { getBillTemplate } from '@/components/Bills/registry';
import { Paper } from '@/components/Bills/shared/Paper';
import type { TBillCodes, TBillData, TBillTotals } from '@/components/Bills/types';

export type TBillRendererProps = {
  data: TBillData;
  /** Pre-computed values; computed from `data` when omitted */
  totals?: TBillTotals;
  codes?: TBillCodes;
  /** false on the server: the watermark is injected into the final SVG instead */
  withWatermarkOverlay?: boolean;
};

export const resolveBillView = (data: TBillData) => {
  const template = getBillTemplate(data.templateId);
  const font = getFontPreset(data.display?.fontId || template.fontId);
  const fontSize = Number(data.display?.fontSize) || template.fontSize;
  const paperWidth = Number(data.display?.paperWidth) || template.paperWidth;
  return { template, font, fontSize, paperWidth };
};

const BillRenderer: React.FC<TBillRendererProps> = ({
  data,
  totals,
  codes,
  withWatermarkOverlay,
}) => {
  const { template, font, fontSize, paperWidth } = resolveBillView(data);
  const Template = template.component;

  return (
    <Paper
      width={paperWidth}
      fontFamily={font.family}
      fontSize={fontSize}
      inkDensity={data.display?.inkDensity}
      watermark={data.display?.watermark}
      withWatermarkOverlay={withWatermarkOverlay}
    >
      <Template
        data={data}
        totals={totals ?? calculateTotals(data)}
        codes={codes ?? generateBillCodes(data)}
        font={{ family: font.family, size: fontSize }}
        t={createReceiptT(data.display?.language)}
      />
    </Paper>
  );
};

export default BillRenderer;
