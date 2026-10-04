"use strict";
var __create = Object.create;
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __getProtoOf = Object.getPrototypeOf;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __commonJS = (cb, mod) => function __require() {
  try {
    return mod || (0, cb[__getOwnPropNames(cb)[0]])((mod = { exports: {} }).exports, mod), mod.exports;
  } catch (e) {
    throw mod = 0, e;
  }
};
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toESM = (mod, isNodeMode, target) => (target = mod != null ? __create(__getProtoOf(mod)) : {}, __copyProps(
  // If the importer is in node compatibility mode or this is not an ESM
  // file that has been converted to a CommonJS file using a Babel-
  // compatible transform (i.e. "__esModule" has not been set), then set
  // "default" to the CommonJS "module.exports" for node compatibility.
  isNodeMode || !mod || !mod.__esModule ? __defProp(target, "default", { value: mod, enumerable: true }) : target,
  mod
));
var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);

// node_modules/@umijs/preset-umi/dist/features/apiRoute/utils.js
var require_utils = __commonJS({
  "node_modules/@umijs/preset-umi/dist/features/apiRoute/utils.js"(exports2, module2) {
    var __defProp2 = Object.defineProperty;
    var __getOwnPropDesc2 = Object.getOwnPropertyDescriptor;
    var __getOwnPropNames2 = Object.getOwnPropertyNames;
    var __hasOwnProp2 = Object.prototype.hasOwnProperty;
    var __export2 = (target, all) => {
      for (var name in all)
        __defProp2(target, name, { get: all[name], enumerable: true });
    };
    var __copyProps2 = (to, from, except, desc) => {
      if (from && typeof from === "object" || typeof from === "function") {
        for (let key of __getOwnPropNames2(from))
          if (!__hasOwnProp2.call(to, key) && key !== except)
            __defProp2(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc2(from, key)) || desc.enumerable });
      }
      return to;
    };
    var __toCommonJS2 = (mod) => __copyProps2(__defProp2({}, "__esModule", { value: true }), mod);
    var utils_exports = {};
    __export2(utils_exports, {
      esbuildIgnorePathPrefixPlugin: () => esbuildIgnorePathPrefixPlugin,
      matchApiRoute: () => matchApiRoute2
    });
    module2.exports = __toCommonJS2(utils_exports);
    function esbuildIgnorePathPrefixPlugin() {
      return {
        name: "ignore-path-prefix",
        setup(build) {
          build.onResolve({ filter: /^@fs/ }, (args) => ({
            path: args.path.replace(/^@fs/, "")
          }));
        }
      };
    }
    function matchApiRoute2(apiRoutes2, path) {
      if (path.startsWith("/"))
        path = path.substring(1);
      if (path.startsWith("api/"))
        path = path.substring(4);
      const pathSegments = path.split("/").filter((p) => p !== "");
      if (pathSegments.length === 0 || pathSegments.length === 1 && pathSegments[0] === "api") {
        const route2 = apiRoutes2.find((r) => r.path === "/");
        if (route2)
          return { route: route2, params: {} };
        else
          return void 0;
      }
      const params = {};
      const route = apiRoutes2.find((route2) => {
        const routePathSegments = route2.path.split("/").filter((p) => p !== "");
        if (routePathSegments.length !== pathSegments.length)
          return false;
        for (let i = 0; i < routePathSegments.length; i++) {
          const routePathSegment = routePathSegments[i];
          if (routePathSegment.match(/^\[.*]$/)) {
            params[routePathSegment.substring(1, routePathSegment.length - 1)] = pathSegments[i];
            if (i == routePathSegments.length - 1)
              return true;
            continue;
          }
          if (routePathSegment !== pathSegments[i])
            return false;
          if (i == routePathSegments.length - 1)
            return true;
        }
      });
      if (route)
        return { route, params };
    }
  }
});

