import type { UmiApiRequest, UmiApiResponse } from '@umijs/max';

import { stripDiacritics } from '@/components/Bills/helpers/calc';
import { BUILT_IN_CATALOG } from '@/const/catalog';

const fold = (text: string) => stripDiacritics(text).toLowerCase();

/** GET /api/catalog/products?keyword= — built-in sample products */
export default async function (req: UmiApiRequest, res: UmiApiResponse) {
  const keyword = fold(String(req.query.keyword ?? ''));
  const products: API.TCatalogProduct[] = BUILT_IN_CATALOG.map((product, index) => ({
    ...product,
    id: `built-in:${index}`,
    source: 'built-in',
  })).filter(
    (product) =>
      !keyword || fold(product.title).includes(keyword) || product.barcode.includes(keyword),
  );
  res.status(200).json(products);
}
