/**
 * Receipt fonts. Files live in /public/fonts so the browser preview and the
 * /api/bills/render route draw with exactly the same static TTFs.
 * Every font here ships Vietnamese glyphs.
 */
export enum FONT_ID {
  inconsolataCondensed = 'inconsolata-condensed',
  vt323 = 'vt323',
  ibmPlexMono = 'ibm-plex-mono',
  robotoCondensed = 'roboto-condensed',
  arimo = 'arimo',
  archivoNarrow = 'archivo-narrow',
  tinos = 'tinos',
  openSans = 'open-sans',
}

export type TFontFile = {
  weight: 400 | 500 | 700;
  file: string;
};

export type TFontPreset = {
  id: FONT_ID;
  family: string;
  label: string;
  /** Receipt printer look it stands in for */
  imitates: string;
  files: TFontFile[];
};

export const FONTS_BASE_PATH = '/fonts';

export const FONT_PRESETS: Record<FONT_ID, TFontPreset> = {
  [FONT_ID.inconsolataCondensed]: {
    id: FONT_ID.inconsolataCondensed,
    family: 'Inconsolata Condensed',
    label: 'Inconsolata Condensed',
    imitates: 'Condensed thermal mono (Epson Font B)',
    files: [
      { weight: 400, file: 'InconsolataCondensed-Regular.ttf' },
      { weight: 700, file: 'InconsolataCondensed-Bold.ttf' },
    ],
  },
  [FONT_ID.vt323]: {
    id: FONT_ID.vt323,
    family: 'VT323',
    label: 'VT323',
    imitates: 'Bitmap mono (Epson Font A)',
    files: [{ weight: 400, file: 'VT323-Regular.ttf' }],
  },
  [FONT_ID.ibmPlexMono]: {
    id: FONT_ID.ibmPlexMono,
    family: 'IBM Plex Mono',
    label: 'IBM Plex Mono',
    imitates: 'Courier-style slab mono',
    files: [
      { weight: 400, file: 'IBMPlexMono-Regular.ttf' },
      { weight: 500, file: 'IBMPlexMono-Medium.ttf' },
      { weight: 700, file: 'IBMPlexMono-Bold.ttf' },
    ],
  },
  [FONT_ID.robotoCondensed]: {
    id: FONT_ID.robotoCondensed,
    family: 'Roboto Condensed',
    label: 'Roboto Condensed',
    imitates: 'Tall condensed sans',
    files: [
      { weight: 400, file: 'RobotoCondensed-Regular.ttf' },
      { weight: 700, file: 'RobotoCondensed-Bold.ttf' },
    ],
  },
  [FONT_ID.arimo]: {
    id: FONT_ID.arimo,
    family: 'Arimo',
    label: 'Arimo',
    imitates: 'Arial / Helvetica',
    files: [
      { weight: 400, file: 'Arimo-Regular.ttf' },
      { weight: 700, file: 'Arimo-Bold.ttf' },
    ],
  },
  [FONT_ID.archivoNarrow]: {
    id: FONT_ID.archivoNarrow,
    family: 'Archivo Narrow',
    label: 'Archivo Narrow',
    imitates: 'Arial Narrow',
    files: [
      { weight: 400, file: 'ArchivoNarrow-Regular.ttf' },
      { weight: 700, file: 'ArchivoNarrow-Bold.ttf' },
    ],
  },
  [FONT_ID.tinos]: {
    id: FONT_ID.tinos,
    family: 'Tinos',
    label: 'Tinos',
    imitates: 'Times New Roman',
    files: [
      { weight: 400, file: 'Tinos-Regular.ttf' },
      { weight: 700, file: 'Tinos-Bold.ttf' },
    ],
  },
  [FONT_ID.openSans]: {
    id: FONT_ID.openSans,
    family: 'Open Sans',
    label: 'Open Sans',
    imitates: 'Segoe UI-like sans',
    files: [
      { weight: 400, file: 'OpenSans-Regular.ttf' },
      { weight: 700, file: 'OpenSans-Bold.ttf' },
    ],
  },
};

export const FONT_OPTIONS = Object.values(FONT_PRESETS).map((font) => ({
  value: font.id,
  label: `${font.label} — ${font.imitates}`,
}));

export const getFontPreset = (fontId?: string) =>
  FONT_PRESETS[fontId as FONT_ID] ?? FONT_PRESETS[FONT_ID.inconsolataCondensed];

export const buildFontFaceCss = () =>
  Object.values(FONT_PRESETS)
    .flatMap((font) =>
      font.files.map(
        ({ weight, file }) =>
          `@font-face{font-family:'${font.family}';font-weight:${weight};font-style:normal;font-display:block;src:url('${FONTS_BASE_PATH}/${file}') format('truetype');}`,
      ),
    )
    .join('\n');
