import { useMutation, useQuery, useQueryClient } from '@umijs/max';

import API_ENDPOINTS from '@/services/catalog/api-path';
import {
  getBuiltInCatalog,
  getImportedCatalog,
  removeImportedSource,
  saveImportedCatalog,
} from '@/services/catalog/api-services';

export const useBuiltInCatalog = () =>
  useQuery<API.TCatalogProduct[]>([API_ENDPOINTS.CATALOG_PRODUCTS], getBuiltInCatalog, {
    staleTime: Infinity,
    refetchOnWindowFocus: false,
  });

export const useImportedCatalog = () =>
  useQuery<API.TImportedCatalog>([API_ENDPOINTS.CATALOG_IMPORTED], getImportedCatalog, {
    staleTime: Infinity,
    refetchOnWindowFocus: false,
  });

/** Imported products first (they're what the user cares about), then the built-in samples. */
export const useCatalogProducts = () => {
  const builtIn = useBuiltInCatalog();
  const imported = useImportedCatalog();
  return {
    products: [...(imported.data?.products ?? []), ...(builtIn.data ?? [])],
    sources: imported.data?.sources ?? [],
    isLoading: builtIn.isLoading || imported.isLoading,
  };
};

export const useImportCatalog = () => {
  const queryClient = useQueryClient();
  return useMutation([API_ENDPOINTS.CATALOG_IMPORTED], (file: File) => saveImportedCatalog(file), {
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: [API_ENDPOINTS.CATALOG_IMPORTED] });
    },
  });
};

export const useRemoveCatalogSource = () => {
  const queryClient = useQueryClient();
  return useMutation(
    [API_ENDPOINTS.CATALOG_IMPORTED, 'remove'],
    (sourceName?: string) => removeImportedSource(sourceName),
    {
      onSettled: () => {
        queryClient.invalidateQueries({ queryKey: [API_ENDPOINTS.CATALOG_IMPORTED] });
      },
    },
  );
};
