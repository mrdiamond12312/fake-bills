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
3. [Bill ID](#bill-id)
4. [Templates](#templates)
5. [Render API](#render-api)
6. [Product catalog (xlsx)](#product-catalog-xlsx)
7. [Shareable page links](#shareable-page-links)
8. [i18n](#i18n)
9. [Fonts](#fonts)
10. [Watermark](#watermark)
11. [Adding a template](#adding-a-template)
12. [Project structure](#project-structure)
13. [Scripts](#scripts)

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
    customerName?; memberCode?;
    lookupCode?;                    // goes into the random QR link (Circle K also prints it)
    billId?;                        // the OCR bill_id; overrides the Mã CQT or barcode, see below
  };
  items: { title; barcode?; unit?; unitPrice; quantity; discount? }[];
  tax: { vatRate /* % , default 10 */; priceIncludesVat /* default true */ };
  display: {
    language?: 'vi'|'en';           // printed labels
    fontId?; fontSize?; paperWidth?;// override the template's font / size / width
    seed?;                          // QR/barcode/lookup randomness
    qrText?; barcodeText?;          // custom code content (barcode: Code 128, ASCII ≤ 80)
    showQr?; showBarcode?; inkDensity? /* 0.45–1 */;
    itemNameLines?;                 // cut item names to ~N printed lines + "..." (decimals ok, 0 = full)
    watermark?: { text?; opacity?; size?; angle?; spacing?; color? };
  };
  footerNote?: string;
}
```

`normalizeBillData(partial)` fills anything missing from the template defaults, so the API and the page link only need the fields you want to change.

**Totals** (`helpers/calc.ts`): line total = `unitPrice × quantity − discount`. When `priceIncludesVat` is on, VAT is extracted from the net amount; when it's off, VAT is added on top.

---

## Bill ID

`bill_id` is what the OCR prompt extracts and the backend's `getBillIdConfidence` (ocr.ts) checks. Each template declares where it prints it (`billId: { source, retailer }`); `src/components/Bills/helpers/bill-id.ts` mirrors the backend rules, and the composer's **Bill ID** field shows ✓/✗ for the printed value plus one passing and one failing suggestion.

| Template | Printed as | Backend key | Rule |
| --- | --- | --- | --- |
| `aeon`, `coopmart`, `winmart` | Mã CQT | `aeon`, `coopmart`, `winmart` | `M1-<25\|26>-<4–6 A–Z/0–9>-<8–12 digits>` |
| `emart` | barcode | `emart` | `0` + YYYYMMDD (±1 day of the bill) + 12–14 digits |
| `lotte-mart` | barcode | `lottemart` | 3 digits + YYMMDD (±1 day) + 14–16 digits |
| `go-tops` | barcode | `go`, `topsmarket` | `660000` + 28–32 digits |

Empty `billId` → a preset that passes (Mã CQT uses the fixed `TEST0` series so it can't match a real invoice). Precedence for the barcode: `billId` (when the template's bill ID is the barcode) → `display.barcodeText` → generated.

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

### Overview

| Endpoint | Returns |
| --- | --- |
| `POST /api/bills/render` | The bill image, from a JSON body |
| `GET /api/bills/render?…` | The bill image, from the query string |
| `GET /api/bills/render?list=templates` | JSON list of templates: `id`, `name`, `description`, `printerStyle`, `fields` |
| `GET /api/catalog/products?keyword=` | The built-in demo catalog. Search ignores accents. |

**The input is always the same object:** any subset of `TBillData` plus two output options. The full TypeScript type is in [Request body type](#request-body-type). Anything left out falls back to the template's defaults.

| Option | Values | Default |
| --- | --- | --- |
| `scale` | `1`–`4` | `2` |
| `format` | `png` \| `svg` | `png` |

**Response**

- `200` with `image/png` or `image/svg+xml`.
- Headers `X-Bill-Template` and `X-Bill-Seed` identify the render. Re-sending the same seed gives the same codes.
- `400 { message }` on bad input. A bill can have at most 200 items.
- The watermark is always applied. See [Watermark](#watermark).

### Request body type

Copy this into your client to get autocomplete and type checks. Every field is optional. Missing fields come from the template's defaults, and a bill with no `items` prints two sample items.

```ts
/** Body of POST /api/bills/render, and the JSON in GET `?data=` */
type BillRenderRequest = {
  /** Unknown ids fall back to the default template. Live list: GET /api/bills/render?list=templates */
  templateId?:
    | 'winmart' | 'winmart-2026' | 'coopmart' | 'circle-k' | 'familymart' | 'aeon'
    | 'aeon-citimart' | 'lotte-mart' | 'emart' | 'go-tops' | 'farmers-market';
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
  /** Replaces the whole list; there is no per-item merge */
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
    /** Percent. Default 10 */
    vatRate?: number;
    /** true (default) → prices already include VAT; false → VAT added on top */
    priceIncludesVat?: boolean;
  };
  display?: {
    /** Language of the printed labels. Default 'vi' */
    language?: 'vi' | 'en';
    /** Overrides the template's font */
    fontId?:
      | 'inconsolata-condensed' | 'vt323' | 'ibm-plex-mono' | 'roboto-condensed'
      | 'arimo' | 'archivo-narrow' | 'tinos' | 'open-sans';
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
    /** Always rendered. Values are clamped and the SAMPLE mark is always kept */
    watermark?: {
      text?: string;
      /** 0.08 – 0.6, default 0.14 */
      opacity?: number;
      /** px, 12 – 64, default 22 */
      size?: number;
      /** degrees, -90 – 90, default -30 */
      angle?: number;
      /** 0.6 – 2, default 1 */
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

/** GET /api/bills/render?list=templates */
type BillTemplateInfo = {
  id: string;
  name: string;
  description: string;
  printerStyle: string;
  /** Optional form fields this template prints, e.g. 'store.address', 'item.discount' */
  fields: string[];
};
```

The source types are `TBillData` in `src/components/Bills/types.ts` and `TDeepPartialBill` in `src/components/Bills/helpers/normalize.ts`. Update the block above when they change.

### Ways to send the bill

| Way | Use it when | Example |
| --- | --- | --- |
| 1. **POST** JSON body | Calling from code. No size limit. | `-d '{"templateId":"winmart-2026",…}'` |
| 2. **GET `data`** | You need a URL and have an object in code | `?data=%7B%22templateId%22…` |
| 3. **GET dotted params** | Writing or editing a link by hand | `?templateId=winmart-2026&store.name=…` |

All three accept the same fields. URLs over about 8–16 KB (many items, uploaded data-URL logos) get rejected by servers and proxies, so use POST for big bills.

#### 1. POST

```bash
curl -o bill.png -X POST -H 'Content-Type: application/json' \
  http://localhost:8000/api/bills/render -d '{
  "templateId": "coopmart",
  "store": { "name": "My Test Mart", "logoUrl": "https://example.com/logo.png" },
  "items": [{ "title": "Bánh mì", "barcode": "8930000000017", "unitPrice": 15000, "quantity": 2 }],
  "tax": { "vatRate": 8 },
  "display": { "seed": "run-42", "language": "en", "barcodeText": "TEST-128" },
  "scale": 2
}'
```

#### 2. GET with `data`

`data` is the POST body as URL-encoded JSON (OpenAPI calls this a `content: application/json` parameter). `scale` and `format` can go inside it or next to it.

```js
const bill = {
  templateId: 'winmart-2026',
  store: { name: 'My Test Mart' },
  items: [{ title: 'Bánh mì', unitPrice: 15000, quantity: 2 }],
  display: { seed: 'run42' },
  scale: 2,
};
const url = `http://localhost:8000/api/bills/render?data=${encodeURIComponent(JSON.stringify(bill))}`;
```

```python
import json
from urllib.parse import quote

url = 'http://localhost:8000/api/bills/render?data=' + quote(json.dumps(bill, ensure_ascii=False))
```

#### 3. GET with dotted params

Each field is one param, named by its path: nested keys joined with `.`, array items by index. This is the same format as the composer's page link, and **Copy API link** in the composer builds it from the current bill, uploaded logos included.

```bash
curl -o bill.png "http://localhost:8000/api/bills/render?templateId=winmart-2026\
&store.name=My%20Test%20Mart&transaction.cashier=0001&tax.vatRate=8\
&items.0.title=B%C3%A1nh%20m%C3%AC&items.0.unitPrice=15000&items.0.quantity=2&items.0.discount=2000\
&display.seed=run42&display.itemNameLines=1&display.watermark.opacity=0.2&scale=2"
```

| Rule | Example |
| --- | --- |
| Roots: `templateId`, `store`, `transaction`, `items`, `tax`, `display`, `footerNote` | `store.name=My%20Mart` |
| Nested objects use `.` | `display.watermark.opacity=0.2` |
| Array items use their index | `items.0.title=…&items.1.title=…` |
| Numbers and `true`/`false` are typed from the template's defaults | `tax.vatRate=8`, `display.showQr=false` |
| Any `items.N.*` param replaces the whole item list | |
| `scale` and `format` are plain params | `scale=2&format=svg` |

Dotted params are this API's own convention, not a standard. `qs.stringify` writes brackets (`items[0][title]`), which this API doesn't read. To generate dotted params from an object, flatten it yourself, or use way 2 instead:

```js
const toDotted = (value, prefix = '', out = new URLSearchParams()) => {
  if (value === undefined || value === null) return out;
  if (typeof value === 'object') {
    Object.entries(value).forEach(([key, child]) => toDotted(child, prefix ? `${prefix}.${key}` : key, out));
  } else {
    out.append(prefix, String(value));
  }
  return out;
};

const url = `http://localhost:8000/api/bills/render?${toDotted(bill)}`;
// …?templateId=winmart-2026&store.name=My+Test+Mart&items.0.title=B%C3%A1nh+m%C3%AC&…
```

### Client examples

Each example sends the same bill. It POSTs it and saves `bill.png`, then builds the equivalent GET `data` URL. Only standard libraries are used. Replace `http://localhost:8000` with your deployment.

<details>
<summary><b>TypeScript / JavaScript</b> (Node 18+ or browser)</summary>

```ts
const API = 'http://localhost:8000/api/bills/render';

const bill: BillRenderRequest = {
  templateId: 'winmart-2026',
  store: { name: 'My Test Mart' },
  items: [{ title: 'Bánh mì', unitPrice: 15000, quantity: 2 }],
  display: { seed: 'run42' },
  scale: 2,
};

// POST
const res = await fetch(API, {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify(bill),
});
if (!res.ok) throw new Error((await res.json()).message);
const png = new Uint8Array(await res.arrayBuffer());
// Node: (await import('node:fs/promises')).writeFile('bill.png', png)
// Browser: URL.createObjectURL(new Blob([png], { type: 'image/png' }))

// GET
const url = `${API}?data=${encodeURIComponent(JSON.stringify(bill))}`;
```

</details>

<details>
<summary><b>Python</b> (3.8+)</summary>

```python
import json
import urllib.request
from urllib.parse import quote

API = 'http://localhost:8000/api/bills/render'

bill = {
    'templateId': 'winmart-2026',
    'store': {'name': 'My Test Mart'},
    'items': [{'title': 'Bánh mì', 'unitPrice': 15000, 'quantity': 2}],
    'display': {'seed': 'run42'},
    'scale': 2,
}

# POST (raises HTTPError on 400; the body has {"message": ...})
req = urllib.request.Request(
    API,
    data=json.dumps(bill).encode(),
    headers={'Content-Type': 'application/json'},
    method='POST',
)
with urllib.request.urlopen(req) as res, open('bill.png', 'wb') as f:
    f.write(res.read())

# GET
url = f'{API}?data={quote(json.dumps(bill, ensure_ascii=False))}'
```

With `requests`: `requests.post(API, json=bill).content`, and `requests.get(API, params={'data': json.dumps(bill)})`.

</details>

<details>
<summary><b>Go</b></summary>

```go
package main

import (
	"bytes"
	"encoding/json"
	"fmt"
	"io"
	"net/http"
	"net/url"
	"os"
)

const api = "http://localhost:8000/api/bills/render"

func main() {
	bill := map[string]any{
		"templateId": "winmart-2026",
		"store":      map[string]any{"name": "My Test Mart"},
		"items":      []map[string]any{{"title": "Bánh mì", "unitPrice": 15000, "quantity": 2}},
		"display":    map[string]any{"seed": "run42"},
		"scale":      2,
	}
	body, _ := json.Marshal(bill)

	// POST
	res, err := http.Post(api, "application/json", bytes.NewReader(body))
	if err != nil {
		panic(err)
	}
	defer res.Body.Close()
	png, _ := io.ReadAll(res.Body)
	if res.StatusCode != http.StatusOK {
		panic(string(png)) // {"message": ...}
	}
	os.WriteFile("bill.png", png, 0o644)

	// GET
	fmt.Println(api + "?data=" + url.QueryEscape(string(body)))
}
```

</details>

<details>
<summary><b>Java</b> (15+)</summary>

```java
import java.net.URI;
import java.net.URLEncoder;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.nio.charset.StandardCharsets;
import java.nio.file.Path;

public class RenderBill {
  static final String API = "http://localhost:8000/api/bills/render";

  public static void main(String[] args) throws Exception {
    // Build this with Jackson/Gson in real code
    String bill = """
        {"templateId":"winmart-2026","store":{"name":"My Test Mart"},
         "items":[{"title":"Bánh mì","unitPrice":15000,"quantity":2}],
         "display":{"seed":"run42"},"scale":2}""";

    // POST
    HttpRequest req = HttpRequest.newBuilder(URI.create(API))
        .header("Content-Type", "application/json")
        .POST(HttpRequest.BodyPublishers.ofString(bill, StandardCharsets.UTF_8))
        .build();
    HttpResponse<Path> res = HttpClient.newHttpClient()
        .send(req, HttpResponse.BodyHandlers.ofFile(Path.of("bill.png")));
    if (res.statusCode() != 200) throw new RuntimeException("Render failed: " + res.statusCode());

    // GET (URLEncoder writes spaces as '+', which the API also accepts)
    String url = API + "?data=" + URLEncoder.encode(bill, StandardCharsets.UTF_8);
  }
}
```

</details>

<details>
<summary><b>C#</b> (.NET 6+)</summary>

```csharp
using System.Net.Http.Json;

const string Api = "http://localhost:8000/api/bills/render";

var bill = new
{
    templateId = "winmart-2026",
    store = new { name = "My Test Mart" },
    items = new[] { new { title = "Bánh mì", unitPrice = 15000, quantity = 2 } },
    display = new { seed = "run42" },
    scale = 2,
};

using var http = new HttpClient();

// POST
var res = await http.PostAsJsonAsync(Api, bill);
if (!res.IsSuccessStatusCode) throw new Exception(await res.Content.ReadAsStringAsync());
await File.WriteAllBytesAsync("bill.png", await res.Content.ReadAsByteArrayAsync());

// GET
var url = $"{Api}?data={Uri.EscapeDataString(System.Text.Json.JsonSerializer.Serialize(bill))}";
```

</details>

<details>
<summary><b>PHP</b></summary>

```php
<?php
$api = 'http://localhost:8000/api/bills/render';

$bill = [
    'templateId' => 'winmart-2026',
    'store' => ['name' => 'My Test Mart'],
    'items' => [['title' => 'Bánh mì', 'unitPrice' => 15000, 'quantity' => 2]],
    'display' => ['seed' => 'run42'],
    'scale' => 2,
];
$json = json_encode($bill, JSON_UNESCAPED_UNICODE);

// POST
$ch = curl_init($api);
curl_setopt_array($ch, [
    CURLOPT_POST => true,
    CURLOPT_POSTFIELDS => $json,
    CURLOPT_HTTPHEADER => ['Content-Type: application/json'],
    CURLOPT_RETURNTRANSFER => true,
]);
$png = curl_exec($ch);
if (curl_getinfo($ch, CURLINFO_HTTP_CODE) !== 200) {
    throw new RuntimeException($png);
}
file_put_contents('bill.png', $png);

// GET (http_build_query would write brackets, so encode the JSON yourself)
$url = $api . '?data=' . rawurlencode($json);
```

</details>

### Combining and legacy params

GET params are applied in layers. When the same field is set twice, the later layer wins:

1. `payload` (legacy)
2. `data`
3. legacy shortcuts
4. dotted params

So you can send a base bill in `data` and override single fields with dotted params: `?data=…&store.name=Other%20Mart`.

Legacy params are kept so old links keep working. Don't use them for new code.

| Param | Same as |
| --- | --- |
| `payload` | `data`, but base64url-encoded JSON |
| `template` | `templateId` |
| `vat` | `tax.vatRate` |
| `seed` | `display.seed` |
| `language` | `display.language` (`vi` \| `en`) |
| `name` | `store.name` |
| `logo` | `store.logoUrl` |
| `cashier` | `transaction.cashier` |
| `invoice` | `transaction.invoiceNo` |
| `billId` | `transaction.billId` |
| `qr` | `display.qrText` |
| `barcode` | `display.barcodeText` |
| `items` | `items` (JSON array) |

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
