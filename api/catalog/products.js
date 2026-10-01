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

// src/.umi/api/catalog/products.ts
var products_exports = {};
__export(products_exports, {
  default: () => products_default2
});
module.exports = __toCommonJS(products_exports);

// src/.umi/api/_middlewares.ts
var middlewares_default = async (req, res, next) => {
  next();
};

// src/components/Bills/helpers/calc.ts
var stripDiacritics = (text = "") => text.normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/đ/g, "d").replace(/Đ/g, "D");

// src/const/catalog.ts
var BUILT_IN_CATALOG = [
  { title: "N\u01B0\u1EDBc su\u1ED1i tinh khi\u1EBFt 500ml", barcode: "8930000000017", price: 7e3, unit: "Chai" },
  { title: "N\u01B0\u1EDBc su\u1ED1i tinh khi\u1EBFt 1.5L", barcode: "8930000000024", price: 12e3, unit: "Chai" },
  { title: "M\xEC \u0103n li\u1EC1n v\u1ECB t\xF4m chua cay 75g", barcode: "8930000000031", price: 4500, unit: "G\xF3i" },
  { title: "M\xEC tr\u1ED9n v\u1ECB b\xF2 sa t\u1EBF 85g", barcode: "8930000000048", price: 8500, unit: "G\xF3i" },
  { title: "Ch\xE1o \u0103n li\u1EC1n v\u1ECB g\xE0 50g", barcode: "8930000000055", price: 4e3, unit: "G\xF3i" },
  {
    title: "S\u1EEFa t\u01B0\u01A1i ti\u1EC7t tr\xF9ng c\xF3 \u0111\u01B0\u1EDDng 180ml",
    barcode: "8930000000062",
    price: 8e3,
    unit: "H\u1ED9p"
  },
  { title: "S\u1EEFa chua u\u1ED1ng v\u1ECB d\xE2u 110ml", barcode: "8930000000079", price: 6500, unit: "Chai" },
  { title: "Tr\xE0 xanh kh\xF4ng \u0111\u1ED9 455ml", barcode: "8930000000086", price: 1e4, unit: "Chai" },
  { title: "N\u01B0\u1EDBc ng\u1ECDt c\xF3 ga lon 320ml", barcode: "8930000000093", price: 13e3, unit: "Lon" },
  { title: "C\xE0 ph\xEA s\u1EEFa \u0111\xE1 lon 235ml", barcode: "8930000000109", price: 15e3, unit: "Lon" },
  { title: "B\xE1nh quy b\u01A1 h\u1ED9p thi\u1EBFc 454g", barcode: "8930000000116", price: 119e3, unit: "H\u1ED9p" },
  { title: "B\xE1nh x\u1ED1p ph\xF4 mai 150g", barcode: "8930000000123", price: 25e3, unit: "G\xF3i" },
  { title: "B\xE1nh b\xF4ng lan kem s\u1EEFa 45g", barcode: "8930000000130", price: 19e3, unit: "G\xF3i" },
  { title: "K\u1EB9o tr\xE1i c\xE2y h\u1ED7n h\u1EE3p 98g", barcode: "8930000000147", price: 35e3, unit: "G\xF3i" },
  { title: "Snack khoai t\xE2y v\u1ECB t\u1EF1 nhi\xEAn 52g", barcode: "8930000000154", price: 12e3, unit: "G\xF3i" },
  { title: "G\u1EA1o th\u01A1m t\xFAi 5kg", barcode: "8930000000161", price: 139e3, unit: "T\xFAi" },
  { title: "D\u1EA7u \u0103n \u0111\u1EADu n\xE0nh 1L", barcode: "8930000000178", price: 52e3, unit: "Chai" },
  { title: "N\u01B0\u1EDBc m\u1EAFm c\xE1 c\u01A1m 500ml", barcode: "8930000000185", price: 38e3, unit: "Chai" },
  { title: "N\u01B0\u1EDBc t\u01B0\u01A1ng \u0111\u1EADu n\xE0nh 250ml", barcode: "8930000000192", price: 15500, unit: "Chai" },
  { title: "\u0110\u01B0\u1EDDng tinh luy\u1EC7n 1kg", barcode: "8930000000208", price: 27e3, unit: "G\xF3i" },
  { title: "Tr\u1EE9ng g\xE0 h\u1ED9p 10 qu\u1EA3", barcode: "8930000000215", price: 32e3, unit: "H\u1ED9p" },
  { title: "Th\u1ECBt heo xay 300g", barcode: "8930000000222", price: 45900, unit: "Khay" },
  { title: "Rau mu\u1ED1ng 500g", barcode: "8930000000239", price: 11900, unit: "B\xF3" },
  { title: "Chu\u1ED1i gi\xE0 nam m\u1EF9 1kg", barcode: "8930000000246", price: 29900, unit: "Kg" },
  { title: "T\xE1o \u0111\u1ECF nh\u1EADp kh\u1EA9u 1kg", barcode: "8930000000253", price: 79e3, unit: "Kg" },
  { title: "Kem \u0111\xE1nh r\u0103ng b\u1EA1c h\xE0 180g", barcode: "8930000000260", price: 36e3, unit: "Tu\xFDp" },
  { title: "D\u1EA7u g\u1ED9i s\u1EA1ch g\xE0u 650ml", barcode: "8930000000277", price: 159e3, unit: "Chai" },
  { title: "N\u01B0\u1EDBc r\u1EEDa ch\xE9n h\u01B0\u01A1ng chanh 750g", barcode: "8930000000284", price: 29500, unit: "Chai" },
  { title: "Kh\u0103n gi\u1EA5y r\xFAt 180 t\u1EDD", barcode: "8930000000291", price: 18e3, unit: "G\xF3i" },
  { title: "T\xFAi gi\u1EA5y nh\u1ECF", barcode: "8930000000307", price: 2e3, unit: "C\xE1i" }
];