// node_modules/@umijs/preset-umi/dist/features/apiRoute/request.js
var require_request = __commonJS({
  "node_modules/@umijs/preset-umi/dist/features/apiRoute/request.js"(exports2, module2) {
    var __defProp2 = Object.defineProperty;
    var __getOwnPropDesc2 = Object.getOwnPropertyDescriptor;
    var __getOwnPropNames2 = Object.getOwnPropertyNames;
    var __hasOwnProp2 = Object.prototype.hasOwnProperty;
    var __export2 = (target, all) => {
      for (var name in all)
        __defProp2(target, name, { get: all[name], enumerable: true });
    };
    var __copyProps2 = (to, from, except, desc) => {
      if (from && typeof from === "object" || typeof from === "function") {
        for (let key of __getOwnPropNames2(from))
          if (!__hasOwnProp2.call(to, key) && key !== except)
            __defProp2(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc2(from, key)) || desc.enumerable });
      }
      return to;
    };
    var __toCommonJS2 = (mod) => __copyProps2(__defProp2({}, "__esModule", { value: true }), mod);
    var request_exports = {};
    __export2(request_exports, {
      default: () => request_default,
      parseMultipart: () => parseMultipart,
      parseUrlEncoded: () => parseUrlEncoded
    });
    module2.exports = __toCommonJS2(request_exports);
    var import_utils = require_utils();
    var UmiApiRequest3 = class {
      constructor(req, apiRoutes2) {
        this._params = {};
        this._body = null;
        this._req = req;
        const m = (0, import_utils.matchApiRoute)(apiRoutes2, this.pathName || "");
        if (m)
          this._params = m.params;
      }
      get params() {
        return this._params;
      }
      get body() {
        return this._body;
      }
      get headers() {
        return this._req.headers;
      }
      get method() {
        return this._req.method;
      }
      get query() {
        var _a, _b;
        return ((_b = (_a = this._req.url) == null ? void 0 : _a.split("?")[1]) == null ? void 0 : _b.split("&").reduce((acc, cur) => {
          const [key, value] = cur.split("=");
          const k = acc[key];
          if (k) {
            if (k instanceof Array) {
              k.push(value);
            } else {
              acc[key] = [k, value];
            }
          } else {
            acc[key] = value;
          }
          return acc;
        }, {})) || {};
      }
      get cookies() {
        var _a;
        return (_a = this._req.headers.cookie) == null ? void 0 : _a.split(";").reduce((acc, cur) => {
          const [key, value] = cur.split("=");
          acc[key.trim()] = value;
          return acc;
        }, {});
      }
      get url() {
        return this._req.url;
      }
      get pathName() {
        var _a;
        return (_a = this._req.url) == null ? void 0 : _a.split("?")[0];
      }
      readBody() {
        if (this._req.headers["content-length"] === "0") {
          return Promise.resolve();
        }
        return new Promise((resolve, reject) => {
          let body = [];
          this._req.on("data", (chunk) => {
            body.push(chunk);
          });
          this._req.on("end", () => {
            var _a, _b;
            const bodyBuffer = Buffer.concat(body);
            switch ((_a = this._req.headers["content-type"]) == null ? void 0 : _a.split(";")[0]) {
              case "application/json":
                try {
                  this._body = JSON.parse(bodyBuffer.toString());
                } catch (e) {
                  this._body = body;
                }
                break;
              case "multipart/form-data":
                const boundary = (_b = this.headers["content-type"]) == null ? void 0 : _b.split("boundary=")[1];
                if (!boundary) {
                  this._body = body;
                  break;
                }
                this._body = parseMultipart(bodyBuffer, boundary);
                break;
              case "application/x-www-form-urlencoded":
                this._body = parseUrlEncoded(bodyBuffer.toString());
                break;
              default:
                this._body = body;
                break;
            }
            resolve();
          });
          this._req.on("error", reject);
        });
      }
    };
    function parseMultipart(body, boundary) {
      const hexBoundary = Buffer.from(`--${boundary}`, "utf-8").toString("hex");
      return body.toString("hex").split(hexBoundary).reduce((acc, cur) => {
        var _a, _b;
        const [hexMeta, hexValue] = cur.split(
          Buffer.from("\r\n\r\n").toString("hex")
        );
        const meta = Buffer.from(hexMeta, "hex").toString("utf-8");
        const name = (_a = meta.split('name="')[1]) == null ? void 0 : _a.split('"')[0];
        if (!name)
          return acc;
        const fileName = (_b = meta.split('filename="')[1]) == null ? void 0 : _b.split('"')[0];
        if (fileName) {
          const fileBufferBeforeTrim = Buffer.from(hexValue, "hex");
          const fileBuffer = fileBufferBeforeTrim.slice(
            0,
            fileBufferBeforeTrim.byteLength - 2
          );
          const contentType = meta.split("Content-Type: ")[1];
          acc[name] = {
            fileName,
            data: fileBuffer,
            contentType
          };
          return acc;
        }
        const valueBufferBeforeTrim = Buffer.from(hexValue, "hex");
        const valueBuffer = valueBufferBeforeTrim.slice(
          0,
          valueBufferBeforeTrim.byteLength - 2
        );
        acc[name] = valueBuffer.toString("utf-8");
        return acc;
      }, {});
    }
    function parseUrlEncoded(body) {
      return body.split("&").reduce((acc, cur) => {
        const [key, value] = cur.split("=");
        acc[key] = decodeURIComponent(value);
        return acc;
      }, {});
    }
    var request_default = UmiApiRequest3;
  }
});

