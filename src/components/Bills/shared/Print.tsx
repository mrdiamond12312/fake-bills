/**
 * Printing primitives shared by every bill template.
 *
 * Styling rules (so /api/bills/render can draw the same thing with satori):
 *  - layout with AntD <Flex>, images with AntD <Image> — the server maps both to plain elements
 *  - static styling with Tailwind classes — the server feeds them to satori's `tw`
 *  - values derived from the template's font size go in `style`
 *  - text nodes are a single string child; no hooks
 */
import { Flex, Image } from 'antd';
import classNames from 'classnames';
import React from 'react';

import type { TLogoAlign, TStoreInfo } from '@/components/Bills/types';

type TStyle = React.CSSProperties;

/** Thermal ink is never pure black. */
export const INK = '#1c1c1c';

export type TAlign = 'left' | 'center' | 'right';

export const justifyOf = (align: TAlign = 'left') =>
  align === 'center' ? 'center' : align === 'right' ? 'flex-end' : 'flex-start';

export const Spacer: React.FC<{ size?: number }> = ({ size = 8 }) => (
  // AntD hides an empty Flex (`.ant-flex:empty { display: none }`), so force it back on;
  // otherwise the gap only shows in the satori render.
  <Flex className="w-full" style={{ display: 'flex', height: size, flexShrink: 0 }} />
);

export type TTextProps = {
  children?: string | number | null;
  bold?: boolean;
  size?: number;
  align?: TAlign;
  italic?: boolean;
  strike?: boolean;
  nowrap?: boolean;
  /** fixed width in px */
  width?: number;
  flex?: number;
  className?: string;
  style?: TStyle;
};

export const Text: React.FC<TTextProps> = ({
  children,
  bold,
  size,
  align = 'left',
  italic,
  strike,
  nowrap,
  width,
  flex,
  className,
  style,
}) => (
  <Flex
    justify={justifyOf(align)}
    className={classNames(
      'min-w-0',
      bold ? 'font-bold' : 'font-normal',
      italic && 'italic',
      strike && 'line-through',
      nowrap && 'shrink-0',
      width !== undefined && 'shrink-0',
      align === 'center' ? 'text-center' : align === 'right' ? 'text-right' : 'text-left',
      className,
    )}
    style={{ fontSize: size, width, flex, whiteSpace: nowrap ? 'nowrap' : 'pre-wrap', ...style }}
  >
    {children === null || children === undefined ? '' : String(children)}
  </Flex>
);

/**
 * Thermal printers draw separators with characters, not borders.
 * Keeping them as text is realistic for OCR (models must learn to ignore them).
 */
export const CharLine: React.FC<{ char?: string; className?: string }> = ({
  char = '-',
  className,
}) => (
  <Flex
    className={classNames('w-full overflow-hidden', className)}
    style={{ whiteSpace: 'nowrap', lineHeight: 1 }}
  >
    {char.repeat(160)}
  </Flex>
);

/** Solid/dashed printed rule for sans-serif receipts that use real lines. */
export const RuleLine: React.FC<{ thick?: boolean; dashed?: boolean; className?: string }> = ({
  thick,
  dashed,
  className,
}) => (
  <Flex
    className={classNames(
      'w-full my-1 border-0 border-t border-solid border-[#1c1c1c]',
      thick && 'border-t-2',
      dashed && 'border-dashed',
      className,
    )}
  />
);

export type TCell = {
  text: string | number;
  /** fixed width in px */
  width?: number;
  /** flex grow; defaults to 1 when no width */
  flex?: number;
  align?: TAlign;
  bold?: boolean;
  strike?: boolean;
};

/** A table row of fixed/flex columns — the backbone of every item list. */
export const Cells: React.FC<{ cells: TCell[]; size?: number; className?: string }> = ({
  cells,
  size,
  className,
}) => (
  <Flex className={classNames('w-full', className)}>
    {cells.map((cell, index) => (
      <Text
        key={index}
        width={cell.width}
        flex={cell.width === undefined ? cell.flex ?? 1 : undefined}
        align={cell.align}
        bold={cell.bold}
        strike={cell.strike}
        size={size}
      >
        {String(cell.text)}
      </Text>
    ))}
  </Flex>
);

