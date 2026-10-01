import { Flex } from 'antd';
import React from 'react';

import { INK } from '@/components/Bills/shared/Print';
import { Watermark } from '@/components/Bills/shared/Watermark';
import type { TWatermarkOptions } from '@/components/Bills/types';

export type TPaperProps = {
  width: number;
  fontFamily: string;
  fontSize: number;
  inkDensity?: number;
  watermark?: TWatermarkOptions;
  /** The server render injects the watermark into the final SVG itself */
  withWatermarkOverlay?: boolean;
  children: React.ReactNode;
};

/** Root of every bill: roll paper, ink layer, watermark on top. */
export const Paper: React.FC<TPaperProps> = ({
  width,
  fontFamily,
  fontSize,
  inkDensity = 1,
  watermark,
  withWatermarkOverlay = true,
  children,
}) => (
  <Flex vertical className="relative overflow-hidden bg-[#fdfdfb]" style={{ width }}>
    <Flex
      vertical
      className="w-full pt-6 px-[18px] pb-7"
      style={{
        fontFamily,
        fontSize,
        lineHeight: 1.25,
        color: INK,
        opacity: Math.min(1, Math.max(0.45, inkDensity)),
      }}
    >
      {children}
    </Flex>
    {withWatermarkOverlay ? <Watermark options={watermark} width={width} /> : null}
  </Flex>
);
