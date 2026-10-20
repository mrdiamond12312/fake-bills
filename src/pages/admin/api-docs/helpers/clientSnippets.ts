import type { TCodeLanguage } from '@/pages/admin/api-docs/helpers/highlight';

export type TClientSnippet = {
  key: TCodeLanguage;
  label: string;
  code: string;
};

type TSnippetInput = {
  /** Full render endpoint, e.g. https://host/api/bills/render */
  api: string;
  /** The request body: the bill plus scale/format */
  body: Record<string, any>;
  format: 'png' | 'svg';
};

const pretty = (value: unknown) => JSON.stringify(value, null, 2);

/** Indents every line but the first, for values embedded after `x = ` */
const indentTail = (text: string, prefix: string) => text.replace(/\n/g, `\n${prefix}`);

/** JSON → Python literal (True/False/None); JSON string escapes are valid in Python too */
const toPython = (value: unknown, indent = ''): string => {
  const inner = `${indent}    `;
  if (value === null || value === undefined) return 'None';
  if (typeof value === 'boolean') return value ? 'True' : 'False';
  if (typeof value === 'number' || typeof value === 'string') return JSON.stringify(value);
  if (Array.isArray(value)) {
    if (!value.length) return '[]';
    return `[\n${value.map((item) => `${inner}${toPython(item, inner)},`).join('\n')}\n${indent}]`;
  }
  const entries = Object.entries(value as Record<string, unknown>);
  if (!entries.length) return '{}';
  return `{\n${entries
    .map(([key, item]) => `${inner}${JSON.stringify(key)}: ${toPython(item, inner)},`)
    .join('\n')}\n${indent}}`;
};

const typescript = ({
  api,
  body,
  format,
}: TSnippetInput) => `// Node 18+ or browser. BillRenderRequest: see "Request body type"
const API = '${api}';

const bill: BillRenderRequest = ${pretty(body)};

// POST
const res = await fetch(API, {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify(bill),
});
if (!res.ok) throw new Error((await res.json()).message);
const image = new Uint8Array(await res.arrayBuffer());
// Node: await (await import('node:fs/promises')).writeFile('bill.${format}', image);
// Browser: URL.createObjectURL(new Blob([image], { type: res.headers.get('Content-Type')! }))

// GET
const url = \`\${API}?data=\${encodeURIComponent(JSON.stringify(bill))}\`;`;

const python = ({ api, body, format }: TSnippetInput) => `# Python 3.8+, standard library only
import json
import urllib.request
from urllib.parse import quote

API = '${api}'

bill = ${toPython(body)}

# POST (raises HTTPError on 400; its body is {"message": ...})
req = urllib.request.Request(
    API,
    data=json.dumps(bill).encode(),
    headers={'Content-Type': 'application/json'},
    method='POST',
)
with urllib.request.urlopen(req) as res, open('bill.${format}', 'wb') as f:
    f.write(res.read())

# GET
url = f'{API}?data={quote(json.dumps(bill, ensure_ascii=False))}'

# With requests: requests.post(API, json=bill).content
#                requests.get(API, params={'data': json.dumps(bill)})`;

// a raw string can't hold a backtick, so splice those in as normal strings
const goRaw = (text: string) => `\`${text.replace(/`/g, '` + "`" + `')}\``;

const go = ({ api, body, format }: TSnippetInput) => `package main

import (
\t"bytes"
\t"fmt"
\t"io"
\t"net/http"
\t"net/url"
\t"os"
)

const api = "${api}"

// Build this with encoding/json and your own structs in real code
var bill = []byte(${goRaw(pretty(body))})

func main() {
\t// POST
\tres, err := http.Post(api, "application/json", bytes.NewReader(bill))
\tif err != nil {
\t\tpanic(err)
\t}
\tdefer res.Body.Close()
\timage, _ := io.ReadAll(res.Body)
\tif res.StatusCode != http.StatusOK {
\t\tpanic(string(image)) // {"message": ...}
\t}
\tos.WriteFile("bill.${format}", image, 0o644)

\t// GET
\tfmt.Println(api + "?data=" + url.QueryEscape(string(bill)))
}`;

// text blocks still process escapes, so JSON's backslashes have to be doubled
const javaTextBlock = (text: string, indent: string) =>
  `"""\n${indent}${indentTail(text.replace(/\\/g, '\\\\'), indent)}"""`;

