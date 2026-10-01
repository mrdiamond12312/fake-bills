import { request } from '@umijs/max';
import * as XLSX from 'xlsx';

import { stripDiacritics } from '@/components/Bills/helpers/calc';
import API_ENDPOINTS from '@/services/catalog/api-path';
import { CATALOG_STORAGE_KEY, readLocalStorage, writeLocalStorage } from '@/utils/local-storage';

export const getBuiltInCatalog = () =>
  request<API.TCatalogProduct[]>(API_ENDPOINTS.CATALOG_PRODUCTS, { method: 'GET' });

const EMPTY_CATALOG: API.TImportedCatalog = { sources: [], products: [] };

export const getImportedCatalog = (): API.TImportedCatalog =>
  readLocalStorage<API.TImportedCatalog>(CATALOG_STORAGE_KEY) ?? EMPTY_CATALOG;

/* ---------------------------------- xlsx ---------------------------------- */

/**
 * The catalog sheet layout (same as assets/SKD.xlsx):
 *   STT | ACCOUNT | BARCODE | ART CODE | SKU NAME | NOTE
 * ACCOUNT is the store chain, SKU NAME is the name as that store prints it,
 * ART CODE is the store's own item code, NOTE says which code the store's bill shows.
 * PRICE / UNIT columns are optional extras.
 */
export const CATALOG_SHEET_NAME = 'SKU';
export const CATALOG_HEADERS = ['STT', 'ACCOUNT', 'BARCODE', 'ART CODE', 'SKU NAME', 'NOTE'];
const OPTIONAL_HEADERS = ['PRICE', 'UNIT'];
const COLUMN_WIDTHS = [
  { wch: 5 },
  { wch: 26 },
  { wch: 18 },
  { wch: 12 },
  { wch: 48 },
  { wch: 44 },
  { wch: 12 },
  { wch: 10 },
];

/** Sheets whose name starts with this are notes, not products, and are skipped on import. */
export const NOTE_SHEET_PREFIX = '_';

type TColumn = 'title' | 'barcode' | 'artCode' | 'price' | 'unit' | 'store' | 'note';

/** Accepted header names per field, compared without accents/spaces/case. */
const HEADER_ALIASES: Record<TColumn, string[]> = {
  title: [
    'skuname',
    'title',
    'name',
    'productname',
    'product',
    'tenhang',
    'tensanpham',
    'sanpham',
    'mathang',
    'hanghoa',
  ],
  barcode: ['barcode', 'ean', 'mavach', 'masp', 'code'],
  artCode: ['artcode', 'art', 'itemcode', 'storecode', 'mahang', 'mahangnoibo'],
  price: ['price', 'unitprice', 'dongia', 'gia', 'giaban', 'giabancovat'],
  unit: ['unit', 'dvt', 'donvi', 'donvitinh'],
  store: ['account', 'store', 'shop', 'cuahang', 'sieuthi', 'chuoi', 'chinhanh'],
  note: ['note', 'notes', 'ghichu'],
};

const normaliseHeader = (header: string) =>
  stripDiacritics(String(header))
    .toLowerCase()
    .replace(/[^a-z0-9]/g, '');

const resolveColumns = (headers: string[]) => {
  const normalised = headers.map(normaliseHeader);
  return Object.fromEntries(
    (Object.keys(HEADER_ALIASES) as TColumn[]).map((column) => {
      const index = normalised.findIndex((header) => HEADER_ALIASES[column].includes(header));
      return [column, index >= 0 ? headers[index] : undefined];
    }),
  ) as Record<TColumn, string | undefined>;
};

/** "12.000", "12,000 đ", 12000 → 12000 */
const parsePrice = (value: unknown) => {
  if (typeof value === 'number') return Math.round(value);
  const digits = String(value ?? '').replace(/[^\d]/g, '');
  return digits ? Number(digits) : 0;
};

const cellText = (row: Record<string, unknown>, column?: string) =>
  column ? String(row[column] ?? '').trim() : '';

export type TCatalogImportResult = {
  source: API.TCatalogSource;
  products: API.TCatalogProduct[];
  skipped: number;
};

/**
 * Reads every sheet (except `_notes` sheets). Rows need a SKU NAME / title.
 * Without an ACCOUNT column, a multi-sheet workbook uses each sheet name as the store.
 */
