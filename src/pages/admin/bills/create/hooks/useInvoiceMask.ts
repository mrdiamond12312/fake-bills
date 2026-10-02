import { useCallback, useState } from 'react';
import { useFormContext } from 'react-hook-form';

import { fillIdMask } from '@/components/Bills/helpers/random';
import { INVOICE_MASK_STORAGE_KEY } from '@/const/bill';
import { readLocalStorage, writeLocalStorage } from '@/utils/local-storage';

type TMaskMap = Record<string, string>;

/** Per-template invoice-number mask (user-typed, kept locally) and a generator that fills it. */
export const useInvoiceMask = (templateId: string) => {
  const { setValue } = useFormContext();
  const [masks, setMasks] = useState<TMaskMap>(
    () => readLocalStorage<TMaskMap>(INVOICE_MASK_STORAGE_KEY) ?? {},
  );
  const mask = masks[templateId] ?? '';

  const handleMaskChange = useCallback(
    (next: string) => {
      const updated = { ...masks, [templateId]: next };
      setMasks(updated);
      try {
        writeLocalStorage(INVOICE_MASK_STORAGE_KEY, updated);
      } catch {
        // masks are a convenience; keep working in memory
      }
    },
    [masks, templateId],
  );

  const handleGenerate = useCallback(
    () => setValue('transaction.invoiceNo', fillIdMask(mask), { shouldDirty: true }),
    [mask, setValue],
  );

  return { mask, handleMaskChange, handleGenerate } as const;
};
