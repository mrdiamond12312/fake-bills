import { billsLocale } from '@/locales/en-US/bills';
import { receiptLocale } from '@/locales/en-US/receipt';
import { templatesLocale } from '@/locales/en-US/templates';

export default {
  ...billsLocale,
  ...templatesLocale,
  ...receiptLocale,
};