// node_modules/@umijs/preset-umi/dist/features/apiRoute/response.js
var require_response = __commonJS({
  "node_modules/@umijs/preset-umi/dist/features/apiRoute/response.js"(exports2, module2) {
    var __defProp2 = Object.defineProperty;
    var __getOwnPropDesc2 = Object.getOwnPropertyDescriptor;
    var __getOwnPropNames2 = Object.getOwnPropertyNames;
    var __hasOwnProp2 = Object.prototype.hasOwnProperty;
    var __export2 = (target, all) => {
      for (var name in all)
        __defProp2(target, name, { get: all[name], enumerable: true });
    };
    var __copyProps2 = (to, from, except, desc) => {
      if (from && typeof from === "object" || typeof from === "function") {
        for (let key of __getOwnPropNames2(from))
          if (!__hasOwnProp2.call(to, key) && key !== except)
            __defProp2(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc2(from, key)) || desc.enumerable });
      }
      return to;
    };
    var __toCommonJS2 = (mod) => __copyProps2(__defProp2({}, "__esModule", { value: true }), mod);
    var response_exports = {};
    __export2(response_exports, {
      default: () => response_default
    });
    module2.exports = __toCommonJS2(response_exports);
    var UmiApiResponse3 = class {
      constructor(res) {
        this._res = res;
      }
      status(statusCode) {
        this._res.statusCode = statusCode;
        return this;
      }
      header(key, value) {
        this._res.setHeader(key, value);
        return this;
      }
      setCookie(key, value) {
        this._res.setHeader("Set-Cookie", `${key}=${value}; path=/`);
        return this;
      }
      end(data) {
        this._res.end(data);
        return this;
      }
      text(data) {
        this._res.setHeader("Content-Type", "text/plain; charset=utf-8");
        this._res.end(data);
        return this;
      }
      html(data) {
        this._res.setHeader("Content-Type", "text/html; charset=utf-8");
        this._res.end(data);
        return this;
      }
      json(data) {
        this._res.setHeader("Content-Type", "application/json");
        this._res.end(JSON.stringify(data));
        return this;
      }
    };
    var response_default = UmiApiResponse3;
  }
});

