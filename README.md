# Receipt Lab

Admin tool for composing **sample** Vietnamese retail receipts to test an OCR pipeline. Built on UmiJS Max + AntD + Tailwind.

Technical details (architecture, API, data formats, adding templates): see [REFERENCE.md](REFERENCE.md).

Every output (preview, projector capture, PNG export, API) carries a tiled `SAMPLE` watermark. Its opacity, size, angle and spacing can be tuned; it can't be removed.

## Run

```bash
pnpm install
pnpm start            # http://localhost:8000/admin/bills/create
```

## What's in the composer

- **Store template**: 10 layouts named after the store receipt they copy (`circle-k`, `go-tops`, `aeon`, `aeon-citimart`, `coopmart`, `emart`, `lotte-mart`, `winmart`, `familymart`, `farmers-market`). Default printed store info is fictional; everything is editable, and each uses the font matched to that printer (Epson Font A/B-style mono, Courier-style, Arial, Times, condensed sans…), including the logo (upload or URL). The form only shows the fields the active template prints.
- **Products**: `+` adds a line. Title and barcode are search-selects over the catalog and also accept free text. Picking a title fills in its barcode, price and unit. Price and quantity are always shown; unit and discount appear when the template uses them.
- **Receipt language**: Tiếng Việt / English for the printed labels (`src/locales/{vi-VN,en-US}/receipt.ts`). Store info, product names and the footer note print as typed. The admin UI follows the language selector in the header.
- **Tax**: VAT defaults to 10%, with a choice of prices including or excluding VAT.
- **Catalog import**: `.xlsx` in the same layout as `assets/SKD.xlsx`: one `SKU` sheet with `STT | ACCOUNT | BARCODE | ART CODE | SKU NAME | NOTE` (optional `PRICE`, `UNIT`). ACCOUNT is the store chain and SKU NAME is the name as that store prints it. Products whose ACCOUNT matches the selected template (`catalogAccounts` in the template) are suggested first, and templates with `itemCode: 'artCode'` (Aeon) fill in ART CODE instead of the barcode. **Download template** and **Export catalog** produce the same layout. Imports are cached in localStorage.
- **Projector**: the receipt as a 3D sheet with curl, cup, wave, tilt/roll, light angle, shadow, camera blur and sensor noise. **Randomize** gives one augmentation sample and **Capture PNG** saves it.
- The draft auto-saves to localStorage. The QR and barcode payloads are random but reproducible from `display.seed`, and the QR points at `example.com`.
- **Page link**: every form value is kept in the URL (`?templateId=coopmart&store.name=…&items.0.quantity=7&tax.vatRate=8…`). Opening a link restores that exact bill, including the seed and date; the link wins over the local draft. **Copy link** copies it. Uploaded (data-URL) logos stay out of the link; image URLs are included.

## API

`GET|POST /api/bills/render` returns `image/png` (or SVG with `format=svg`).

```bash
# query shortcuts
curl -o bill.png "http://localhost:8000/api/bills/render?template=winmart&vat=8&seed=run42&name=Test%20Store&scale=2"

# full bill as JSON (same shape as the form; anything missing falls back to the template defaults)
curl -o bill.png -X POST -H 'Content-Type: application/json' \
  -d '{"templateId":"coopmart","items":[{"title":"Bánh mì","barcode":"8930000000017","unitPrice":15000,"quantity":2}],"tax":{"vatRate":10},"display":{"seed":"run42"},"scale":2}' \
  http://localhost:8000/api/bills/render

# list templates and the fields each one prints
curl "http://localhost:8000/api/bills/render?list=templates"
```

`logo=<image URL>` sets the logo src; `qr=` and `barcode=` set the code contents (empty → random from the seed). GET also accepts `payload=<base64url JSON>`. The **copy link** button in the preview builds that URL from the current form. Response headers `X-Bill-Template` and `X-Bill-Seed` identify the render. The API returns the flat receipt only; projector effects are browser-only for now.

`GET /api/catalog/products?keyword=` returns the built-in sample catalog (accent-insensitive search).

## Adding a store template

1. Create `src/components/Bills/templates/<Name>/index.tsx` exporting a `TBillTemplate`: a component plus font, paper width, the `fields` it prints, and default store info.
2. Append it to `BILL_TEMPLATES` in `src/components/Bills/registry.ts`.

The form, preview, projector, API and Storybook pick it up from there.

Template rules (the same component is rendered server-side by satori):

- Use AntD `<Flex>` for layout and AntD `<Image>` / `PrintImage` for images. `src/utils/render-bill/to-satori.ts` maps them to plain elements for the API.
- Use Tailwind classes for static styling (passed to satori as `tw`). Put values derived from the font size in `style`. Satori's `tw` ignores a few utilities (`whitespace-*`, `gap-*`, `object-*`, `leading-*`); use `style` or `Flex gap` for those.
- Text nodes must be a single string child, and templates can't use hooks.
- Printed labels come from the `t` prop (`t('receipt.total')`); add new keys to both `src/locales/*/receipt.ts` files.
- The primitives in `shared/Print.tsx` (`Text`, `Cells`, `KeyValue`, `CharLine`, `PrintScale` for double-height…) cover most layouts.

## Fonts

`public/fonts` holds static TTF instances of Google Fonts (all with Vietnamese glyphs) that stand in for common receipt-printer fonts. Both the browser and the API load them from there. See `src/components/Bills/fonts.ts`.

## Tests

- Storybook: `pnpm storybook` (one story per template in `src/components/Bills/index.stories.tsx`)
- Cypress: `pnpm cypress:open`, with a smoke spec in `cypress/e2e`. The Cypress binary was skipped at install; run `pnpm exec cypress install` first.
