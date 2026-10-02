export const DEFAULT_VAT_RATE = 10;

export const VAT_RATE_OPTIONS = [0, 5, 8, 10];

export const PAPER_WIDTH = {
  mm58: 384,
  mm80: 576,
} as const;

/**
 * Watermark is part of every render (preview, projector, PNG, API).
 * These bounds keep it tunable for OCR runs without letting it disappear.
 */
export const WATERMARK_LIMITS = {
  opacity: { min: 0.08, max: 0.6, default: 0.14 },
  size: { min: 12, max: 64, default: 22 },
  angle: { min: -90, max: 90, default: -30 },
  spacing: { min: 0.6, max: 2, default: 1 },
  requiredMark: 'SAMPLE',
  defaultText: 'MẪU · KHÔNG CÓ GIÁ TRỊ THANH TOÁN',
} as const;

export const BILL_RENDER_API = '/api/bills/render';

/** templateId → invoice-number mask the user typed (see fillIdMask). */
export const INVOICE_MASK_STORAGE_KEY = 'receipt-lab.invoice-masks';

export const BILL_DRAFT_STORAGE_KEY = 'receipt-lab.bill-draft';
