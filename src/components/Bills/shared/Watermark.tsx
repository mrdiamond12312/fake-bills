import React from 'react';

import type { TWatermarkOptions } from '@/components/Bills/types';
import { WATERMARK_LIMITS } from '@/const/bill';

const clamp = (value: number | undefined, { min, max, default: fallback }: any) =>
  Math.min(max, Math.max(min, Number.isFinite(value) ? (value as number) : fallback));

/**
 * Normalises watermark options. The watermark cannot be switched off, made invisible
 * or stripped of its SAMPLE mark — every render path goes through here.
 */
export const resolveWatermark = (options: TWatermarkOptions = {}) => {
  const custom = (options.text ?? '').trim() || WATERMARK_LIMITS.defaultText;
  const text = custom.toUpperCase().includes(WATERMARK_LIMITS.requiredMark)
    ? custom
    : `${WATERMARK_LIMITS.requiredMark} · ${custom}`;
  return {
    text,
    opacity: clamp(options.opacity, WATERMARK_LIMITS.opacity),
    size: clamp(options.size, WATERMARK_LIMITS.size),
    angle: clamp(options.angle, WATERMARK_LIMITS.angle),
    spacing: clamp(options.spacing, WATERMARK_LIMITS.spacing),
    color: options.color || '#b3261e',
  };
};

const escapeXml = (text: string) => text.replace(/[<>&'"]/g, (char) => `&#${char.charCodeAt(0)};`);

/**
 * The watermark as SVG markup: one rotated <pattern> filling the whole paper,
 * so no crop of the bill is free of it.
 * Returns the inner markup (defs + rect) so the server can inject it into satori's SVG.
 */
export const buildWatermarkMarkup = (options: TWatermarkOptions | undefined) => {
  const { text, opacity, size, angle, spacing, color } = resolveWatermark(options);
  const tileWidth = Math.round(text.length * size * 0.8 + size * 3 * spacing);
  const rowHeight = Math.round(size * 3.2 * spacing);
  const label = escapeXml(text);
  const textAttrs = `font-family="Arimo, Arial, sans-serif" font-weight="700" font-size="${size}" fill="${color}"`;

  return (
    `<defs><pattern id="receipt-lab-watermark" patternUnits="userSpaceOnUse" width="${tileWidth}" height="${
      rowHeight * 2
    }" patternTransform="rotate(${angle})">` +
    // each row also draws its left neighbour, so text spilling past a tile edge isn't clipped
    `<text x="0" y="${Math.round(rowHeight * 0.65)}" ${textAttrs}>${label}</text>` +
    `<text x="${-tileWidth}" y="${Math.round(rowHeight * 0.65)}" ${textAttrs}>${label}</text>` +
    `<text x="${-tileWidth / 2}" y="${Math.round(rowHeight * 1.65)}" ${textAttrs}>${label}</text>` +
    `<text x="${tileWidth / 2}" y="${Math.round(rowHeight * 1.65)}" ${textAttrs}>${label}</text>` +
    `</pattern></defs>` +
    `<rect x="0" y="0" width="100%" height="100%" fill="url(#receipt-lab-watermark)" opacity="${opacity}"/>`
  );
};

const WATERMARK_TILE_HEIGHT = 3000;

export const buildWatermarkDataUrl = (options: TWatermarkOptions | undefined, width: number) =>
  `data:image/svg+xml;charset=utf-8,${encodeURIComponent(
    `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${WATERMARK_TILE_HEIGHT}">${buildWatermarkMarkup(
      options,
    )}</svg>`,
  )}`;

/** Browser overlay. The server render injects `buildWatermarkMarkup` instead. */
export const Watermark: React.FC<{ options?: TWatermarkOptions; width: number }> = ({
  options,
  width,
}) => (
  <div
    className="absolute inset-0 pointer-events-none bg-repeat-y bg-top"
    style={{
      backgroundImage: `url("${buildWatermarkDataUrl(options, width)}")`,
      backgroundSize: `${width}px ${WATERMARK_TILE_HEIGHT}px`,
    }}
  />
);
