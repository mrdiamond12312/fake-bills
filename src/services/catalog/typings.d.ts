declare namespace API {
  type TCatalogProduct = {
    id: string;
    title: string;
    barcode: string;
    /** The store's own item code (ART CODE column), e.g. what an Aeon bill prints */
    artCode?: string;
    price: number;
    unit?: string;
    /** Store chain (ACCOUNT column), or the sheet name */
    store?: string;
    /** NOTE column, e.g. which code this store's bill shows */
    note?: string;
    /** 'built-in' or the imported file name */
    source: string;
  };

  type TCatalogSource = {
    name: string;
    importedAt: string;
    count: number;
    sheets: string[];
  };

  type TImportedCatalog = {
    sources: TCatalogSource[];
    products: TCatalogProduct[];
  };
}