// node_modules/@umijs/preset-umi/dist/features/apiRoute/index.js
var require_apiRoute = __commonJS({
  "node_modules/@umijs/preset-umi/dist/features/apiRoute/index.js"(exports2, module2) {
    var __create2 = Object.create;
    var __defProp2 = Object.defineProperty;
    var __getOwnPropDesc2 = Object.getOwnPropertyDescriptor;
    var __getOwnPropNames2 = Object.getOwnPropertyNames;
    var __getProtoOf2 = Object.getPrototypeOf;
    var __hasOwnProp2 = Object.prototype.hasOwnProperty;
    var __export2 = (target, all) => {
      for (var name in all)
        __defProp2(target, name, { get: all[name], enumerable: true });
    };
    var __copyProps2 = (to, from, except, desc) => {
      if (from && typeof from === "object" || typeof from === "function") {
        for (let key of __getOwnPropNames2(from))
          if (!__hasOwnProp2.call(to, key) && key !== except)
            __defProp2(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc2(from, key)) || desc.enumerable });
      }
      return to;
    };
    var __toESM2 = (mod, isNodeMode, target) => (target = mod != null ? __create2(__getProtoOf2(mod)) : {}, __copyProps2(
      // If the importer is in node compatibility mode or this is not an ESM
      // file that has been converted to a CommonJS file using a Babel-
      // compatible transform (i.e. "__esModule" has not been set), then set
      // "default" to the CommonJS "module.exports" for node compatibility.
      isNodeMode || !mod || !mod.__esModule ? __defProp2(target, "default", { value: mod, enumerable: true }) : target,
      mod
    ));
    var __toCommonJS2 = (mod) => __copyProps2(__defProp2({}, "__esModule", { value: true }), mod);
    var apiRoute_exports = {};
    __export2(apiRoute_exports, {
      UmiApiRequest: () => import_request.default,
      UmiApiResponse: () => import_response.default,
      matchApiRoute: () => import_utils.matchApiRoute
    });
    module2.exports = __toCommonJS2(apiRoute_exports);
    var import_request = __toESM2(require_request());
    var import_response = __toESM2(require_response());
    var import_utils = require_utils();
  }
});

// src/.umi/api/image-proxy.ts
var image_proxy_exports = {};
__export(image_proxy_exports, {
  default: () => image_proxy_default2
});
module.exports = __toCommonJS(image_proxy_exports);

// src/.umi/api/_middlewares.ts
var middlewares_default = async (req, res, next) => {
  next();
};