export const parseCatalogWorkbook = async (file: File): Promise<TCatalogImportResult> => {
  const workbook = XLSX.read(await file.arrayBuffer(), { type: 'array' });
  const sheetNames = workbook.SheetNames.filter((name) => !name.startsWith(NOTE_SHEET_PREFIX));
  const products: API.TCatalogProduct[] = [];
  let skipped = 0;

  sheetNames.forEach((sheetName) => {
    // raw: false → barcodes/codes come back exactly as displayed (no 8.93E+12)
    const rows = XLSX.utils.sheet_to_json<Record<string, unknown>>(workbook.Sheets[sheetName], {
      defval: '',
      raw: false,
    });
    if (!rows.length) return;

    const columns = resolveColumns(Object.keys(rows[0]));
    if (!columns.title) {
      skipped += rows.length;
      return;
    }

    rows.forEach((row, index) => {
      const title = cellText(row, columns.title);
      if (!title) return; // blank rows (templates often pre-number STT down to row 1000)
      products.push({
        id: `${file.name}:${sheetName}:${index}`,
        title,
        barcode: cellText(row, columns.barcode),
        artCode: cellText(row, columns.artCode) || undefined,
        price: parsePrice(columns.price ? row[columns.price] : 0),
        unit: cellText(row, columns.unit) || undefined,
        store:
          cellText(row, columns.store) ||
          (sheetNames.length > 1 && sheetName !== CATALOG_SHEET_NAME ? sheetName : undefined),
        note: cellText(row, columns.note) || undefined,
        source: file.name,
      });
    });
  });

  return {
    source: {
      name: file.name,
      importedAt: new Date().toISOString(),
      count: products.length,
      sheets: sheetNames,
    },
    products,
    skipped,
  };
};

/** Re-importing a file with the same name replaces its products. */
export const saveImportedCatalog = async (file: File) => {
  const result = await parseCatalogWorkbook(file);
  if (!result.products.length) {
    throw new Error('No product rows found. The sheet needs at least a title/name column.');
  }
  const current = getImportedCatalog();
  const next: API.TImportedCatalog = {
    sources: [...current.sources.filter((s) => s.name !== file.name), result.source],
    products: [...current.products.filter((p) => p.source !== file.name), ...result.products],
  };
  writeLocalStorage(CATALOG_STORAGE_KEY, next);
  return result;
};

export const removeImportedSource = async (sourceName?: string) => {
  const current = getImportedCatalog();
  const next: API.TImportedCatalog = sourceName
    ? {
        sources: current.sources.filter((s) => s.name !== sourceName),
        products: current.products.filter((p) => p.source !== sourceName),
      }
    : EMPTY_CATALOG;
  writeLocalStorage(CATALOG_STORAGE_KEY, next);
  return next;
};

/* ------------------------------ xlsx downloads ----------------------------- */

const buildCatalogSheet = (rows: (string | number)[][], withOptional: boolean) => {
  const headers = withOptional ? [...CATALOG_HEADERS, ...OPTIONAL_HEADERS] : CATALOG_HEADERS;
  const sheet = XLSX.utils.aoa_to_sheet([headers, ...rows]);
  sheet['!cols'] = COLUMN_WIDTHS.slice(0, headers.length);
  sheet['!autofilter'] = {
    ref: XLSX.utils.encode_range({
      s: { r: 0, c: 0 },
      e: { r: rows.length, c: headers.length - 1 },
    }),
  };
  // BARCODE + ART CODE as text, so Excel keeps leading zeros and doesn't show 8.93E+12
  const range = XLSX.utils.decode_range(sheet['!ref'] ?? 'A1');
  for (let row = 1; row <= range.e.r; row++) {
    [2, 3].forEach((column) => {
      const cell = sheet[XLSX.utils.encode_cell({ r: row, c: column })];
      if (cell) {
        cell.t = 's';
        cell.v = String(cell.v);
        cell.z = '@';
      }
    });
  }
  return sheet;
};

const writeCatalogWorkbook = (sheet: XLSX.WorkSheet, fileName: string) => {
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, sheet, CATALOG_SHEET_NAME);
  XLSX.writeFile(workbook, fileName);
};

/** Empty catalog in the SKU-sheet layout, with one example row per store account. */
export const downloadCatalogTemplate = (accounts: string[] = []) => {
  const examples = (accounts.length ? accounts : ['']).map((account, index) => [
    index + 1,
    account,
    `893000000${String(index + 1).padStart(3, '0')}${index % 10}`,
    '',
    'TÊN SẢN PHẨM NHƯ IN TRÊN HÓA ĐƠN',
    '',
  ]);
  writeCatalogWorkbook(buildCatalogSheet(examples, false), 'catalog-template.xlsx');
};

/** The current catalog in the same SKU-sheet layout (PRICE/UNIT added only when present). */
export const exportCatalog = (products: API.TCatalogProduct[]) => {
  const withOptional = products.some((product) => product.price || product.unit);
  const rows = products.map((product, index) => [
    index + 1,
    product.store ?? '',
    product.barcode,
    product.artCode ?? '',
    product.title,
    product.note ?? '',
    ...(withOptional ? [product.price || '', product.unit ?? ''] : []),
  ]);
  writeCatalogWorkbook(
    buildCatalogSheet(rows, withOptional),
    `catalog-${new Date().toISOString().slice(0, 10)}.xlsx`,
  );
};
