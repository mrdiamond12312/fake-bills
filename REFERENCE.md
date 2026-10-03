# Receipt Lab: technical reference

Receipt Lab composes **sample** Vietnamese retail receipts for testing OCR pipelines. You fill in a form and get:

- a live preview, exportable as PNG
- a 3D **projector** that curls, tilts and lights the receipt like a photo (augmentation for OCR)
- an HTTP API that renders the same receipt to PNG or SVG

Every output carries a tiled `SAMPLE` watermark. You can adjust it but not remove it.

For setup and day-to-day usage, see [README.md](README.md).

---

## Contents

1. [Architecture](#architecture)
2. [Data model](#data-model)
3. [Templates](#templates)
4. [Render API](#render-api)
5. [Product catalog (xlsx)](#product-catalog-xlsx)
6. [Shareable page links](#shareable-page-links)
7. [i18n](#i18n)
8. [Fonts](#fonts)
9. [Watermark](#watermark)
10. [Adding a template](#adding-a-template)
11. [Project structure](#project-structure)
12. [Scripts](#scripts)

---

## Architecture

```
            ┌──────────────── browser ────────────────┐        ┌──────────── server (Umi apiRoute) ───────────┐
 form ──►   │ useBillForm → normalizeBillData()        │        │ /api/bills/render                              │
 (RHF+yup)  │   ├─ calculateTotals()  ├─ generateBillCodes() │  │   normalizeBillData(query | JSON)              │
            │   └─ <BillRenderer> ──► DOM preview      │        │   <BillRenderer> ─► toSatoriTree() ─► satori   │
            │          ├─ PNG export (html-to-image)   │        │        ─► SVG + watermark <pattern> ─► resvg   │
            │          └─ Projector (three.js texture) │        │        ─► PNG                                   │
            └──────────────────────────────────────────┘        └────────────────────────────────────────────────┘
```

- **One component tree for both outputs.** `BillRenderer` (Paper + template) is pure: it uses no hooks. The browser renders it as DOM. The server converts it with `toSatoriTree()`, which maps AntD `Flex` / `Image` to plain elements and passes Tailwind `className` to satori's `tw`, then draws it with satori and resvg.
- **Same fonts on both sides.** Fonts are static TTFs in `public/fonts`, used by the browser `@font-face` and by satori.
- **Deterministic codes.** QR and barcode content is random but seeded by `display.seed`, so the same seed gives the same codes. Custom content overrides it.

Stack: UmiJS Max 4, React 18, Ant Design 5, Tailwind 3, react-hook-form + yup, react-query, react-three-fiber, satori, @resvg/resvg-js, bwip-js, SheetJS.

---

## Data model

`TBillData` (`src/components/Bills/types.ts`) is the single shape used by the form, the page link and the API:

```ts
{
  templateId: string;              // see Templates
  store: {
    name; legalName?; branch?; address?; phone?; hotline?; taxCode?; website?; slogan?;
    logoUrl?;                       // image URL or data URL; empty → text wordmark
    logoWidth?; logoAlign?: 'left'|'center'|'right'; showLogo?;
  };
  transaction: {
    invoiceNo?; posNo?; cashier?; dateTime? /* ISO */; paymentMethod?;
    amountPaid?;                    // empty → exact total
    customerName?; memberCode?; lookupCode?;
  };
  items: { title; barcode?; unit?; unitPrice; quantity; discount? }[];
  tax: { vatRate /* % , default 10 */; priceIncludesVat /* default true */ };
  display: {
    language?: 'vi'|'en';           // printed labels
    fontId?; fontSize?; paperWidth?;// override the template's font / size / width
    seed?;                          // QR/barcode/lookup randomness
    qrText?; barcodeText?;          // custom code content (barcode: Code 128, ASCII ≤ 80)
    showQr?; showBarcode?; inkDensity? /* 0.45–1 */;
    watermark?: { text?; opacity?; size?; angle?; spacing?; color? };
  };
  footerNote?: string;
}
```

`normalizeBillData(partial)` fills anything missing from the template defaults, so the API and the page link only need the fields you want to change.

**Totals** (`helpers/calc.ts`): line total = `unitPrice × quantity − discount`. When `priceIncludesVat` is on, VAT is extracted from the net amount; when it's off, VAT is added on top.

---

## Templates

Each template is named after the receipt layout it reproduces and ships with **fictional** default store details.

| id | Layout | Font (stands in for) | Paper width | Item code printed |
| --- | --- | --- | --- | --- |
| `circle-k` | Circle K | Inconsolata Condensed (Epson Font B) | 416 px | barcode |
| `go-tops` | GO! / Tops Market | Inconsolata Condensed (Epson Font B) | 384 px | barcode |
| `aeon` | Aeon | Inconsolata Condensed (Epson Font B) | 416 px | **ART CODE** |
| `aeon-citimart` | Aeon Citimart / MM Mega Market | VT323 (Epson Font A) | 400 px | barcode |
| `coopmart` | Co.opmart | IBM Plex Mono (Courier-style) | 480 px | barcode |
| `emart` | Emart | Roboto Condensed | 400 px | barcode |
| `lotte-mart` | Lotte Mart | Inconsolata Condensed (Epson Font B) | 416 px | barcode |
| `winmart` | WinMart / Bách Hóa Xanh | Arimo (Arial) | 400 px | barcode |
| `familymart` | FamilyMart / GS25 | Tinos (Times New Roman) | 400 px | barcode |
| `farmers-market` | Farmers Market | Open Sans (Segoe UI-like) | 416 px | barcode |

Each template definition (`TBillTemplate`) declares:

- `fields`: the optional form fields it prints. The form hides the rest.
- `catalogAccounts`: catalog `ACCOUNT` values that belong to this store. Their products are suggested first.
- `itemCode`: `'artCode'` makes product picks fill in the store's own code instead of the EAN.
- `defaults`: default store info, transaction, footer note and tax. `defaults.store.logoUrl` sets a default logo image.

`GET /api/bills/render?list=templates` returns the live list.

---

## Render API

`GET | POST /api/bills/render` returns `image/png`, or `image/svg+xml` with `format=svg`.

### POST (full control)

Send any subset of `TBillData` as the JSON body, plus `scale` (1–4, default 2) and `format`:

```bash
curl -o bill.png -X POST -H 'Content-Type: application/json' http://localhost:8000/api/bills/render -d '{
  "templateId": "coopmart",
  "store": { "name": "My Test Mart", "logoUrl": "https://example.com/logo.png" },
  "items": [{ "title": "Bánh mì", "barcode": "8930000000017", "unitPrice": 15000, "quantity": 2 }],
  "tax": { "vatRate": 8 },
  "display": { "seed": "run-42", "language": "en", "barcodeText": "TEST-128" },
  "scale": 2
}'
```

### GET (query shortcuts)

| Param             | Sets                                                      |
| ----------------- | --------------------------------------------------------- |
| `template`        | `templateId`                                              |
| `vat`             | `tax.vatRate`                                             |
| `seed`            | `display.seed`                                            |
| `language`        | `display.language` (`vi` \| `en`)                         |
| `name`            | `store.name`                                              |
| `logo`            | `store.logoUrl`                                           |
| `cashier`         | `transaction.cashier`                                     |
| `invoice`         | `transaction.invoiceNo`                                   |
| `qr`              | `display.qrText`                                          |
| `barcode`         | `display.barcodeText`                                     |
| `items`           | `items` (JSON array)                                      |
| `payload`         | full bill as base64url JSON (shortcuts above override it) |
| `scale`, `format` | output options                                            |

```bash
curl -o bill.png "http://localhost:8000/api/bills/render?template=winmart&vat=8&seed=run42&language=en"
```

Response headers `X-Bill-Template` and `X-Bill-Seed` identify the render. Errors return `400 { message }`. A bill can have at most 200 items.

### Other endpoints

- `GET /api/catalog/products?keyword=`: the built-in demo catalog. Search ignores accents.

---

## Product catalog (xlsx)

Product title and barcode inputs search a catalog made of a built-in demo list plus your imported `.xlsx` / `.xls` / `.csv` files. Imports are cached in localStorage.

**Sheet layout** (one sheet named `SKU`):

| STT | ACCOUNT | BARCODE | ART CODE | SKU NAME | NOTE | _PRICE_ | _UNIT_ |
| --- | --- | --- | --- | --- | --- | --- | --- |
| row no. | store chain | EAN | store's own item code | name as the store prints it | which code the bill shows | optional | optional |

- Header matching ignores case, accents and spaces, and Vietnamese aliases are accepted (`Tên hàng`, `Mã vạch`, `Đơn giá`, `ĐVT`, …).
- BARCODE and ART CODE are kept as text, so leading zeros survive.
- Without an ACCOUNT column, each sheet in a multi-sheet workbook is treated as its own store. Sheets whose name starts with `_` are skipped.
- Re-importing a file with the same name replaces its products.
- **Download template** gives an empty sheet in this layout. **Export catalog** writes your imported products back in the same layout.

---

## Shareable page links

The composer keeps **every form value** in the page URL as flat, readable keys:

```
/admin/bills/create?templateId=coopmart&store.name=My%20Mart&items.0.title=…&items.0.quantity=7&tax.vatRate=8&display.seed=…
```

Opening a link restores that exact bill, with numbers and booleans restored to their types, the same date and the same codes. A link takes priority over the local draft. Uploaded (data-URL) logos are left out of the link; image URLs are included. Helpers live in `src/utils/query-params.ts`.

---

## i18n

| What | Where | How |
| --- | --- | --- |
| Admin UI | `src/locales/{en-US,vi-VN}/bills.ts` | Umi `formatMessage` / `FormattedMessage`, switched with the header language selector |
| Template picker and font labels | `src/locales/*/templates.ts` | keys `bills.template.<id>.name/description`, `bills.font.<fontId>` |
| Printed receipt labels | `src/locales/*/receipt.ts` | pure `t()` passed to templates (`helpers/receipt-text.ts`), switched with `display.language`. It works server-side, where the Umi runtime isn't available |

---

## Fonts

All fonts are static TTF instances of Google Fonts with Vietnamese glyphs, stored in `public/fonts` and registered in `src/components/Bills/fonts.ts`:

| id                      | Family                 | Stands in for                         |
| ----------------------- | ---------------------- | ------------------------------------- |
| `inconsolata-condensed` | Inconsolata (width 75) | Condensed thermal mono (Epson Font B) |
| `vt323`                 | VT323                  | Bitmap mono (Epson Font A)            |
| `ibm-plex-mono`         | IBM Plex Mono          | Courier-style slab mono               |
| `roboto-condensed`      | Roboto Condensed       | Tall condensed sans                   |
| `arimo`                 | Arimo                  | Arial / Helvetica                     |
| `archivo-narrow`        | Archivo Narrow         | Arial Narrow                          |
| `tinos`                 | Tinos                  | Times New Roman                       |
| `open-sans`             | Open Sans              | Segoe UI-like sans                    |

Any template can be re-rendered in another font with `display.fontId`.

---

## Watermark

- **Browser:** an overlay with an SVG `<pattern>` background.
- **Server:** the same pattern markup injected into satori's SVG before rasterising. A single pattern avoids resvg's problems with off-canvas geometry.
- **Tunable:** text, opacity, size, angle, spacing and colour.
- **Enforced:** `resolveWatermark()` clamps every value, applies a minimum opacity of 0.08, and always keeps the `SAMPLE` mark, whatever the request contains.

---

## Adding a template

1. Create `src/components/Bills/templates/<Name>/index.tsx`, exporting a pure component and a `TBillTemplate`:
   - Lay out with AntD `<Flex>` and the primitives in `shared/Print.tsx` (`Text`, `Cells`, `KeyValue`, `CharLine`, `RuleLine`, `PrintScale` for double-height lines, `PrintImage`, `Logo`, `Wordmark`).
   - Use Tailwind for static styles and `style` for values derived from the font size. Satori's `tw` ignores `whitespace-*`, `gap-*`, `object-*` and relative `leading-*`.
   - No hooks, and every text node must be a single string child.
   - Printed labels come from `t('receipt.…')`. Add new keys to both `locales/*/receipt.ts`.
2. Register it in `src/components/Bills/registry.ts`.
3. Add picker labels in `src/locales/*/templates.ts` and a story in `src/components/Bills/index.stories.tsx`.
4. Check both render paths: the page preview and `/api/bills/render?template=<id>`.

---

## Project structure

```
config/                         Umi config + routes
public/fonts/                   receipt fonts (browser + API)
src/
  api/                          Umi API routes (bills/render, catalog/products)
  components/
    Bills/                      renderer, templates, primitives, helpers, fonts, registry
    Projector/                  three.js projector (ReceiptMesh, settings)
    Input/                      react-hook-form controlled inputs
  layouts/Admin/                sidebar + header layout
  locales/{en-US,vi-VN}/        bills (UI), templates (picker), receipt (printed labels)
  pages/admin/bills/create/     composer page: components/, hooks/, helpers/
  pages/admin/api-docs/         Render API page: endpoint reference + live playground
  services/catalog/             catalog service (xlsx import/export, localStorage, react-query)
  utils/                        render-bill (satori pipeline), query-params, local-storage
cypress/, .storybook/           test scaffolding
```

---

## Scripts

| Script                        | Does                                           |
| ----------------------------- | ---------------------------------------------- |
| `pnpm start`                  | dev server on :8000                            |
| `pnpm build` / `pnpm preview` | production build / preview                     |
| `pnpm tsc`                    | type check                                     |
| `pnpm lint` / `pnpm lint:fix` | ESLint + Prettier + tsc                        |
| `pnpm storybook`              | Storybook (one story per template)             |
| `pnpm cypress:open`           | Cypress (run `pnpm exec cypress install` once) |