const java = ({ api, body, format }: TSnippetInput) => `// Java 15+
import java.net.URI;
import java.net.URLEncoder;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.nio.charset.StandardCharsets;
import java.nio.file.Path;

public class RenderBill {
  static final String API = "${api}";

  public static void main(String[] args) throws Exception {
    // Build this with Jackson/Gson in real code
    String bill = ${javaTextBlock(pretty(body), '        ')};

    // POST
    HttpRequest req = HttpRequest.newBuilder(URI.create(API))
        .header("Content-Type", "application/json")
        .POST(HttpRequest.BodyPublishers.ofString(bill, StandardCharsets.UTF_8))
        .build();
    HttpResponse<Path> res = HttpClient.newHttpClient()
        .send(req, HttpResponse.BodyHandlers.ofFile(Path.of("bill.${format}")));
    if (res.statusCode() != 200) throw new RuntimeException("Render failed: " + res.statusCode());

    // GET (URLEncoder writes spaces as '+', which the API accepts)
    String url = API + "?data=" + URLEncoder.encode(bill, StandardCharsets.UTF_8);
    System.out.println(url);
  }
}`;

const csharp = ({ api, body, format }: TSnippetInput) => `// .NET 6+ (top-level statements)
using System.Text;

const string Api = "${api}";

// Build this with System.Text.Json and your own records in real code
var bill = @"${pretty(body).replace(/"/g, '""')}";

using var http = new HttpClient();

// POST
var res = await http.PostAsync(Api, new StringContent(bill, Encoding.UTF8, "application/json"));
if (!res.IsSuccessStatusCode) throw new Exception(await res.Content.ReadAsStringAsync());
await File.WriteAllBytesAsync("bill.${format}", await res.Content.ReadAsByteArrayAsync());

// GET
var url = $"{Api}?data={Uri.EscapeDataString(bill)}";
Console.WriteLine(url);`;

const php = ({ api, body, format }: TSnippetInput) => `<?php
$api = '${api}';

$bill = json_decode(<<<'JSON'
${pretty(body)}
JSON, true);
$json = json_encode($bill, JSON_UNESCAPED_UNICODE);

// POST
$ch = curl_init($api);
curl_setopt_array($ch, [
    CURLOPT_POST => true,
    CURLOPT_POSTFIELDS => $json,
    CURLOPT_HTTPHEADER => ['Content-Type: application/json'],
    CURLOPT_RETURNTRANSFER => true,
]);
$image = curl_exec($ch);
if (curl_getinfo($ch, CURLINFO_HTTP_CODE) !== 200) {
    throw new RuntimeException($image);
}
file_put_contents('bill.${format}', $image);

// GET (http_build_query would write brackets, so encode the JSON yourself)
$url = $api . '?data=' . rawurlencode($json);`;

/** The same request (POST + GET ?data=) in several languages, built from the playground body. */
export const buildClientSnippets = (input: TSnippetInput): TClientSnippet[] => [
  { key: 'typescript', label: 'TypeScript', code: typescript(input) },
  { key: 'python', label: 'Python', code: python(input) },
  { key: 'go', label: 'Go', code: go(input) },
  { key: 'java', label: 'Java', code: java(input) },
  { key: 'csharp', label: 'C#', code: csharp(input) },
  { key: 'php', label: 'PHP', code: php(input) },
];

const DOTTED_TYPESCRIPT = `// Flattens any bill object into dotted params: store.name=…&items.0.title=…
const toDotted = (value: unknown, prefix = '', out = new URLSearchParams()) => {
  if (value === undefined || value === null) return out;
  if (typeof value === 'object') {
    // arrays too: their indexes become the 0, 1, … segments
    Object.entries(value).forEach(([key, child]) =>
      toDotted(child, prefix ? \`\${prefix}.\${key}\` : key, out),
    );
  } else {
    out.append(prefix, String(value));
  }
  return out;
};

// bill: the object from "Client examples"
const url = \`\${API}?\${toDotted(bill)}\`;`;

const DOTTED_PYTHON = `from urllib.parse import urlencode

def to_dotted(value, prefix=''):
    """Flattens a bill dict into dotted params: store.name=…&items.0.title=…"""
    if isinstance(value, dict):
        return [p for k, v in value.items() for p in to_dotted(v, f'{prefix}.{k}' if prefix else k)]
    if isinstance(value, list):
        return [p for i, v in enumerate(value) for p in to_dotted(v, f'{prefix}.{i}')]
    if value is None:
        return []
    # the API reads lowercase true/false
    return [(prefix, str(value).lower() if isinstance(value, bool) else str(value))]

# bill: the dict from "Client examples"
url = f'{API}?{urlencode(to_dotted(bill))}'`;

