import { FONT_ID } from '@/components/Bills/fonts';
import { BILL_TEMPLATES } from '@/components/Bills/registry';
import { DEFAULT_VAT_RATE, WATERMARK_LIMITS } from '@/const/bill';
import { API_MAX_ITEMS } from '@/pages/admin/api-docs/helpers/apiFormKeys';

/** `'a' | 'b' | …` wrapped to the code block width, each line starting with `| ` */
const union = (values: string[], indent: string) => {
  const lines: string[] = [];
  values.forEach((value) => {
    const part = `'${value}'`;
    const last = lines.length - 1;
    if (last >= 0 && lines[last].length + part.length + 3 <= 80) {
      lines[last] += ` | ${part}`;
    } else {
      lines.push(`${indent}| ${part}`);
    }
  });
  return `\n${lines.join('\n')}`;
};

const range = ({ min, max, default: fallback }: { min: number; max: number; default: number }) =>
  `${min} – ${max}, default ${fallback}`;

/**
 * The request body as a TypeScript type for API clients. Built from the registry and constants
 * so template ids, fonts and limits stay in sync with the server.
 */
export const buildRequestType = () => {
  const { opacity, size, angle, spacing } = WATERMARK_LIMITS;
  return `/** Body of POST /api/bills/render, and the JSON in GET ?data= */
type BillRenderRequest = {
  /** Unknown ids fall back to '${
    BILL_TEMPLATES[0].id
  }'. Live list: GET /api/bills/render?list=templates */
  templateId?:${union(
    BILL_TEMPLATES.map(({ id }) => id),
    '    ',
  )};
  store?: {
    /** Printed exactly as given. Empty → the template's fictional default */
    name?: string;
    legalName?: string;
    branch?: string;
    address?: string;
    phone?: string;
    hotline?: string;
    taxCode?: string;
    website?: string;
    slogan?: string;
    /** http(s) image URL or data URL. Empty → text wordmark */
    logoUrl?: string;
    /** px */
    logoWidth?: number;
    logoAlign?: 'left' | 'center' | 'right';
    showLogo?: boolean;
  };
  transaction?: {
    invoiceNo?: string;
    posNo?: string;
    cashier?: string;
    /** ISO 8601, e.g. '2026-10-20T10:03:00+07:00'. Default: now */
    dateTime?: string;
    paymentMethod?: string;
    /** VND handed over. Empty → exactly the total */
    amountPaid?: number;
    customerName?: string;
    memberCode?: string;
    /** E-invoice lookup code put in the random QR link (Circle K also prints it) */
    lookupCode?: string;
    /** Overrides the value OCR reads as bill_id (Mã CQT or barcode). Empty → generated */
    billId?: string;
  };
  /** Replaces the whole list (no per-item merge). At most ${API_MAX_ITEMS}. Empty → 2 sample items */
  items?: {
    title: string;
    barcode?: string;
    unit?: string;
    /** VND */
    unitPrice: number;
    quantity: number;
    /** Absolute VND off the line */
    discount?: number;
  }[];
  tax?: {
    /** Percent. Default ${DEFAULT_VAT_RATE} */
    vatRate?: number;
    /** true (default) → prices already include VAT; false → VAT added on top */
    priceIncludesVat?: boolean;
  };
  display?: {
    /** Language of the printed labels. Default 'vi' */
    language?: 'vi' | 'en';
    /** Overrides the template's font */
    fontId?:${union(Object.values(FONT_ID), '      ')};
    /** Base font size, px */
    fontSize?: number;
    /** Paper width, px (58 mm ≈ 384, 80 mm ≈ 576) */
    paperWidth?: number;
    /** Same seed → same QR, barcode and generated codes. Default: random */
    seed?: string;
    /** QR content. Empty → random from the seed */
    qrText?: string;
    /** Code 128 content, printable ASCII ≤ 80. Empty → from the seed */
    barcodeText?: string;
    showQr?: boolean;
    showBarcode?: boolean;
    /** 0.45 (faded) – 1 (crisp). Default 1 */
    inkDensity?: number;
    /** Cut item names to about N printed lines + "...". Decimals ok; 0 = full. Default 0 */
    itemNameLines?: number;
    /** Always rendered. Values are clamped and the ${
      WATERMARK_LIMITS.requiredMark
    } mark is always kept */
    watermark?: {
      text?: string;
      /** ${range(opacity)} */
      opacity?: number;
      /** px, ${range(size)} */
      size?: number;
      /** degrees, ${range(angle)} */
      angle?: number;
      /** ${range(spacing)} */
      spacing?: number;
      /** CSS colour, default '#b3261e' */
      color?: string;
    };
  };
  footerNote?: string;

  /** Output zoom, 1 – 4. Default 2 */
  scale?: number;
  /** Default 'png' */
  format?: 'png' | 'svg';
};

/** GET /api/bills/render?list=templates returns BillTemplateInfo[] */
type BillTemplateInfo = {
  id: string;
  name: string;
  description: string;
  printerStyle: string;
  /** Optional fields this template prints, e.g. 'store.address', 'item.discount' */
  fields: string[];
};`;
};
