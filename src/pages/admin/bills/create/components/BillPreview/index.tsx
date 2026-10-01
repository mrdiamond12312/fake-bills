import { Flex } from 'antd';
import React from 'react';

import BillRenderer from '@/components/Bills/BillRenderer';
import type { TBillCodes, TBillData, TBillTotals } from '@/components/Bills/types';

type TBillPreview = {
  bill: TBillData;
  totals: TBillTotals;
  codes: TBillCodes;
  paperWidth: number;
  zoom: number;
};

/**
 * The exported node is rendered at 1:1; zoom is applied to an outer wrapper so
 * PNG export and the projector texture always get full resolution.
 */
export const BillPreview = React.forwardRef<HTMLDivElement, TBillPreview>(
  ({ bill, totals, codes, paperWidth, zoom }, ref) => (
    // mx-auto instead of justify-center: an overflowing centred child gets clipped on the left
    <Flex className="w-full overflow-auto py-6">
      <div className="mx-auto" style={{ width: paperWidth * zoom, flexShrink: 0 }}>
        <div
          style={{ transform: `scale(${zoom})`, transformOrigin: 'top left', width: paperWidth }}
        >
          <div ref={ref} className="shadow-lg" style={{ width: paperWidth }}>
            <BillRenderer data={bill} totals={totals} codes={codes} />
          </div>
        </div>
      </div>
    </Flex>
  ),
);
