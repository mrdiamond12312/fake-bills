/**
 * Server-side bill → PNG: browser tree → satori (SVG) → watermark injected → resvg (PNG).
 * Only imported by src/api routes; never by browser code.
 */
import fs from 'fs';
import { createRequire } from 'module';
import path from 'path';

import React from 'react';

import BillRenderer, { resolveBillView } from '@/components/Bills/BillRenderer';
import { FONT_PRESETS, FONTS_BASE_PATH } from '@/components/Bills/fonts';
import { normalizeBillData, TDeepPartialBill } from '@/components/Bills/helpers/normalize';
import { buildWatermarkMarkup } from '@/components/Bills/shared/Watermark';
import { toSatoriTree } from '@/utils/render-bill/to-satori';

/**
 * satori (yoga wasm) and resvg (native .node binary) can't go through the api-route
 * esbuild bundle, so they're loaded from node_modules at runtime.
 */
const nodeRequire = createRequire(path.join(process.cwd(), 'package.json'));

const fontsDir = () => path.join(process.cwd(), 'public', FONTS_BASE_PATH);

type TSatoriFont = { name: string; data: Buffer; weight: 400 | 500 | 700; style: 'normal' };

let fontCache: TSatoriFont[] | undefined;

const loadFonts = () => {
  if (fontCache) return fontCache;
  fontCache = Object.values(FONT_PRESETS).flatMap((font) =>
    font.files.map(({ weight, file }) => ({
      name: font.family,
      data: fs.readFileSync(path.join(fontsDir(), file)),
      weight,
      style: 'normal' as const,
    })),
  );
  return fontCache;
};

export type TRenderOptions = {
  /** Output pixel ratio, 1–4 */
  scale?: number;
  format?: 'png' | 'svg';
};

export const renderBill = async (input: TDeepPartialBill, options: TRenderOptions = {}) => {
  const data = normalizeBillData(input);
  const { paperWidth } = resolveBillView(data);
  const scale = Math.min(4, Math.max(1, Number(options.scale) || 2));

  const satori = nodeRequire('satori').default;
  const tree = toSatoriTree(
    React.createElement(BillRenderer, { data, withWatermarkOverlay: false }),
  );
  const rawSvg: string = await satori(tree, { width: paperWidth, fonts: loadFonts() });

  // The watermark goes in as one rotated <pattern>: always present, cheap to render.
  const svg = rawSvg.replace(
    /<\/svg>\s*$/,
    `${buildWatermarkMarkup(data.display.watermark)}</svg>`,
  );

  if (options.format === 'svg') {
    return { data, contentType: 'image/svg+xml', body: Buffer.from(svg) };
  }

  const { Resvg } = nodeRequire('@resvg/resvg-js');
  const png = new Resvg(svg, {
    fitTo: { mode: 'zoom', value: scale },
    background: '#fdfdfb',
    font: {
      loadSystemFonts: false,
      fontFiles: [path.join(fontsDir(), 'Arimo-Bold.ttf')],
      defaultFontFamily: 'Arimo',
    },
  })
    .render()
    .asPng();

  return { data, contentType: 'image/png', body: png as Buffer };
};