// src/api/image-proxy.ts
var MAX_BYTES = 10 * 1024 * 1024;
var PRIVATE_HOST = /^(localhost|0\.0\.0\.0|127\.|10\.|192\.168\.|169\.254\.|172\.(1[6-9]|2\d|3[01])\.|\[?::1\]?$|\[?f[cd])/i;
async function image_proxy_default(req, res) {
  let target;
  try {
    const search = String(req.url ?? "").split("?")[1] ?? "";
    target = new URL(new URLSearchParams(search).get("url") ?? "");
  } catch {
    res.status(400).json({ message: "Invalid url" });
    return;
  }
  if (!/^https?:$/.test(target.protocol) || PRIVATE_HOST.test(target.hostname)) {
    res.status(400).json({ message: "Only public http(s) URLs are allowed" });
    return;
  }
  try {
    const upstream = await fetch(target, { redirect: "follow" });
    const contentType = upstream.headers.get("content-type") ?? "";
    if (!upstream.ok || !contentType.startsWith("image/")) {
      res.status(502).json({ message: `Upstream returned ${upstream.status} ${contentType}` });
      return;
    }
    const body = Buffer.from(await upstream.arrayBuffer());
    if (body.length > MAX_BYTES) {
      res.status(413).json({ message: `Image is larger than ${MAX_BYTES / 1024 / 1024} MB` });
      return;
    }
    res.status(200).header("Content-Type", contentType).header("Cache-Control", "public, max-age=86400").header("Access-Control-Allow-Origin", "*").end(body);
  } catch (error) {
    res.status(502).json({ message: error?.message ?? "Fetch failed" });
  }
}

// src/.umi/api/image-proxy.ts
var import_apiRoute = __toESM(require_apiRoute());
var apiRoutes = [{ "path": "catalog/products", "id": "catalog/products", "file": "catalog/products.ts", "absPath": "/catalog/products", "__content": "import type { UmiApiRequest, UmiApiResponse } from '@umijs/max';\r\n\r\nimport { stripDiacritics } from '@/components/Bills/helpers/calc';\r\nimport { BUILT_IN_CATALOG } from '@/const/catalog';\r\n\r\nconst fold = (text: string) => stripDiacritics(text).toLowerCase();\r\n\r\n/** GET /api/catalog/products?keyword= \u2014 built-in sample products */\r\nexport default async function (req: UmiApiRequest, res: UmiApiResponse) {\r\n  const keyword = fold(String(req.query.keyword ?? ''));\r\n  const products: API.TCatalogProduct[] = BUILT_IN_CATALOG.map((product, index) => ({\r\n    ...product,\r\n    id: `built-in:${index}`,\r\n    source: 'built-in',\r\n  })).filter(\r\n    (product) =>\r\n      !keyword || fold(product.title).includes(keyword) || product.barcode.includes(keyword),\r\n  );\r\n  res.status(200).json(products);\r\n}\r\n" }, { "path": "bills/render", "id": "bills/render", "file": "bills/render.ts", "absPath": "/bills/render", "__content": "import type { UmiApiRequest, UmiApiResponse } from '@umijs/max';\n\nimport type { TDeepPartialBill } from '@/components/Bills/helpers/normalize';\nimport { BILL_TEMPLATES } from '@/components/Bills/registry';\nimport { renderBill } from '@/utils/render-bill';\n\nconst MAX_ITEMS = 200;\n\nconst decodePayload = (payload: string) =>\n  JSON.parse(\n    Buffer.from(payload.replace(/-/g, '+').replace(/_/g, '/'), 'base64').toString('utf-8'),\n  );\n\nconst first = (value: string | string[] | undefined) => (Array.isArray(value) ? value[0] : value);\n\n/**\n * Query-string shortcuts on top of the full JSON bill:\n *   template, vat, seed, language (vi|en), name, logo (image URL), cashier, invoice, qr, barcode,\n *   scale, format,\n *   items (JSON array)\n */\nconst fromQuery = (\n  query: UmiApiRequest['query'],\n): TDeepPartialBill & { scale?: string; format?: string } => {\n  const payload = first(query.payload);\n  const base: TDeepPartialBill = payload ? decodePayload(payload) : {};\n  const items = first(query.items);\n  return {\n    ...base,\n    templateId: first(query.template) ?? base.templateId,\n    store: {\n      ...base.store,\n      ...(first(query.name) ? { name: first(query.name) } : {}),\n      ...(first(query.logo) ? { logoUrl: first(query.logo) } : {}),\n    },\n    transaction: {\n      ...base.transaction,\n      ...(first(query.cashier) ? { cashier: first(query.cashier) } : {}),\n      ...(first(query.invoice) ? { invoiceNo: first(query.invoice) } : {}),\n      ...(first(query.billId) ? { billId: first(query.billId) } : {}),\n    },\n    tax: { ...base.tax, ...(first(query.vat) ? { vatRate: Number(first(query.vat)) } : {}) },\n    display: {\n      ...base.display,\n      ...(first(query.seed) ? { seed: first(query.seed) } : {}),\n      ...(first(query.qr) ? { qrText: first(query.qr) } : {}),\n      ...(first(query.barcode) ? { barcodeText: first(query.barcode) } : {}),\n      ...(first(query.language) === 'en' || first(query.language) === 'vi'\n        ? { language: first(query.language) as 'vi' | 'en' }\n        : {}),\n    },\n    items: items ? JSON.parse(items) : base.items,\n    scale: first(query.scale),\n    format: first(query.format),\n  };\n};\n\n/**\n * GET|POST /api/bills/render \u2192 image/png (or image/svg+xml with format=svg)\n * GET /api/bills/render?list=templates \u2192 available template ids\n */\nexport default async function (req: UmiApiRequest, res: UmiApiResponse) {\n  try {\n    if (first(req.query.list) === 'templates') {\n      res.status(200).json(\n        BILL_TEMPLATES.map(({ id, name, description, printerStyle, fields }) => ({\n          id,\n          name,\n          description,\n          printerStyle,\n          fields,\n        })),\n      );\n      return;\n    }\n\n    let input: TDeepPartialBill & { scale?: string | number; format?: string };\n    if (req.method === 'POST') {\n      // umi has already read the body before calling the handler\n      input = typeof req.body === 'string' ? JSON.parse(req.body) : req.body ?? {};\n    } else {\n      input = fromQuery(req.query);\n    }\n\n    if ((input.items?.length ?? 0) > MAX_ITEMS) {\n      res.status(400).json({ message: `At most ${MAX_ITEMS} items per bill.` });\n      return;\n    }\n\n    const { scale, format, ...bill } = input;\n    const result = await renderBill(bill, {\n      scale: Number(scale) || undefined,\n      format: format === 'svg' ? 'svg' : 'png',\n    });\n\n    res\n      .status(200)\n      .header('Content-Type', result.contentType)\n      .header('Cache-Control', 'no-store')\n      .header('X-Bill-Template', result.data.templateId)\n      .header('X-Bill-Seed', String(result.data.display.seed))\n      .end(result.body);\n  } catch (error: any) {\n    res.status(400).json({ message: error?.message ?? 'Render failed' });\n  }\n}\n" }, { "path": "image-proxy", "id": "image-proxy", "file": "image-proxy.ts", "absPath": "/image-proxy", "__content": "import type { UmiApiRequest, UmiApiResponse } from '@umijs/max';\n\nconst MAX_BYTES = 10 * 1024 * 1024;\nconst PRIVATE_HOST =\n  /^(localhost|0\\.0\\.0\\.0|127\\.|10\\.|192\\.168\\.|169\\.254\\.|172\\.(1[6-9]|2\\d|3[01])\\.|\\[?::1\\]?$|\\[?f[cd])/i;\n\n/**\n * GET /api/image-proxy?url= \u2014 re-serves a remote image from our own origin.\n * html-to-image (projector texture, PNG export) has to read the logo's pixels,\n * which the browser blocks for hosts that don't send Access-Control-Allow-Origin.\n */\nexport default async function (req: UmiApiRequest, res: UmiApiResponse) {\n  let target: URL;\n  try {\n    // req.query leaves values percent-encoded, so read the decoded param from the raw URL\n    const search = String(req.url ?? '').split('?')[1] ?? '';\n    target = new URL(new URLSearchParams(search).get('url') ?? '');\n  } catch {\n    res.status(400).json({ message: 'Invalid url' });\n    return;\n  }\n  if (!/^https?:$/.test(target.protocol) || PRIVATE_HOST.test(target.hostname)) {\n    res.status(400).json({ message: 'Only public http(s) URLs are allowed' });\n    return;\n  }\n\n  try {\n    const upstream = await fetch(target, { redirect: 'follow' });\n    const contentType = upstream.headers.get('content-type') ?? '';\n    if (!upstream.ok || !contentType.startsWith('image/')) {\n      res.status(502).json({ message: `Upstream returned ${upstream.status} ${contentType}` });\n      return;\n    }\n    const body = Buffer.from(await upstream.arrayBuffer());\n    if (body.length > MAX_BYTES) {\n      res.status(413).json({ message: `Image is larger than ${MAX_BYTES / 1024 / 1024} MB` });\n      return;\n    }\n    res\n      .status(200)\n      .header('Content-Type', contentType)\n      .header('Cache-Control', 'public, max-age=86400')\n      .header('Access-Control-Allow-Origin', '*')\n      .end(body);\n  } catch (error: any) {\n    res.status(502).json({ message: error?.message ?? 'Fetch failed' });\n  }\n}\n" }];
var image_proxy_default2 = async (req, res) => {
  const umiReq = new import_apiRoute.UmiApiRequest(req, apiRoutes);
  await umiReq.readBody();
  const umiRes = new import_apiRoute.UmiApiResponse(res);
  await new Promise((resolve) => middlewares_default(umiReq, umiRes, resolve));
  await image_proxy_default(umiReq, umiRes);
};
