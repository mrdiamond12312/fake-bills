import { Flex, Tag, Typography } from 'antd';
import { useCallback, useMemo } from 'react';

import { formatMoney, stripDiacritics } from '@/components/Bills/helpers/calc';
import type { TBillTemplate } from '@/components/Bills/types';
import { useCatalogProducts } from '@/services/catalog/services';

const MAX_OPTIONS = 40;

const fold = (text = '') => stripDiacritics(text).toLowerCase();

/** The code this store's bill prints for a product (ART CODE for e.g. Aeon, else barcode). */
export const itemCodeFor = (product: API.TCatalogProduct, template?: TBillTemplate) =>
  template?.itemCode === 'artCode' && product.artCode ? product.artCode : product.barcode;

const renderOption = (
  product: API.TCatalogProduct,
  primary: 'title' | 'code',
  code: string,
  isStoreMatch: boolean,
) => (
  <Flex vertical>
    <Typography.Text ellipsis strong={isStoreMatch}>
      {primary === 'title' ? product.title : code || '—'}
    </Typography.Text>
    <Flex gap={4} align="center" wrap className="text-body-3-regular text-neutral-6">
      <span>{primary === 'title' ? code || '—' : product.title}</span>
      {product.artCode && code !== product.artCode ? <span>· ART {product.artCode}</span> : null}
      {product.price ? <span>· {formatMoney(product.price)}</span> : null}
      {product.store ? (
        <Tag color={isStoreMatch ? 'green' : undefined} className="m-0 text-[10px] leading-4">
          {product.store}
        </Tag>
      ) : null}
    </Flex>
    {product.note ? (
      <Typography.Text type="secondary" ellipsis className="text-[11px]">
        {product.note}
      </Typography.Text>
    ) : null}
  </Flex>
);

/**
 * Search options for the product title / code autocompletes (accent-insensitive).
 * Products whose ACCOUNT belongs to the active store template come first.
 */
export const useCatalogOptions = (template?: TBillTemplate) => {
  const { products, sources, isLoading } = useCatalogProducts();

  const indexed = useMemo(() => {
    const accounts = (template?.catalogAccounts ?? []).map(fold);
    return products
      .map((product) => {
        const store = fold(product.store);
        return {
          product,
          code: itemCodeFor(product, template),
          key: fold(`${product.title} ${product.store ?? ''}`),
          isStoreMatch: !!store && accounts.some((account) => store.includes(account)),
        };
      })
      .sort((a, b) => Number(b.isStoreMatch) - Number(a.isStoreMatch));
  }, [products, template]);

  const searchByTitle = useCallback(
    (term: string) => {
      const needle = fold(term.trim());
      return indexed
        .filter(({ key }) => !needle || key.includes(needle))
        .slice(0, MAX_OPTIONS)
        .map(({ product, code, isStoreMatch }) => ({
          key: product.id,
          value: product.title,
          label: renderOption(product, 'title', code, isStoreMatch),
          product,
        }));
    },
    [indexed],
  );

  const searchByCode = useCallback(
    (term: string) => {
      const needle = term.trim();
      return indexed
        .filter(
          ({ product, code }) =>
            code &&
            (!needle ||
              code.includes(needle) ||
              product.barcode.includes(needle) ||
              product.artCode?.includes(needle)),
        )
        .slice(0, MAX_OPTIONS)
        .map(({ product, code, isStoreMatch }) => ({
          key: product.id,
          value: code,
          label: renderOption(product, 'code', code, isStoreMatch),
          product,
        }));
    },
    [indexed],
  );

  return {
    searchByTitle,
    searchByCode,
    codeFor: (product: API.TCatalogProduct) => itemCodeFor(product, template),
    productCount: products.length,
    storeProductCount: indexed.filter(({ isStoreMatch }) => isStoreMatch).length,
    sources,
    isLoading,
  };
};