// src/api/catalog/products.ts
var fold = (text) => stripDiacritics(text).toLowerCase();
async function products_default(req, res) {
  const keyword = fold(String(req.query.keyword ?? ""));
  const products = BUILT_IN_CATALOG.map((product, index) => ({
    ...product,
    id: `built-in:${index}`,
    source: "built-in"
  })).filter(
    (product) => !keyword || fold(product.title).includes(keyword) || product.barcode.includes(keyword)
  );
  res.status(200).json(products);
}

// src/.umi/api/catalog/products.ts
var import_apiRoute = __toESM(require_apiRoute());
var apiRoutes = [{ "path": "catalog/products", "id": "catalog/products", "file": "catalog/products.ts", "absPath": "/catalog/products", "__content": "import type { UmiApiRequest, UmiApiResponse } from '@umijs/max';\n\nimport { stripDiacritics } from '@/components/Bills/helpers/calc';\nimport { BUILT_IN_CATALOG } from '@/const/catalog';\n\nconst fold = (text: string) => stripDiacritics(text).toLowerCase();\n\n/** GET /api/catalog/products?keyword= \u2014 built-in sample products */\nexport default async function (req: UmiApiRequest, res: UmiApiResponse) {\n  const keyword = fold(String(req.query.keyword ?? ''));\n  const products: API.TCatalogProduct[] = BUILT_IN_CATALOG.map((product, index) => ({\n    ...product,\n    id: `built-in:${index}`,\n    source: 'built-in',\n  })).filter(\n    (product) =>\n      !keyword || fold(product.title).includes(keyword) || product.barcode.includes(keyword),\n  );\n  res.status(200).json(products);\n}\n" }, { "path": "bills/render", "id": "bills/render", "file": "bills/render.ts", "absPath": "/bills/render", "__content": "import type { UmiApiRequest, UmiApiResponse } from '@umijs/max';\n\nimport type { TDeepPartialBill } from '@/components/Bills/helpers/normalize';\nimport { BILL_TEMPLATES } from '@/components/Bills/registry';\nimport { renderBill } from '@/utils/render-bill';\n\nconst MAX_ITEMS = 200;\n\nconst decodePayload = (payload: string) =>\n  JSON.parse(\n    Buffer.from(payload.replace(/-/g, '+').replace(/_/g, '/'), 'base64').toString('utf-8'),\n  );\n\nconst first = (value: string | string[] | undefined) => (Array.isArray(value) ? value[0] : value);\n\n/**\n * Query-string shortcuts on top of the full JSON bill:\n *   template, vat, seed, language (vi|en), name, logo (image URL), cashier, invoice, qr, barcode,\n *   scale, format,\n *   items (JSON array)\n */\nconst fromQuery = (\n  query: UmiApiRequest['query'],\n): TDeepPartialBill & { scale?: string; format?: string } => {\n  const payload = first(query.payload);\n  const base: TDeepPartialBill = payload ? decodePayload(payload) : {};\n  const items = first(query.items);\n  return {\n    ...base,\n    templateId: first(query.template) ?? base.templateId,\n    store: {\n      ...base.store,\n      ...(first(query.name) ? { name: first(query.name) } : {}),\n      ...(first(query.logo) ? { logoUrl: first(query.logo) } : {}),\n    },\n    transaction: {\n      ...base.transaction,\n      ...(first(query.cashier) ? { cashier: first(query.cashier) } : {}),\n      ...(first(query.invoice) ? { invoiceNo: first(query.invoice) } : {}),\n    },\n    tax: { ...base.tax, ...(first(query.vat) ? { vatRate: Number(first(query.vat)) } : {}) },\n    display: {\n      ...base.display,\n      ...(first(query.seed) ? { seed: first(query.seed) } : {}),\n      ...(first(query.qr) ? { qrText: first(query.qr) } : {}),\n      ...(first(query.barcode) ? { barcodeText: first(query.barcode) } : {}),\n      ...(first(query.language) === 'en' || first(query.language) === 'vi'\n        ? { language: first(query.language) as 'vi' | 'en' }\n        : {}),\n    },\n    items: items ? JSON.parse(items) : base.items,\n    scale: first(query.scale),\n    format: first(query.format),\n  };\n};\n\n/**\n * GET|POST /api/bills/render \u2192 image/png (or image/svg+xml with format=svg)\n * GET /api/bills/render?list=templates \u2192 available template ids\n */\nexport default async function (req: UmiApiRequest, res: UmiApiResponse) {\n  try {\n    if (first(req.query.list) === 'templates') {\n      res.status(200).json(\n        BILL_TEMPLATES.map(({ id, name, description, printerStyle, fields }) => ({\n          id,\n          name,\n          description,\n          printerStyle,\n          fields,\n        })),\n      );\n      return;\n    }\n\n    let input: TDeepPartialBill & { scale?: string | number; format?: string };\n    if (req.method === 'POST') {\n      // umi has already read the body before calling the handler\n      input = typeof req.body === 'string' ? JSON.parse(req.body) : req.body ?? {};\n    } else {\n      input = fromQuery(req.query);\n    }\n\n    if ((input.items?.length ?? 0) > MAX_ITEMS) {\n      res.status(400).json({ message: `At most ${MAX_ITEMS} items per bill.` });\n      return;\n    }\n\n    const { scale, format, ...bill } = input;\n    const result = await renderBill(bill, {\n      scale: Number(scale) || undefined,\n      format: format === 'svg' ? 'svg' : 'png',\n    });\n\n    res\n      .status(200)\n      .header('Content-Type', result.contentType)\n      .header('Cache-Control', 'no-store')\n      .header('X-Bill-Template', result.data.templateId)\n      .header('X-Bill-Seed', String(result.data.display.seed))\n      .end(result.body);\n  } catch (error: any) {\n    res.status(400).json({ message: error?.message ?? 'Render failed' });\n  }\n}\n" }];
var products_default2 = async (req, res) => {
  const umiReq = new import_apiRoute.UmiApiRequest(req, apiRoutes);
  await umiReq.readBody();
  const umiRes = new import_apiRoute.UmiApiResponse(res);
  await new Promise((resolve) => middlewares_default(umiReq, umiRes, resolve));
  await products_default(umiReq, umiRes);
};