const DOTTED_GO = `import (
\t"bytes"
\t"encoding/json"
\t"net/url"
\t"strconv"
)

// toDotted flattens decoded JSON into dotted params: store.name=…&items.0.title=…
func toDotted(value any, prefix string, out url.Values) {
\tjoin := func(key string) string {
\t\tif prefix == "" {
\t\t\treturn key
\t\t}
\t\treturn prefix + "." + key
\t}
\tswitch v := value.(type) {
\tcase map[string]any:
\t\tfor key, child := range v {
\t\t\ttoDotted(child, join(key), out)
\t\t}
\tcase []any:
\t\tfor i, child := range v {
\t\t\ttoDotted(child, join(strconv.Itoa(i)), out)
\t\t}
\tcase json.Number:
\t\tout.Add(prefix, v.String())
\tcase bool:
\t\tout.Add(prefix, strconv.FormatBool(v))
\tcase string:
\t\tout.Add(prefix, v)
\t}
}

func dottedURL(bill []byte) (string, error) {
\tdec := json.NewDecoder(bytes.NewReader(bill))
\tdec.UseNumber() // keeps 1500000 from turning into 1.5e+06
\tvar value any
\tif err := dec.Decode(&value); err != nil {
\t\treturn "", err
\t}
\tparams := url.Values{}
\ttoDotted(value, "", params)
\treturn api + "?" + params.Encode(), nil
}`;

const DOTTED_JAVA = `// Java 16+. bill: the parsed JSON as Map/List, e.g. new ObjectMapper().readValue(json, Map.class)
import java.net.URLEncoder;
import java.nio.charset.StandardCharsets;
import java.util.List;
import java.util.Map;
import java.util.StringJoiner;

static String toDotted(Object bill) {
  StringJoiner out = new StringJoiner("&");
  toDotted(bill, "", out);
  return out.toString();
}

/** Flattens maps and lists into dotted params: store.name=…&items.0.title=… */
static void toDotted(Object value, String prefix, StringJoiner out) {
  if (value instanceof Map<?, ?> map) {
    map.forEach((key, child) -> toDotted(child, join(prefix, key.toString()), out));
  } else if (value instanceof List<?> list) {
    for (int i = 0; i < list.size(); i++) toDotted(list.get(i), join(prefix, String.valueOf(i)), out);
  } else if (value != null) {
    out.add(encode(prefix) + "=" + encode(String.valueOf(value)));
  }
}

static String join(String prefix, String key) {
  return prefix.isEmpty() ? key : prefix + "." + key;
}

static String encode(String text) {
  return URLEncoder.encode(text, StandardCharsets.UTF_8);
}

String url = API + "?" + toDotted(bill);`;

const DOTTED_CSHARP = `using System.Text.Json.Nodes;

// Flattens JSON into dotted params: store.name=…&items.0.title=…
static void ToDotted(JsonNode? node, string prefix, List<string> output)
{
    string Join(string key) => prefix == "" ? key : $"{prefix}.{key}";
    switch (node)
    {
        case JsonObject obj:
            foreach (var (key, child) in obj) ToDotted(child, Join(key), output);
            break;
        case JsonArray array:
            for (var i = 0; i < array.Count; i++) ToDotted(array[i], Join(i.ToString()), output);
            break;
        case JsonValue value:
            // strings unquoted; numbers and true/false as written in the JSON
            var text = value.TryGetValue<string>(out var str) ? str : value.ToJsonString();
            output.Add($"{Uri.EscapeDataString(prefix)}={Uri.EscapeDataString(text)}");
            break;
    }
}

// bill: the JSON string from "Client examples"
var parts = new List<string>();
ToDotted(JsonNode.Parse(bill), "", parts);
var url = $"{Api}?{string.Join("&", parts)}";`;

const DOTTED_PHP = `<?php
/** Flattens a decoded bill into dotted params: store.name=…&items.0.title=… */
function toDotted($value, string $prefix = '', array &$out = []): array
{
    if (is_array($value)) {
        foreach ($value as $key => $child) {
            toDotted($child, $prefix === '' ? (string) $key : "$prefix.$key", $out);
        }
    } elseif ($value !== null) {
        // the API reads lowercase true/false
        $text = is_bool($value) ? ($value ? 'true' : 'false') : (string) $value;
        $out[] = rawurlencode($prefix) . '=' . rawurlencode($text);
    }
    return $out;
}

// $bill: the array from "Client examples" (http_build_query would write brackets)
$url = $api . '?' . implode('&', toDotted($bill));`;

/** How to build dotted params from an object, per language. Static: it doesn't use the body. */
export const DOTTED_SNIPPETS: TClientSnippet[] = [
  { key: 'typescript', label: 'TypeScript', code: DOTTED_TYPESCRIPT },
  { key: 'python', label: 'Python', code: DOTTED_PYTHON },
  { key: 'go', label: 'Go', code: DOTTED_GO },
  { key: 'java', label: 'Java', code: DOTTED_JAVA },
  { key: 'csharp', label: 'C#', code: DOTTED_CSHARP },
  { key: 'php', label: 'PHP', code: DOTTED_PHP },
];