/** Label on the left, value on the right. */
export const KeyValue: React.FC<{
  label: string;
  value: string | number;
  bold?: boolean;
  size?: number;
  className?: string;
}> = ({ label, value, bold, size, className }) => (
  <Flex justify="space-between" gap={8} className={classNames('w-full', className)}>
    <Text bold={bold} size={size} flex={1}>
      {label}
    </Text>
    <Text bold={bold} size={size} align="right" nowrap>
      {String(value)}
    </Text>
  </Flex>
);

/**
 * ESC/POS double-width / double-height printing.
 * Scales visually and reserves the extra line height so nothing below overlaps.
 */
export const PrintScale: React.FC<{
  x?: 1 | 2;
  y?: 1 | 2;
  align?: TAlign;
  fontSize: number;
  children: React.ReactNode;
}> = ({ x = 1, y = 2, align = 'left', fontSize, children }) => (
  <Flex
    justify={justifyOf(align)}
    align="flex-start"
    style={{ height: Math.round(fontSize * 1.3 * y) }}
  >
    <Flex
      style={{
        whiteSpace: 'nowrap',
        transform: `scale(${x}, ${y})`,
        transformOrigin: `${align === 'center' ? 'center' : align} top`,
      }}
    >
      {children}
    </Flex>
  </Flex>
);

/** QR / barcode / logo image. Preview is off: it's printed ink, not a gallery. */
export const PrintImage: React.FC<{
  src: string;
  width: number;
  height?: number;
  className?: string;
}> = ({ src, width, height, className }) => (
  <Image
    src={src}
    width={width}
    height={height ?? width}
    preview={false}
    className={className}
    style={{ objectFit: 'contain' }}
  />
);

/**
 * Remote logos go through our own /api/image-proxy in the browser so html-to-image
 * (projector, PNG export) can read them without the host's CORS headers.
 * Data URLs, same-origin paths and the server renderer keep the src as-is.
 */
const browserSafeSrc = (src: string) => {
  if (typeof window === 'undefined' || !/^https?:\/\//i.test(src)) return src;
  try {
    if (new URL(src).origin === window.location.origin) return src;
  } catch {
    return src;
  }
  return `/api/image-proxy?url=${encodeURIComponent(src)}`;
};

/**
 * Store logo: the image from the form (upload or URL) when provided,
 * otherwise the template's own text wordmark.
 */
export const Logo: React.FC<{
  store: TStoreInfo;
  fallback: React.ReactNode;
  defaultWidth?: number;
  defaultAlign?: TLogoAlign;
  /** Sits beside other header content instead of taking a full row */
  inline?: boolean;
}> = ({ store, fallback, defaultWidth = 180, defaultAlign = 'center', inline }) => {
  if (store.showLogo === false) return null;
  const width = store.logoWidth ?? defaultWidth;
  return (
    <Flex
      justify={justifyOf(store.logoAlign ?? defaultAlign)}
      className={inline ? 'shrink-0' : 'w-full mb-1.5'}
    >
      {store.logoUrl ? (
        <Image
          src={browserSafeSrc(store.logoUrl)}
          width={width}
          preview={false}
          style={{ objectFit: 'contain', maxHeight: width }}
        />
      ) : (
        fallback
      )}
    </Flex>
  );
};

/** Text wordmark used when no logo image is set. */
export const Wordmark: React.FC<{
  text: string;
  size: number;
  variant?: 'plain' | 'boxed' | 'inverted';
  letterSpacing?: number;
  sub?: string;
}> = ({ text, size, variant = 'plain', letterSpacing = 1, sub }) => (
  <Flex vertical align="center">
    <Flex
      className={classNames(
        'font-bold',
        variant === 'inverted' && 'bg-[#1c1c1c] text-white px-3 py-1',
        variant === 'boxed' && 'border-2 border-solid border-[#1c1c1c] px-3 py-1',
      )}
      style={{ fontSize: size, letterSpacing, lineHeight: 1 }}
    >
      {text}
    </Flex>
    {sub ? (
      <Text size={Math.round(size * 0.38)} italic>
        {sub}
      </Text>
    ) : null}
  </Flex>
);
