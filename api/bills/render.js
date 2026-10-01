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
    function matchApiRoute2(apiRoutes2, path2) {
      if (path2.startsWith("/"))
        path2 = path2.substring(1);
      if (path2.startsWith("api/"))
        path2 = path2.substring(4);
      const pathSegments = path2.split("/").filter((p) => p !== "");
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

// src/.umi-production/api/bills/render.ts
var render_exports = {};
__export(render_exports, {
  default: () => render_default2
});
module.exports = __toCommonJS(render_exports);

// src/.umi-production/api/_middlewares.ts
var middlewares_default = async (req, res, next) => {
  next();
};

// src/components/Bills/templates/Aeon/index.tsx
var import_antd2 = require("antd");

// src/components/Bills/fonts.ts
var FONTS_BASE_PATH = "/fonts";
var FONT_PRESETS = {
  ["inconsolata-condensed" /* inconsolataCondensed */]: {
    id: "inconsolata-condensed" /* inconsolataCondensed */,
    family: "Inconsolata Condensed",
    label: "Inconsolata Condensed",
    imitates: "Condensed thermal mono (Epson Font B)",
    files: [
      { weight: 400, file: "InconsolataCondensed-Regular.ttf" },
      { weight: 700, file: "InconsolataCondensed-Bold.ttf" }
    ]
  },
  ["vt323" /* vt323 */]: {
    id: "vt323" /* vt323 */,
    family: "VT323",
    label: "VT323",
    imitates: "Bitmap mono (Epson Font A)",
    files: [{ weight: 400, file: "VT323-Regular.ttf" }]
  },
  ["ibm-plex-mono" /* ibmPlexMono */]: {
    id: "ibm-plex-mono" /* ibmPlexMono */,
    family: "IBM Plex Mono",
    label: "IBM Plex Mono",
    imitates: "Courier-style slab mono",
    files: [
      { weight: 400, file: "IBMPlexMono-Regular.ttf" },
      { weight: 500, file: "IBMPlexMono-Medium.ttf" },
      { weight: 700, file: "IBMPlexMono-Bold.ttf" }
    ]
  },
  ["roboto-condensed" /* robotoCondensed */]: {
    id: "roboto-condensed" /* robotoCondensed */,
    family: "Roboto Condensed",
    label: "Roboto Condensed",
    imitates: "Tall condensed sans",
    files: [
      { weight: 400, file: "RobotoCondensed-Regular.ttf" },
      { weight: 700, file: "RobotoCondensed-Bold.ttf" }
    ]
  },
  ["arimo" /* arimo */]: {
    id: "arimo" /* arimo */,
    family: "Arimo",
    label: "Arimo",
    imitates: "Arial / Helvetica",
    files: [
      { weight: 400, file: "Arimo-Regular.ttf" },
      { weight: 700, file: "Arimo-Bold.ttf" }
    ]
  },
  ["archivo-narrow" /* archivoNarrow */]: {
    id: "archivo-narrow" /* archivoNarrow */,
    family: "Archivo Narrow",
    label: "Archivo Narrow",
    imitates: "Arial Narrow",
    files: [
      { weight: 400, file: "ArchivoNarrow-Regular.ttf" },
      { weight: 700, file: "ArchivoNarrow-Bold.ttf" }
    ]
  },
  ["tinos" /* tinos */]: {
    id: "tinos" /* tinos */,
    family: "Tinos",
    label: "Tinos",
    imitates: "Times New Roman",
    files: [
      { weight: 400, file: "Tinos-Regular.ttf" },
      { weight: 700, file: "Tinos-Bold.ttf" }
    ]
  },
  ["open-sans" /* openSans */]: {
    id: "open-sans" /* openSans */,
    family: "Open Sans",
    label: "Open Sans",
    imitates: "Segoe UI-like sans",
    files: [
      { weight: 400, file: "OpenSans-Regular.ttf" },
      { weight: 700, file: "OpenSans-Bold.ttf" }
    ]
  }
};
var FONT_OPTIONS = Object.values(FONT_PRESETS).map((font) => ({
  value: font.id,
  label: `${font.label} \u2014 ${font.imitates}`
}));
var getFontPreset = (fontId) => FONT_PRESETS[fontId] ?? FONT_PRESETS["inconsolata-condensed" /* inconsolataCondensed */];

// src/components/Bills/helpers/calc.ts
var toNumber = (value) => {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : 0;
};
var calculateTotals = (data) => {
  const vatRate = Math.max(0, toNumber(data.tax?.vatRate)) / 100;
  const priceIncludesVat = data.tax?.priceIncludesVat ?? true;
  const lines = (data.items ?? []).map((item, index) => {
    const unitPrice = toNumber(item.unitPrice);
    const quantity = toNumber(item.quantity);
    const discount = toNumber(item.discount);
    return {
      ...item,
      unitPrice,
      quantity,
      discount,
      index,
      lineTotal: Math.round(unitPrice * quantity - discount)
    };
  });
  const totalQuantity = lines.reduce((acc, line) => acc + line.quantity, 0);
  const grossAmount = lines.reduce((acc, line) => acc + line.unitPrice * line.quantity, 0);
  const totalDiscount = lines.reduce((acc, line) => acc + (line.discount ?? 0), 0);
  const netAmount = grossAmount - totalDiscount;
  const preTaxAmount = priceIncludesVat ? Math.round(netAmount / (1 + vatRate)) : netAmount;
  const vatAmount = priceIncludesVat ? netAmount - preTaxAmount : Math.round(netAmount * vatRate);
  const grandTotal = preTaxAmount + vatAmount;
  const paid = toNumber(data.transaction?.amountPaid);
  const amountPaid = paid > 0 ? paid : grandTotal;
  return {
    lines,
    totalQuantity,
    grossAmount,
    totalDiscount,
    preTaxAmount,
    vatAmount,
    grandTotal,
    amountPaid,
    change: Math.max(0, amountPaid - grandTotal)
  };
};
var formatMoney = (value, separator = ",") => Math.round(value).toString().replace(/\B(?=(\d{3})+(?!\d))/g, separator);
var pad = (value) => String(value).padStart(2, "0");
var formatDateTime = (iso, pattern) => {
  const date = iso ? new Date(iso) : /* @__PURE__ */ new Date();
  const safe = Number.isNaN(date.getTime()) ? /* @__PURE__ */ new Date() : date;
  const tokens = {
    YYYY: String(safe.getFullYear()),
    MM: pad(safe.getMonth() + 1),
    DD: pad(safe.getDate()),
    HH: pad(safe.getHours()),
    mm: pad(safe.getMinutes()),
    ss: pad(safe.getSeconds())
  };
  return pattern.replace(/YYYY|MM|DD|HH|mm|ss/g, (token) => tokens[token]);
};
var stripDiacritics = (text = "") => text.normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/đ/g, "d").replace(/Đ/g, "D");

// src/components/Bills/shared/Print.tsx
var import_antd = require("antd");
var import_classnames = __toESM(require("classnames"));
var import_jsx_runtime = require("react/jsx-runtime");
var INK = "#1c1c1c";
var justifyOf = (align = "left") => align === "center" ? "center" : align === "right" ? "flex-end" : "flex-start";
var Spacer = ({ size = 8 }) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(import_antd.Flex, { className: "w-full", style: { height: size } });
var Text = ({
  children,
  bold,
  size,
  align = "left",
  italic,
  strike,
  nowrap,
  width,
  flex,
  className,
  style
}) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(
  import_antd.Flex,
  {
    justify: justifyOf(align),
    className: (0, import_classnames.default)(
      "min-w-0",
      bold ? "font-bold" : "font-normal",
      italic && "italic",
      strike && "line-through",
      nowrap && "shrink-0",
      width !== void 0 && "shrink-0",
      align === "center" ? "text-center" : align === "right" ? "text-right" : "text-left",
      className
    ),
    style: { fontSize: size, width, flex, whiteSpace: nowrap ? "nowrap" : "pre-wrap", ...style },
    children: children === null || children === void 0 ? "" : String(children)
  }
);
var CharLine = ({
  char = "-",
  className
}) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(
  import_antd.Flex,
  {
    className: (0, import_classnames.default)("w-full overflow-hidden", className),
    style: { whiteSpace: "nowrap", lineHeight: 1 },
    children: char.repeat(160)
  }
);
var RuleLine = ({
  thick,
  dashed,
  className
}) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(
  import_antd.Flex,
  {
    className: (0, import_classnames.default)(
      "w-full my-1 border-0 border-t border-solid border-[#1c1c1c]",
      thick && "border-t-2",
      dashed && "border-dashed",
      className
    )
  }
);
var Cells = ({
  cells,
  size,
  className
}) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(import_antd.Flex, { className: (0, import_classnames.default)("w-full", className), children: cells.map((cell, index) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(
  Text,
  {
    width: cell.width,
    flex: cell.width === void 0 ? cell.flex ?? 1 : void 0,
    align: cell.align,
    bold: cell.bold,
    strike: cell.strike,
    size,
    children: String(cell.text)
  },
  index
)) });
var KeyValue = ({ label, value, bold, size, className }) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_antd.Flex, { justify: "space-between", gap: 8, className: (0, import_classnames.default)("w-full", className), children: [
  /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Text, { bold, size, flex: 1, children: label }),
  /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Text, { bold, size, align: "right", nowrap: true, children: String(value) })
] });
var PrintScale = ({ x = 1, y = 2, align = "left", fontSize, children }) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(
  import_antd.Flex,
  {
    justify: justifyOf(align),
    align: "flex-start",
    style: { height: Math.round(fontSize * 1.3 * y) },
    children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(
      import_antd.Flex,
      {
        style: {
          whiteSpace: "nowrap",
          transform: `scale(${x}, ${y})`,
          transformOrigin: `${align === "center" ? "center" : align} top`
        },
        children
      }
    )
  }
);
var PrintImage = ({ src, width, height, className }) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(
  import_antd.Image,
  {
    src,
    width,
    height: height ?? width,
    preview: false,
    className,
    style: { objectFit: "contain" }
  }
);
var Logo = ({ store, fallback, defaultWidth = 180, defaultAlign = "center", inline }) => {
  if (store.showLogo === false) return null;
  const width = store.logoWidth ?? defaultWidth;
  return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(
    import_antd.Flex,
    {
      justify: justifyOf(store.logoAlign ?? defaultAlign),
      className: inline ? "shrink-0" : "w-full mb-1.5",
      children: store.logoUrl ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(
        import_antd.Image,
        {
          src: store.logoUrl,
          width,
          preview: false,
          style: { objectFit: "contain", maxHeight: width }
        }
      ) : fallback
    }
  );
};
var Wordmark = ({ text, size, variant = "plain", letterSpacing = 1, sub }) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_antd.Flex, { vertical: true, align: "center", children: [
  /* @__PURE__ */ (0, import_jsx_runtime.jsx)(
    import_antd.Flex,
    {
      className: (0, import_classnames.default)(
        "font-bold",
        variant === "inverted" && "bg-[#1c1c1c] text-white px-3 py-1",
        variant === "boxed" && "border-2 border-solid border-[#1c1c1c] px-3 py-1"
      ),
      style: { fontSize: size, letterSpacing, lineHeight: 1 },
      children: text
    }
  ),
  sub ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Text, { size: Math.round(size * 0.38), italic: true, children: sub }) : null
] });

// src/const/bill.ts
var DEFAULT_VAT_RATE = 10;
var PAPER_WIDTH = {
  mm58: 384,
  mm80: 576
};
var WATERMARK_LIMITS = {
  opacity: { min: 0.08, max: 0.6, default: 0.14 },
  size: { min: 12, max: 64, default: 22 },
  angle: { min: -90, max: 90, default: -30 },
  spacing: { min: 0.6, max: 2, default: 1 },
  requiredMark: "SAMPLE",
  defaultText: "M\u1EAAU \xB7 KH\xD4NG C\xD3 GI\xC1 TR\u1ECA THANH TO\xC1N"
};

// src/components/Bills/templates/Aeon/index.tsx
var import_jsx_runtime2 = require("react/jsx-runtime");
var money = (value) => formatMoney(value, ".");
var Aeon = ({ data, totals, codes, font, t }) => {
  const { store, transaction, display, tax } = data;
  const s = font.size;
  const dateTime = formatDateTime(transaction.dateTime, "DD/MM/YYYY HH:mm");
  const upper = (text) => (text ?? "").toUpperCase();
  const T = (key) => upper(t(key));
  return /* @__PURE__ */ (0, import_jsx_runtime2.jsxs)(import_antd2.Flex, { vertical: true, children: [
    /* @__PURE__ */ (0, import_jsx_runtime2.jsx)(
      Logo,
      {
        store,
        fallback: /* @__PURE__ */ (0, import_jsx_runtime2.jsx)(Wordmark, { text: store.name, size: s * 2.6, letterSpacing: 2 })
      }
    ),
    /* @__PURE__ */ (0, import_jsx_runtime2.jsxs)(import_antd2.Flex, { vertical: true, align: "center", children: [
      /* @__PURE__ */ (0, import_jsx_runtime2.jsx)(Text, { align: "center", children: store.legalName ?? "" }),
      /* @__PURE__ */ (0, import_jsx_runtime2.jsx)(Text, { align: "center", children: `${T("receipt.phone")}: ${store.phone ?? ""} - ${store.website ?? ""}` }),
      /* @__PURE__ */ (0, import_jsx_runtime2.jsx)(Text, { align: "center", children: `${T("receipt.openingHours")}: ${upper(store.slogan)}` }),
      /* @__PURE__ */ (0, import_jsx_runtime2.jsx)(Text, { align: "center", children: `${T("receipt.phone")}: ${store.hotline ?? ""}` }),
      /* @__PURE__ */ (0, import_jsx_runtime2.jsx)(Text, { align: "center", children: transaction.lookupCode || `M1-26-${codes.barcodeValue.slice(0, 13)}` })
    ] }),
    /* @__PURE__ */ (0, import_jsx_runtime2.jsx)(Text, { children: T("receipt.product") }),
    /* @__PURE__ */ (0, import_jsx_runtime2.jsx)(Text, { children: T("receipt.productCode") }),
    /* @__PURE__ */ (0, import_jsx_runtime2.jsxs)(import_antd2.Flex, { justify: "space-between", align: "flex-end", children: [
      /* @__PURE__ */ (0, import_jsx_runtime2.jsx)(import_antd2.Flex, { flex: 1, className: "min-w-0", children: /* @__PURE__ */ (0, import_jsx_runtime2.jsx)(
        Cells,
        {
          cells: [
            { text: T("receipt.quantity"), width: s * 6 },
            { text: T("receipt.unitPrice"), flex: 1, align: "center" }
          ]
        }
      ) }),
      /* @__PURE__ */ (0, import_jsx_runtime2.jsxs)(import_antd2.Flex, { vertical: true, align: "flex-end", className: "shrink-0", children: [
        /* @__PURE__ */ (0, import_jsx_runtime2.jsx)(Text, { align: "right", children: "VAT" }),
        /* @__PURE__ */ (0, import_jsx_runtime2.jsx)(Text, { align: "right", nowrap: true, children: T("receipt.amount") })
      ] })
    ] }),
    /* @__PURE__ */ (0, import_jsx_runtime2.jsx)(CharLine, { char: "=" }),
    totals.lines.map((line) => /* @__PURE__ */ (0, import_jsx_runtime2.jsxs)(import_antd2.Flex, { vertical: true, className: "mb-0.5", children: [
      /* @__PURE__ */ (0, import_jsx_runtime2.jsx)(Text, { children: upper(line.title) }),
      /* @__PURE__ */ (0, import_jsx_runtime2.jsxs)(import_antd2.Flex, { justify: "space-between", children: [
        /* @__PURE__ */ (0, import_jsx_runtime2.jsx)(Text, { children: line.barcode ?? "" }),
        /* @__PURE__ */ (0, import_jsx_runtime2.jsx)(Text, { align: "right", nowrap: true, children: `VAT ${tax.vatRate}%` })
      ] }),
      /* @__PURE__ */ (0, import_jsx_runtime2.jsx)(
        Cells,
        {
          cells: [
            { text: line.quantity, width: s * 6 },
            { text: money(line.unitPrice), flex: 1, align: "center" },
            { text: money(line.lineTotal), flex: 1, align: "right" }
          ]
        }
      )
    ] }, line.index)),
    /* @__PURE__ */ (0, import_jsx_runtime2.jsx)(CharLine, {}),
    /* @__PURE__ */ (0, import_jsx_runtime2.jsx)(Text, { children: `${T("receipt.itemCount")}: ${totals.lines.length}` }),
    /* @__PURE__ */ (0, import_jsx_runtime2.jsx)(Text, { children: T("receipt.paymentMethod") }),
    /* @__PURE__ */ (0, import_jsx_runtime2.jsx)(
      KeyValue,
      {
        label: `${upper(transaction.paymentMethod) || T("receipt.cash")}       :`,
        value: ""
      }
    ),
    /* @__PURE__ */ (0, import_jsx_runtime2.jsx)(Text, { align: "right", children: money(totals.amountPaid) }),
    /* @__PURE__ */ (0, import_jsx_runtime2.jsx)(CharLine, {}),
    /* @__PURE__ */ (0, import_jsx_runtime2.jsx)(KeyValue, { label: `${T("receipt.totalPayment")}     :`, value: money(totals.grandTotal) }),
    /* @__PURE__ */ (0, import_jsx_runtime2.jsx)(KeyValue, { label: `${T("receipt.change")}       :`, value: money(totals.change) }),
    /* @__PURE__ */ (0, import_jsx_runtime2.jsx)(CharLine, {}),
    /* @__PURE__ */ (0, import_jsx_runtime2.jsx)(Text, { children: T("receipt.pricesIncludeVat") }),
    /* @__PURE__ */ (0, import_jsx_runtime2.jsx)(CharLine, {}),
    /* @__PURE__ */ (0, import_jsx_runtime2.jsx)(Text, { children: `${T("receipt.cashier")}: ${transaction.cashier ?? ""}` }),
    /* @__PURE__ */ (0, import_jsx_runtime2.jsx)(Text, { children: `${T("receipt.counter")}: ${transaction.posNo ?? ""}` }),
    /* @__PURE__ */ (0, import_jsx_runtime2.jsx)(Text, { children: `${T("receipt.memberId")}: ${transaction.memberCode ?? ""}` }),
    /* @__PURE__ */ (0, import_jsx_runtime2.jsx)(Text, { children: `${T("receipt.pointsStar")}: 0` }),
    /* @__PURE__ */ (0, import_jsx_runtime2.jsxs)(import_antd2.Flex, { justify: "space-between", children: [
      /* @__PURE__ */ (0, import_jsx_runtime2.jsx)(Text, { children: `${T("receipt.transactionNo")}: ${transaction.invoiceNo ?? ""}` }),
      /* @__PURE__ */ (0, import_jsx_runtime2.jsx)(Text, { align: "right", nowrap: true, children: `${dateTime.slice(11)} ${dateTime.slice(0, 10)}` })
    ] }),
    /* @__PURE__ */ (0, import_jsx_runtime2.jsx)(CharLine, { char: "=" }),
    /* @__PURE__ */ (0, import_jsx_runtime2.jsx)(Text, { align: "center", children: upper(data.footerNote) }),
    /* @__PURE__ */ (0, import_jsx_runtime2.jsx)(Spacer, { size: 10 }),
    display.showQr !== false ? /* @__PURE__ */ (0, import_jsx_runtime2.jsxs)(import_antd2.Flex, { vertical: true, gap: 16, children: [
      /* @__PURE__ */ (0, import_jsx_runtime2.jsxs)(import_antd2.Flex, { gap: 12, align: "center", children: [
        /* @__PURE__ */ (0, import_jsx_runtime2.jsx)(PrintImage, { src: codes.qrDataUrl, width: s * 5 }),
        /* @__PURE__ */ (0, import_jsx_runtime2.jsx)(Text, { flex: 1, children: t("receipt.scanQrVat") })
      ] }),
      /* @__PURE__ */ (0, import_jsx_runtime2.jsxs)(import_antd2.Flex, { gap: 12, align: "center", children: [
        /* @__PURE__ */ (0, import_jsx_runtime2.jsx)(PrintImage, { src: codes.qrDataUrl, width: s * 5 }),
        /* @__PURE__ */ (0, import_jsx_runtime2.jsx)(Text, { flex: 1, children: t("receipt.scanQrFeedback") })
      ] })
    ] }) : null,
    /* @__PURE__ */ (0, import_jsx_runtime2.jsx)(Spacer, { size: 10 }),
    /* @__PURE__ */ (0, import_jsx_runtime2.jsx)(Text, { align: "center", children: t("receipt.thanks") }),
    display.showBarcode ? /* @__PURE__ */ (0, import_jsx_runtime2.jsx)(import_antd2.Flex, { justify: "center", className: "mt-2", children: /* @__PURE__ */ (0, import_jsx_runtime2.jsx)(PrintImage, { src: codes.barcodeDataUrl, width: Math.round(s * 16), height: s * 2 }) }) : null
  ] });
};
var aeonTemplate = {
  id: "aeon",
  name: "Aeon layout",
  description: "Mall receipt: accented uppercase mono, per-line VAT, member points, two QR notes",
  printerStyle: "Condensed thermal mono (Epson Font B)",
  component: Aeon,
  fontId: "inconsolata-condensed" /* inconsolataCondensed */,
  fontSize: 17,
  paperWidth: PAPER_WIDTH.mm58 + 32,
  catalogAccounts: ["aeon"],
  // the bill prints the store's own item code (ART CODE), not the EAN
  itemCode: "artCode",
  fields: [
    "store.legalName",
    "store.phone",
    "store.hotline",
    "store.website",
    "store.slogan",
    "transaction.invoiceNo",
    "transaction.posNo",
    "transaction.cashier",
    "transaction.paymentMethod",
    "transaction.amountPaid",
    "transaction.memberCode",
    "transaction.lookupCode",
    "item.barcode",
    "footerNote"
  ],
  defaults: {
    store: {
      name: "AURORA",
      legalName: "Trung t\xE2m mua s\u1EAFm AURORA-B\xCCNH D\u01AF\u01A0NG",
      phone: "1800.000.000",
      hotline: "1800.000.111",
      website: "www.aurora.example.com",
      slogan: "8H00-22H00",
      /** Default logo image src for this template; empty → text wordmark */
      logoUrl: "",
      showLogo: true,
      logoAlign: "center"
    },
    transaction: {
      invoiceNo: "0150241",
      posNo: "015",
      cashier: "Nguy\u1EC5n Th\u1ECB Kh\xE1nh An",
      paymentMethod: "Ti\u1EC1n m\u1EB7t",
      memberCode: "1003279371",
      amountPaid: 6e4
    },
    footerNote: "Vui l\xF2ng gi\u1EEF l\u1EA1i phi\u1EBFu \u0111\u1EC3 c\xF3 th\u1EC3 \u0111\u1ED5i, tr\u1EA3 trong th\u1EDDi h\u1EA1n quy \u0111\u1ECBnh \u0111\u01B0\u1EE3c ni\xEAm y\u1EBFt t\u1EA1i qu\u1EA7y d\u1ECBch v\u1EE5 kh\xE1ch h\xE0ng",
    tax: { vatRate: 8 }
  }
};

// src/components/Bills/templates/AeonCitimart/index.tsx
var import_antd3 = require("antd");
var import_jsx_runtime3 = require("react/jsx-runtime");
var AeonCitimart = ({ data, totals, codes, font, t }) => {
  const { store, transaction, display, tax } = data;
  const s = font.size;
  const dateTime = formatDateTime(transaction.dateTime, "DD/MM/YYYY HH:mm");
  const T = (key, values) => stripDiacritics(t(key, values));
  return /* @__PURE__ */ (0, import_jsx_runtime3.jsxs)(import_antd3.Flex, { vertical: true, children: [
    /* @__PURE__ */ (0, import_jsx_runtime3.jsx)(
      Logo,
      {
        store,
        fallback: /* @__PURE__ */ (0, import_jsx_runtime3.jsx)(Wordmark, { text: store.name, size: s * 2, sub: stripDiacritics(store.slogan) })
      }
    ),
    /* @__PURE__ */ (0, import_jsx_runtime3.jsxs)(import_antd3.Flex, { vertical: true, align: "center", children: [
      /* @__PURE__ */ (0, import_jsx_runtime3.jsx)(Text, { align: "center", children: stripDiacritics(store.address) }),
      /* @__PURE__ */ (0, import_jsx_runtime3.jsx)(Text, { align: "center", children: `${T("receipt.tel")}:${store.phone ?? ""}` }),
      /* @__PURE__ */ (0, import_jsx_runtime3.jsx)(Text, { align: "center", children: `${T("receipt.taxCode")}: ${store.taxCode ?? ""}` }),
      /* @__PURE__ */ (0, import_jsx_runtime3.jsx)(Text, { align: "center", children: `${T("receipt.website")}: ${store.website ?? ""}` }),
      /* @__PURE__ */ (0, import_jsx_runtime3.jsx)(Text, { align: "center", size: s * 1.5, bold: true, children: T("receipt.retailInvoice").toUpperCase() })
    ] }),
    /* @__PURE__ */ (0, import_jsx_runtime3.jsx)(Spacer, { size: 6 }),
    /* @__PURE__ */ (0, import_jsx_runtime3.jsxs)(import_antd3.Flex, { justify: "space-between", children: [
      /* @__PURE__ */ (0, import_jsx_runtime3.jsx)(Text, { children: `${T("receipt.invoiceNoLong")}:${transaction.invoiceNo ?? ""}` }),
      /* @__PURE__ */ (0, import_jsx_runtime3.jsx)(Text, { align: "right", nowrap: true, children: `${T("receipt.date")}: ${dateTime.slice(0, 10)}` })
    ] }),
    /* @__PURE__ */ (0, import_jsx_runtime3.jsxs)(import_antd3.Flex, { justify: "space-between", children: [
      /* @__PURE__ */ (0, import_jsx_runtime3.jsx)(Text, { children: `${T("receipt.counter")}:   ${transaction.posNo ?? ""}` }),
      /* @__PURE__ */ (0, import_jsx_runtime3.jsx)(Text, { align: "right", nowrap: true, children: `${T("receipt.time")}: ${dateTime.slice(11)}` })
    ] }),
    /* @__PURE__ */ (0, import_jsx_runtime3.jsx)(Text, { children: `${T("receipt.cashier")}:  ${stripDiacritics(transaction.cashier)}` }),
    /* @__PURE__ */ (0, import_jsx_runtime3.jsx)(Text, { children: `${T("receipt.customer")}: ${stripDiacritics(transaction.customerName)}` }),
    /* @__PURE__ */ (0, import_jsx_runtime3.jsx)(
      Cells,
      {
        cells: [
          { text: T("receipt.product").toUpperCase(), flex: 3 },
          { text: T("receipt.quantity").toUpperCase(), flex: 2, align: "right" },
          { text: T("receipt.unitPrice").toUpperCase(), flex: 2, align: "right" },
          { text: T("receipt.amount").toUpperCase(), flex: 2, align: "right" }
        ]
      }
    ),
    /* @__PURE__ */ (0, import_jsx_runtime3.jsx)(CharLine, {}),
    totals.lines.map((line) => /* @__PURE__ */ (0, import_jsx_runtime3.jsxs)(import_antd3.Flex, { vertical: true, children: [
      /* @__PURE__ */ (0, import_jsx_runtime3.jsx)(Text, { children: stripDiacritics(line.title).toUpperCase() }),
      /* @__PURE__ */ (0, import_jsx_runtime3.jsx)(
        Cells,
        {
          cells: [
            { text: ` ${line.barcode ?? ""}`, flex: 3 },
            { text: line.quantity, flex: 2, align: "right" },
            { text: formatMoney(line.unitPrice), flex: 2, align: "right" },
            { text: formatMoney(line.lineTotal), flex: 2, align: "right" }
          ]
        }
      )
    ] }, line.index)),
    /* @__PURE__ */ (0, import_jsx_runtime3.jsx)(CharLine, {}),
    /* @__PURE__ */ (0, import_jsx_runtime3.jsx)(
      KeyValue,
      {
        label: `${T("receipt.totalDiscount")}:`,
        value: formatMoney(totals.totalDiscount)
      }
    ),
    /* @__PURE__ */ (0, import_jsx_runtime3.jsx)(KeyValue, { label: `${tax.vatRate}      (%VAT)`, value: formatMoney(totals.vatAmount) }),
    /* @__PURE__ */ (0, import_jsx_runtime3.jsx)(KeyValue, { label: `${T("receipt.tax")}:`, value: formatMoney(totals.vatAmount) }),
    /* @__PURE__ */ (0, import_jsx_runtime3.jsx)(
      KeyValue,
      {
        label: `${T("receipt.totalBeforeTax")}:`,
        value: formatMoney(totals.preTaxAmount)
      }
    ),
    /* @__PURE__ */ (0, import_jsx_runtime3.jsx)(
      KeyValue,
      {
        label: `${T("receipt.totalWithTax").toUpperCase()}:`,
        value: formatMoney(totals.grandTotal),
        bold: true
      }
    ),
    /* @__PURE__ */ (0, import_jsx_runtime3.jsx)(Spacer, { size: 10 }),
    /* @__PURE__ */ (0, import_jsx_runtime3.jsx)(
      KeyValue,
      {
        label: stripDiacritics(transaction.paymentMethod) || T("receipt.cash"),
        value: formatMoney(totals.amountPaid)
      }
    ),
    /* @__PURE__ */ (0, import_jsx_runtime3.jsx)(Spacer, { size: 10 }),
    /* @__PURE__ */ (0, import_jsx_runtime3.jsx)(
      KeyValue,
      {
        label: T("receipt.changeCash", {
          method: stripDiacritics(transaction.paymentMethod) || T("receipt.cash")
        }),
        value: formatMoney(totals.change)
      }
    ),
    /* @__PURE__ */ (0, import_jsx_runtime3.jsx)(CharLine, {}),
    /* @__PURE__ */ (0, import_jsx_runtime3.jsx)(Text, { children: `${T("receipt.memberCardLong")}: ${transaction.memberCode ?? ""}` }),
    /* @__PURE__ */ (0, import_jsx_runtime3.jsx)(Text, { children: `${T("receipt.pointsUsed")}:` }),
    /* @__PURE__ */ (0, import_jsx_runtime3.jsx)(Spacer, { size: 10 }),
    /* @__PURE__ */ (0, import_jsx_runtime3.jsx)(Text, { children: `${T("receipt.currentPoints")}:` }),
    /* @__PURE__ */ (0, import_jsx_runtime3.jsx)(Text, { children: T("receipt.pointsNote") }),
    /* @__PURE__ */ (0, import_jsx_runtime3.jsx)(CharLine, {}),
    /* @__PURE__ */ (0, import_jsx_runtime3.jsx)(Text, { align: "center", children: stripDiacritics(data.footerNote) }),
    display.showQr ? /* @__PURE__ */ (0, import_jsx_runtime3.jsx)(import_antd3.Flex, { justify: "center", className: "mt-2", children: /* @__PURE__ */ (0, import_jsx_runtime3.jsx)(PrintImage, { src: codes.qrDataUrl, width: s * 6 }) }) : null,
    display.showBarcode !== false ? /* @__PURE__ */ (0, import_jsx_runtime3.jsx)(import_antd3.Flex, { justify: "center", className: "mt-6", children: /* @__PURE__ */ (0, import_jsx_runtime3.jsx)(PrintImage, { src: codes.barcodeDataUrl, width: Math.round(s * 16), height: s * 2.5 }) }) : null
  ] });
};
var aeonCitimartTemplate = {
  id: "aeon-citimart",
  name: "Aeon Citimart / MM Mega Market layout",
  description: "Supermarket retail invoice, unaccented bitmap print, barcode per item",
  printerStyle: "Bitmap mono (Epson Font A)",
  component: AeonCitimart,
  fontId: "vt323" /* vt323 */,
  fontSize: 18,
  paperWidth: PAPER_WIDTH.mm58 + 16,
  catalogAccounts: ["citimart", "mega market", "mm mega"],
  fields: [
    "store.address",
    "store.phone",
    "store.taxCode",
    "store.website",
    "store.slogan",
    "transaction.invoiceNo",
    "transaction.posNo",
    "transaction.cashier",
    "transaction.paymentMethod",
    "transaction.amountPaid",
    "transaction.customerName",
    "transaction.memberCode",
    "item.barcode",
    "item.discount",
    "footerNote"
  ],
  defaults: {
    store: {
      name: "HOA BINH Supermarket",
      slogan: "Noi mua sam cua moi nha",
      address: "45 Nguy\u1EC5n Th\u01B0\u1EE3ng Hi\u1EC1n, Qu\u1EADn 3, TP.HCM, Vi\u1EC7t Nam",
      phone: "(028)39000000",
      taxCode: "0100000003",
      website: "www.hoabinhmart.example.com",
      /** Default logo image src for this template; empty → text wordmark */
      logoUrl: "",
      showLogo: true,
      logoAlign: "center"
    },
    transaction: {
      invoiceNo: "1111110269833",
      posNo: "111110",
      cashier: "674624_NHU",
      paymentMethod: "Tien mat",
      amountPaid: 1e5
    },
    footerNote: "XIN CHAN THANH CAM ON (THANK YOU)\nHoa don se duoc xuat trong ngay\nTax invoice will be issued within same day",
    tax: { vatRate: 8 }
  }
};

// src/components/Bills/templates/CircleK/index.tsx
var import_antd4 = require("antd");
var import_jsx_runtime4 = require("react/jsx-runtime");
var CircleK = ({ data, totals, codes, font, t }) => {
  const { store, transaction, display } = data;
  const s = font.size;
  const bi = (key, english) => t.lang === "vi" ? `${stripDiacritics(t(key)).toUpperCase()}/${english}` : english;
  const date = new Date(transaction.dateTime || Date.now());
  const weekday = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"][date.getDay()];
  const month = date.toLocaleString("en-US", { month: "short" });
  return /* @__PURE__ */ (0, import_jsx_runtime4.jsxs)(import_antd4.Flex, { vertical: true, children: [
    /* @__PURE__ */ (0, import_jsx_runtime4.jsx)(
      Logo,
      {
        store,
        fallback: /* @__PURE__ */ (0, import_jsx_runtime4.jsx)(Wordmark, { text: store.name, size: s * 2.2, variant: "inverted" })
      }
    ),
    /* @__PURE__ */ (0, import_jsx_runtime4.jsx)(Text, { size: s * 0.8, bold: true, children: stripDiacritics(store.legalName).toUpperCase() }),
    /* @__PURE__ */ (0, import_jsx_runtime4.jsx)(Text, { size: s * 0.8, children: stripDiacritics(store.address) }),
    /* @__PURE__ */ (0, import_jsx_runtime4.jsx)(Text, { size: s * 0.8, children: `${bi("receipt.taxCode", "TAX CODE")}: ${store.taxCode ?? ""}` }),
    /* @__PURE__ */ (0, import_jsx_runtime4.jsx)(Spacer, { size: 4 }),
    /* @__PURE__ */ (0, import_jsx_runtime4.jsx)(Text, { size: s * 1.1, children: bi("receipt.bill", "RECEIPT") }),
    /* @__PURE__ */ (0, import_jsx_runtime4.jsx)(Text, { size: s * 0.8, children: `${bi("receipt.lookupCode", "LOOKUP")}:${transaction.lookupCode || codes.barcodeValue.slice(0, 12)}` }),
    /* @__PURE__ */ (0, import_jsx_runtime4.jsx)(Text, { children: `Store:${store.branch ?? ""}` }),
    /* @__PURE__ */ (0, import_jsx_runtime4.jsx)(Text, { children: `Receipt:${transaction.invoiceNo ?? ""}` }),
    /* @__PURE__ */ (0, import_jsx_runtime4.jsx)(Text, { children: `Date:${weekday} ${String(date.getDate()).padStart(
      2,
      "0"
    )} ${month} ${date.getFullYear()} ${formatDateTime(
      transaction.dateTime,
      "DD/MM/YYYY HH:mm:ss"
    ).slice(11)}` }),
    /* @__PURE__ */ (0, import_jsx_runtime4.jsx)(Text, { children: `Terminal:${transaction.posNo ?? ""}` }),
    /* @__PURE__ */ (0, import_jsx_runtime4.jsx)(Text, { children: `CashierName:${stripDiacritics(transaction.cashier)}` }),
    /* @__PURE__ */ (0, import_jsx_runtime4.jsx)(
      Cells,
      {
        cells: [
          { text: "ITEM", width: s * 4 },
          { text: "UnitPrice", width: s * 6 },
          { text: "Qty", flex: 1 },
          { text: "Amount", align: "right", flex: 1 }
        ]
      }
    ),
    /* @__PURE__ */ (0, import_jsx_runtime4.jsx)(CharLine, {}),
    totals.lines.map((line) => /* @__PURE__ */ (0, import_jsx_runtime4.jsxs)(import_antd4.Flex, { vertical: true, className: "mb-0.5", children: [
      /* @__PURE__ */ (0, import_jsx_runtime4.jsx)(Text, { align: "center", children: stripDiacritics(line.title) }),
      /* @__PURE__ */ (0, import_jsx_runtime4.jsx)(
        Cells,
        {
          cells: [
            { text: formatMoney(line.unitPrice), width: s * 7, align: "right" },
            { text: line.quantity, flex: 1, align: "center" },
            { text: formatMoney(line.unitPrice * line.quantity), flex: 1, align: "right" }
          ]
        }
      ),
      line.discount ? /* @__PURE__ */ (0, import_jsx_runtime4.jsx)(KeyValue, { label: "  KM-Discount", value: `-${formatMoney(line.discount)}` }) : null
    ] }, line.index)),
    /* @__PURE__ */ (0, import_jsx_runtime4.jsx)(CharLine, {}),
    /* @__PURE__ */ (0, import_jsx_runtime4.jsxs)(import_antd4.Flex, { vertical: true, style: { paddingLeft: s * 2 }, children: [
      /* @__PURE__ */ (0, import_jsx_runtime4.jsx)(KeyValue, { label: "Total Item(s) Qty:", value: totals.totalQuantity, bold: true }),
      /* @__PURE__ */ (0, import_jsx_runtime4.jsx)(KeyValue, { label: "Subtotal:", value: `${formatMoney(totals.grossAmount)} VND` }),
      /* @__PURE__ */ (0, import_jsx_runtime4.jsx)(
        KeyValue,
        {
          label: "Total Discount:",
          value: `${totals.totalDiscount ? "-" : ""}${formatMoney(totals.totalDiscount)} VND`
        }
      ),
      /* @__PURE__ */ (0, import_jsx_runtime4.jsxs)(import_antd4.Flex, { justify: "space-between", children: [
        /* @__PURE__ */ (0, import_jsx_runtime4.jsx)(PrintScale, { fontSize: s, y: 2, children: /* @__PURE__ */ (0, import_jsx_runtime4.jsx)(Text, { children: "Total(+VAT):" }) }),
        /* @__PURE__ */ (0, import_jsx_runtime4.jsx)(PrintScale, { fontSize: s, y: 2, align: "right", children: /* @__PURE__ */ (0, import_jsx_runtime4.jsx)(Text, { children: `${formatMoney(totals.grandTotal)} VND` }) })
      ] })
    ] }),
    /* @__PURE__ */ (0, import_jsx_runtime4.jsx)(CharLine, {}),
    /* @__PURE__ */ (0, import_jsx_runtime4.jsxs)(import_antd4.Flex, { vertical: true, style: { paddingLeft: s * 2 }, children: [
      /* @__PURE__ */ (0, import_jsx_runtime4.jsx)(
        KeyValue,
        {
          label: `${stripDiacritics(transaction.paymentMethod) || "Cash"}:`,
          value: `${formatMoney(totals.amountPaid)} VND`
        }
      ),
      /* @__PURE__ */ (0, import_jsx_runtime4.jsx)(KeyValue, { label: "CHANGE DUE:", value: `${formatMoney(totals.change)} VND`, bold: true }),
      /* @__PURE__ */ (0, import_jsx_runtime4.jsx)(
        KeyValue,
        {
          label: `VAT ${data.tax.vatRate}% incl.:`,
          value: `${formatMoney(totals.vatAmount)} VND`
        }
      )
    ] }),
    /* @__PURE__ */ (0, import_jsx_runtime4.jsx)(Spacer, { size: 4 }),
    /* @__PURE__ */ (0, import_jsx_runtime4.jsx)(Text, { size: s * 0.8, children: stripDiacritics(data.footerNote) }),
    /* @__PURE__ */ (0, import_jsx_runtime4.jsx)(Spacer, { size: 4 }),
    /* @__PURE__ */ (0, import_jsx_runtime4.jsx)(Text, { bold: true, children: `${bi("receipt.lookupCode", "TRACKING CODE")}: ${codes.barcodeValue.slice(
      4,
      16
    )}` }),
    /* @__PURE__ */ (0, import_jsx_runtime4.jsx)(Text, { size: s * 0.8, children: stripDiacritics(t("receipt.updateInvoiceInfo", { site: store.website ?? "" })) }),
    /* @__PURE__ */ (0, import_jsx_runtime4.jsx)(CharLine, {}),
    display.showBarcode !== false ? /* @__PURE__ */ (0, import_jsx_runtime4.jsx)(import_antd4.Flex, { justify: "center", className: "mt-1.5", children: /* @__PURE__ */ (0, import_jsx_runtime4.jsx)(
      PrintImage,
      {
        src: codes.barcodeDataUrl,
        width: Math.round(s * 15),
        height: Math.round(s * 2.2)
      }
    ) }) : null,
    display.showQr ? /* @__PURE__ */ (0, import_jsx_runtime4.jsx)(import_antd4.Flex, { justify: "center", className: "mt-1.5", children: /* @__PURE__ */ (0, import_jsx_runtime4.jsx)(PrintImage, { src: codes.qrDataUrl, width: s * 7 }) }) : null
  ] });
};
var circleKTemplate = {
  id: "circle-k",
  name: "Circle K layout",
  description: "Convenience store, unaccented bilingual text, double-height total",
  printerStyle: "Condensed thermal mono (Epson Font B)",
  component: CircleK,
  fontId: "inconsolata-condensed" /* inconsolataCondensed */,
  fontSize: 17,
  paperWidth: PAPER_WIDTH.mm58 + 32,
  catalogAccounts: ["circle k"],
  fields: [
    "store.legalName",
    "store.branch",
    "store.address",
    "store.taxCode",
    "store.website",
    "transaction.invoiceNo",
    "transaction.posNo",
    "transaction.cashier",
    "transaction.paymentMethod",
    "transaction.amountPaid",
    "transaction.lookupCode",
    "item.discount",
    "footerNote"
  ],
  defaults: {
    store: {
      name: "SAO MAI 24/7",
      legalName: "Chi nh\xE1nh C\xF4ng ty TNHH Sao Mai Ti\u1EC7n L\u1EE3i",
      branch: "SM0142",
      address: "12 \u0110\u01B0\u1EDDng S\u1ED1 7, Ph\u01B0\u1EDDng An Kh\xE1nh, TP. Th\u1EE7 \u0110\u1EE9c, TP.HCM",
      taxCode: "0100000001-142",
      website: "www.saomai247.example.com/hoa-don",
      /** Default logo image src for this template; empty → text wordmark */
      logoUrl: "",
      showLogo: true,
      logoAlign: "center",
      logoWidth: 200
    },
    transaction: {
      invoiceNo: "TE",
      posNo: "02",
      cashier: "Nguy\u1EC5n Th\u1ECB Lan",
      paymentMethod: "Cash"
    },
    footerNote: "Khong tra hang va hoan tien thua khi thanh toan bang voucher.\nNo refund and no change due when paying by voucher."
  }
};

// src/components/Bills/templates/Coopmart/index.tsx
var import_antd5 = require("antd");
var import_jsx_runtime5 = require("react/jsx-runtime");
var money2 = (value) => `${formatMoney(value, ".")} \u0111`;
var Coopmart = ({ data, totals, codes, font, t }) => {
  const { store, transaction, display, tax } = data;
  const s = font.size;
  const dateTime = formatDateTime(transaction.dateTime, "DD/MM/YYYY HH:mm:ss");
  const T = (key, values) => stripDiacritics(t(key, values));
  return /* @__PURE__ */ (0, import_jsx_runtime5.jsxs)(import_antd5.Flex, { vertical: true, children: [
    /* @__PURE__ */ (0, import_jsx_runtime5.jsx)(
      Logo,
      {
        store,
        fallback: /* @__PURE__ */ (0, import_jsx_runtime5.jsx)(Wordmark, { text: store.name, size: s * 2.2, sub: store.slogan })
      }
    ),
    /* @__PURE__ */ (0, import_jsx_runtime5.jsxs)(import_antd5.Flex, { vertical: true, align: "center", children: [
      /* @__PURE__ */ (0, import_jsx_runtime5.jsx)(Text, { align: "center", children: stripDiacritics(store.branch) }),
      /* @__PURE__ */ (0, import_jsx_runtime5.jsx)(Text, { align: "center", children: `${T("receipt.taxCode")}: ${store.taxCode ?? ""}` }),
      /* @__PURE__ */ (0, import_jsx_runtime5.jsx)(Text, { align: "center", children: `${T("receipt.salesLocation")} ${stripDiacritics(store.address)}` }),
      /* @__PURE__ */ (0, import_jsx_runtime5.jsx)(Text, { align: "center", children: `${T("receipt.phone")}: ${store.phone ?? ""}` }),
      /* @__PURE__ */ (0, import_jsx_runtime5.jsx)(Text, { align: "center", children: `Hotline: ${store.hotline ?? ""}` }),
      /* @__PURE__ */ (0, import_jsx_runtime5.jsx)(Text, { align: "center", children: `Website: ${store.website ?? ""}` }),
      /* @__PURE__ */ (0, import_jsx_runtime5.jsx)(Text, { align: "center", size: s * 1.2, bold: true, children: T("receipt.bill").toUpperCase() }),
      /* @__PURE__ */ (0, import_jsx_runtime5.jsx)(Text, { align: "center", children: T("receipt.supermarketOrder") })
    ] }),
    /* @__PURE__ */ (0, import_jsx_runtime5.jsxs)(import_antd5.Flex, { justify: "space-between", children: [
      /* @__PURE__ */ (0, import_jsx_runtime5.jsx)(Text, { children: `${T("receipt.counter")}: ${transaction.posNo ?? ""}` }),
      /* @__PURE__ */ (0, import_jsx_runtime5.jsx)(Text, { align: "right", nowrap: true, children: `${T("receipt.date")}: ${dateTime}` })
    ] }),
    /* @__PURE__ */ (0, import_jsx_runtime5.jsxs)(import_antd5.Flex, { justify: "space-between", children: [
      /* @__PURE__ */ (0, import_jsx_runtime5.jsx)(Text, { children: `${T("receipt.staff")}: ${stripDiacritics(transaction.cashier)}` }),
      /* @__PURE__ */ (0, import_jsx_runtime5.jsx)(Text, { align: "right", nowrap: true, children: `${T("receipt.invoiceNo")}: ${transaction.invoiceNo ?? ""}` })
    ] }),
    /* @__PURE__ */ (0, import_jsx_runtime5.jsx)(CharLine, {}),
    totals.lines.map((line) => /* @__PURE__ */ (0, import_jsx_runtime5.jsxs)(import_antd5.Flex, { vertical: true, className: "mb-0.5", children: [
      /* @__PURE__ */ (0, import_jsx_runtime5.jsx)(
        Cells,
        {
          cells: [
            { text: line.barcode ?? "", width: s * 8.6 },
            { text: stripDiacritics(line.title), flex: 1 }
          ]
        }
      ),
      /* @__PURE__ */ (0, import_jsx_runtime5.jsx)(
        Cells,
        {
          cells: [
            { text: `VAT${tax.vatRate}%`, width: s * 4 },
            { text: line.quantity, width: s * 2, align: "right" },
            { text: money2(line.unitPrice), flex: 1, align: "right" },
            { text: money2(line.lineTotal), flex: 1, align: "right" }
          ]
        }
      )
    ] }, line.index)),
    /* @__PURE__ */ (0, import_jsx_runtime5.jsx)(CharLine, { char: "=" }),
    /* @__PURE__ */ (0, import_jsx_runtime5.jsx)(KeyValue, { label: `${T("receipt.totalQuantity")}:`, value: totals.totalQuantity }),
    /* @__PURE__ */ (0, import_jsx_runtime5.jsx)(KeyValue, { label: `${T("receipt.totalAmount")}:`, value: money2(totals.grandTotal), bold: true }),
    /* @__PURE__ */ (0, import_jsx_runtime5.jsx)(Text, { children: `${T("receipt.paymentMethod")}:` }),
    /* @__PURE__ */ (0, import_jsx_runtime5.jsx)(
      KeyValue,
      {
        label: `${stripDiacritics(transaction.paymentMethod) || T("receipt.cash")}:`,
        value: money2(totals.amountPaid)
      }
    ),
    /* @__PURE__ */ (0, import_jsx_runtime5.jsx)(
      KeyValue,
      {
        label: `${T("receipt.vatIncludedRate", { rate: tax.vatRate })}:`,
        value: money2(totals.vatAmount)
      }
    ),
    /* @__PURE__ */ (0, import_jsx_runtime5.jsx)(CharLine, { char: "=" }),
    /* @__PURE__ */ (0, import_jsx_runtime5.jsx)(Text, { bold: true, children: `${T("receipt.loyalty").toUpperCase()}:` }),
    /* @__PURE__ */ (0, import_jsx_runtime5.jsxs)(import_antd5.Flex, { vertical: true, className: "pl-6", children: [
      /* @__PURE__ */ (0, import_jsx_runtime5.jsx)(Text, { children: `${T("receipt.memberCode").padEnd(11)}: ${transaction.memberCode ?? ""}` }),
      /* @__PURE__ */ (0, import_jsx_runtime5.jsx)(Text, { children: `${T("receipt.fullName").padEnd(11)}: ${(transaction.customerName ?? "").toUpperCase()}` })
    ] }),
    /* @__PURE__ */ (0, import_jsx_runtime5.jsx)(CharLine, { char: "=" }),
    /* @__PURE__ */ (0, import_jsx_runtime5.jsx)(Text, { align: "center", children: stripDiacritics(data.footerNote) }),
    display.showBarcode !== false ? /* @__PURE__ */ (0, import_jsx_runtime5.jsxs)(import_antd5.Flex, { vertical: true, align: "center", className: "mt-1", children: [
      /* @__PURE__ */ (0, import_jsx_runtime5.jsx)(PrintImage, { src: codes.barcodeDataUrl, width: Math.round(s * 22), height: s * 3.5 }),
      /* @__PURE__ */ (0, import_jsx_runtime5.jsx)(Text, { align: "center", children: codes.barcodeValue })
    ] }) : null,
    /* @__PURE__ */ (0, import_jsx_runtime5.jsx)(Text, { children: `${T("receipt.transactionCode")}: ${codes.barcodeValue} ${dateTime.slice(
      11,
      16
    )}` }),
    display.showQr ? /* @__PURE__ */ (0, import_jsx_runtime5.jsx)(import_antd5.Flex, { justify: "center", className: "mt-2", children: /* @__PURE__ */ (0, import_jsx_runtime5.jsx)(PrintImage, { src: codes.qrDataUrl, width: s * 6 }) }) : null
  ] });
};
var coopmartTemplate = {
  id: "coopmart",
  name: "Co.opmart layout",
  description: "Co-op supermarket, barcode-first lines with \u0111 amounts, loyalty block",
  printerStyle: "Courier-style slab mono",
  component: Coopmart,
  fontId: "ibm-plex-mono" /* ibmPlexMono */,
  fontSize: 14,
  paperWidth: PAPER_WIDTH.mm80 - 96,
  catalogAccounts: ["co.op", "coop"],
  fields: [
    "store.branch",
    "store.address",
    "store.phone",
    "store.hotline",
    "store.taxCode",
    "store.website",
    "store.slogan",
    "transaction.invoiceNo",
    "transaction.posNo",
    "transaction.cashier",
    "transaction.paymentMethod",
    "transaction.amountPaid",
    "transaction.customerName",
    "transaction.memberCode",
    "item.barcode",
    "footerNote"
  ],
  defaults: {
    store: {
      name: "LuaVang coop",
      slogan: "b\u1EA1n c\u1EE7a m\u1ECDi nh\xE0",
      branch: "L\xFAa V\xE0ng Co-op T\xE2n Ph\xFA",
      address: "02 Tr\u01B0\u1EDDng Chinh, P. T\xE2y Th\u1EA1nh, Q. T\xE2n Ph\xFA, TP.HCM",
      phone: "(028)30000000",
      hotline: "1900000000",
      taxCode: "0100000004",
      website: "www.luavangcoop.example.com",
      /** Default logo image src for this template; empty → text wordmark */
      logoUrl: "",
      showLogo: true,
      logoAlign: "center"
    },
    transaction: {
      invoiceNo: "77870",
      posNo: "10",
      cashier: "57033569-Dung",
      paymentMethod: "MOMO",
      memberCode: "4646426353656",
      customerName: "Mai Th\u1ECB Ho\xE0ng"
    },
    footerNote: "Cam on Quy khach - Hen gap lai",
    tax: { vatRate: 8 }
  }
};

// src/components/Bills/templates/Emart/index.tsx
var import_antd6 = require("antd");
var import_jsx_runtime6 = require("react/jsx-runtime");
var Emart = ({ data, totals, codes, font, t }) => {
  const { store, transaction, display, tax } = data;
  const s = font.size;
  const vatCode = `VAT${String(tax.vatRate).padStart(2, "0")}`;
  return /* @__PURE__ */ (0, import_jsx_runtime6.jsxs)(import_antd6.Flex, { vertical: true, children: [
    /* @__PURE__ */ (0, import_jsx_runtime6.jsxs)(import_antd6.Flex, { align: "center", gap: 8, children: [
      /* @__PURE__ */ (0, import_jsx_runtime6.jsx)(
        Logo,
        {
          inline: true,
          store: { ...store, logoWidth: store.logoWidth ?? 130 },
          defaultAlign: "left",
          fallback: /* @__PURE__ */ (0, import_jsx_runtime6.jsx)(Wordmark, { text: store.name, size: s * 1.9 })
        }
      ),
      /* @__PURE__ */ (0, import_jsx_runtime6.jsxs)(import_antd6.Flex, { vertical: true, flex: 1, className: "border-0 border-l border-solid border-[#1c1c1c] pl-2", children: [
        /* @__PURE__ */ (0, import_jsx_runtime6.jsx)(Text, { size: s * 0.7, bold: true, children: store.branch ?? "" }),
        /* @__PURE__ */ (0, import_jsx_runtime6.jsx)(Text, { size: s * 0.7, bold: true, children: `${t("receipt.phoneFull")}: ${store.phone ?? ""}` }),
        /* @__PURE__ */ (0, import_jsx_runtime6.jsx)(Text, { size: s * 0.7, bold: true, children: `${t("receipt.taxCode")}: ${store.taxCode ?? ""}` })
      ] })
    ] }),
    /* @__PURE__ */ (0, import_jsx_runtime6.jsx)(Spacer, { size: 10 }),
    /* @__PURE__ */ (0, import_jsx_runtime6.jsx)(Text, { children: store.address ?? "" }),
    /* @__PURE__ */ (0, import_jsx_runtime6.jsx)(Text, { children: store.slogan ?? "" }),
    /* @__PURE__ */ (0, import_jsx_runtime6.jsx)(Spacer, { size: 10 }),
    /* @__PURE__ */ (0, import_jsx_runtime6.jsx)(Text, { children: `${transaction.invoiceNo ?? ""}  ${formatDateTime(
      transaction.dateTime,
      "DD-MM-YYYY HH:mm"
    )}  POS:${transaction.posNo ?? ""}` }),
    /* @__PURE__ */ (0, import_jsx_runtime6.jsx)(RuleLine, { dashed: true }),
    /* @__PURE__ */ (0, import_jsx_runtime6.jsx)(
      Cells,
      {
        cells: [
          { text: t("receipt.productNameLong"), flex: 3 },
          { text: t("receipt.unitPrice"), flex: 2, align: "right" },
          { text: t("receipt.qty"), width: s * 2.5, align: "right" },
          { text: t("receipt.money"), flex: 2, align: "right" }
        ]
      }
    ),
    /* @__PURE__ */ (0, import_jsx_runtime6.jsx)(RuleLine, { dashed: true }),
    totals.lines.map((line) => /* @__PURE__ */ (0, import_jsx_runtime6.jsxs)(import_antd6.Flex, { vertical: true, children: [
      /* @__PURE__ */ (0, import_jsx_runtime6.jsx)(Text, { children: `${String(line.index + 1).padStart(
        2,
        "0"
      )}) ${vatCode}  ${line.title.toUpperCase()}` }),
      /* @__PURE__ */ (0, import_jsx_runtime6.jsx)(
        Cells,
        {
          cells: [
            { text: line.barcode ?? "", flex: 3 },
            { text: formatMoney(line.unitPrice), flex: 2, align: "right" },
            { text: line.quantity, width: s * 2.5, align: "right" },
            { text: formatMoney(line.lineTotal), flex: 2, align: "right" }
          ]
        }
      )
    ] }, line.index)),
    /* @__PURE__ */ (0, import_jsx_runtime6.jsx)(RuleLine, { dashed: true }),
    /* @__PURE__ */ (0, import_jsx_runtime6.jsx)(KeyValue, { label: t("receipt.subtotal"), value: formatMoney(totals.grossAmount) }),
    /* @__PURE__ */ (0, import_jsx_runtime6.jsxs)(import_antd6.Flex, { justify: "space-between", children: [
      /* @__PURE__ */ (0, import_jsx_runtime6.jsx)(PrintScale, { fontSize: s, children: /* @__PURE__ */ (0, import_jsx_runtime6.jsx)(Text, { children: t("receipt.amountToReceive") }) }),
      /* @__PURE__ */ (0, import_jsx_runtime6.jsx)(PrintScale, { fontSize: s, align: "right", children: /* @__PURE__ */ (0, import_jsx_runtime6.jsx)(Text, { children: formatMoney(totals.grandTotal) }) })
    ] }),
    /* @__PURE__ */ (0, import_jsx_runtime6.jsx)(RuleLine, {}),
    /* @__PURE__ */ (0, import_jsx_runtime6.jsx)(
      KeyValue,
      {
        label: transaction.paymentMethod || t("receipt.cash"),
        value: formatMoney(totals.amountPaid)
      }
    ),
    /* @__PURE__ */ (0, import_jsx_runtime6.jsx)(KeyValue, { label: t("receipt.change"), value: formatMoney(totals.change) }),
    /* @__PURE__ */ (0, import_jsx_runtime6.jsx)(RuleLine, {}),
    /* @__PURE__ */ (0, import_jsx_runtime6.jsx)(KeyValue, { label: t("receipt.taxable"), value: formatMoney(totals.preTaxAmount) }),
    /* @__PURE__ */ (0, import_jsx_runtime6.jsx)(KeyValue, { label: t("receipt.vatAmount"), value: formatMoney(totals.vatAmount) }),
    /* @__PURE__ */ (0, import_jsx_runtime6.jsx)(RuleLine, {}),
    /* @__PURE__ */ (0, import_jsx_runtime6.jsx)(KeyValue, { label: t("receipt.totalTax"), value: formatMoney(totals.vatAmount) }),
    /* @__PURE__ */ (0, import_jsx_runtime6.jsx)(KeyValue, { label: vatCode, value: `(${formatMoney(totals.vatAmount)})` }),
    /* @__PURE__ */ (0, import_jsx_runtime6.jsx)(Spacer, { size: 8 }),
    /* @__PURE__ */ (0, import_jsx_runtime6.jsx)(Text, { align: "center", children: t("receipt.pointSave") }),
    /* @__PURE__ */ (0, import_jsx_runtime6.jsx)(KeyValue, { label: `${t("receipt.cardNo")}:`, value: transaction.memberCode ?? "" }),
    /* @__PURE__ */ (0, import_jsx_runtime6.jsx)(
      KeyValue,
      {
        label: `${t("receipt.cardHolder")}:`,
        value: (transaction.customerName ?? "").toUpperCase()
      }
    ),
    /* @__PURE__ */ (0, import_jsx_runtime6.jsx)(RuleLine, { dashed: true }),
    /* @__PURE__ */ (0, import_jsx_runtime6.jsx)(Text, { children: `${t("receipt.totalItems")} : ${totals.totalQuantity}` }),
    /* @__PURE__ */ (0, import_jsx_runtime6.jsx)(Text, { children: `NO:${transaction.posNo ?? ""} ${t("receipt.cashier")}:${transaction.cashier ?? ""}` }),
    /* @__PURE__ */ (0, import_jsx_runtime6.jsx)(Spacer, { size: 8 }),
    /* @__PURE__ */ (0, import_jsx_runtime6.jsx)(Text, { children: data.footerNote ?? "" }),
    display.showBarcode !== false ? /* @__PURE__ */ (0, import_jsx_runtime6.jsxs)(import_antd6.Flex, { vertical: true, align: "center", className: "mt-2", children: [
      /* @__PURE__ */ (0, import_jsx_runtime6.jsx)(PrintImage, { src: codes.barcodeDataUrl, width: Math.round(s * 18), height: s * 2 }),
      /* @__PURE__ */ (0, import_jsx_runtime6.jsx)(Text, { align: "center", children: codes.barcodeValue })
    ] }) : null,
    display.showQr ? /* @__PURE__ */ (0, import_jsx_runtime6.jsx)(import_antd6.Flex, { justify: "center", className: "mt-2", children: /* @__PURE__ */ (0, import_jsx_runtime6.jsx)(PrintImage, { src: codes.qrDataUrl, width: s * 6 }) }) : null
  ] });
};
var emartTemplate = {
  id: "emart",
  name: "Emart layout",
  description: "Hypermarket, numbered VAT-coded lines, double-height amount due, point save",
  printerStyle: "Tall condensed sans",
  component: Emart,
  fontId: "roboto-condensed" /* robotoCondensed */,
  fontSize: 16,
  paperWidth: PAPER_WIDTH.mm58 + 16,
  catalogAccounts: ["emart"],
  fields: [
    "store.branch",
    "store.address",
    "store.phone",
    "store.taxCode",
    "store.slogan",
    "transaction.invoiceNo",
    "transaction.posNo",
    "transaction.cashier",
    "transaction.paymentMethod",
    "transaction.amountPaid",
    "transaction.customerName",
    "transaction.memberCode",
    "item.barcode",
    "footerNote"
  ],
  defaults: {
    store: {
      name: "benthanh",
      branch: "B\u1EBFn Th\xE0nh Mart G\xF2 V\u1EA5p",
      address: "100 Phan V\u0103n Tr\u1ECB, P5, Q G\xF2 V\u1EA5p, TPHCM",
      phone: "(028) 300 00000",
      taxCode: "0100000005",
      slogan: "Ho\u1EA1t \u0111\u1ED9ng t\u1EEB :7h30 - 22h30",
      /** Default logo image src for this template; empty → text wordmark */
      logoUrl: "",
      showLogo: true
    },
    transaction: {
      invoiceNo: "01001",
      posNo: "0026-0188",
      cashier: "2200057(Nguyen Thu Tuyet)",
      paymentMethod: "Th\u1EBB t\xEDn d\u1EE5ng:VISA",
      memberCode: "8479********6748",
      customerName: "T\u1EA1 Ph\u01B0\u01A1ng Th\u1EA3o"
    },
    footerNote: "L\u01AFU \xDD: Phi\u1EBFu n\xE0y ch\u1EC9 c\xF3 gi\xE1 tr\u1ECB xu\u1EA5t\nh\xF3a \u0111\u01A1n trong ng\xE0y\nXIN CAM ON QUY KHACH\nH\u1EB8N G\u1EB6P L\u1EA0I",
    tax: { vatRate: 8 }
  }
};

// src/components/Bills/templates/FamilyMart/index.tsx
var import_antd7 = require("antd");
var import_jsx_runtime7 = require("react/jsx-runtime");
var FamilyMart = ({ data, totals, codes, font, t }) => {
  const { store, transaction, display } = data;
  const s = font.size;
  const dateTime = formatDateTime(transaction.dateTime, "DD/MM/YYYY HH:mm");
  return /* @__PURE__ */ (0, import_jsx_runtime7.jsxs)(import_antd7.Flex, { vertical: true, children: [
    /* @__PURE__ */ (0, import_jsx_runtime7.jsx)(
      Logo,
      {
        store,
        fallback: /* @__PURE__ */ (0, import_jsx_runtime7.jsx)(Wordmark, { text: store.name, size: s * 2, letterSpacing: 0 })
      }
    ),
    /* @__PURE__ */ (0, import_jsx_runtime7.jsxs)(import_antd7.Flex, { vertical: true, align: "center", children: [
      /* @__PURE__ */ (0, import_jsx_runtime7.jsx)(Text, { align: "center", children: store.address ?? "" }),
      /* @__PURE__ */ (0, import_jsx_runtime7.jsx)(Text, { align: "center", children: `${t("receipt.tel")}: ${store.phone ?? ""}` }),
      /* @__PURE__ */ (0, import_jsx_runtime7.jsx)(Text, { align: "center", bold: true, className: "mt-1", children: t("receipt.salesInvoice").toUpperCase() }),
      /* @__PURE__ */ (0, import_jsx_runtime7.jsx)(Text, { align: "center", bold: true, size: s * 1.1, children: `${t("receipt.invoiceNo")}: ${transaction.invoiceNo ?? ""}` })
    ] }),
    /* @__PURE__ */ (0, import_jsx_runtime7.jsx)(
      Cells,
      {
        className: "mt-2",
        cells: [
          { text: t("receipt.productName"), flex: 4, bold: true },
          { text: t("receipt.qty"), flex: 1, align: "center", bold: true },
          { text: t("receipt.unitPrice"), flex: 2, align: "right", bold: true },
          { text: t("receipt.amount"), flex: 2, align: "right", bold: true }
        ]
      }
    ),
    /* @__PURE__ */ (0, import_jsx_runtime7.jsx)(RuleLine, { dashed: true }),
    totals.lines.map((line) => /* @__PURE__ */ (0, import_jsx_runtime7.jsx)(
      Cells,
      {
        size: s * 0.85,
        cells: [
          { text: line.title, flex: 4 },
          { text: line.quantity, flex: 1, align: "center" },
          { text: formatMoney(line.unitPrice), flex: 2, align: "right" },
          { text: formatMoney(line.lineTotal), flex: 2, align: "right" }
        ]
      },
      line.index
    )),
    /* @__PURE__ */ (0, import_jsx_runtime7.jsx)(RuleLine, { dashed: true }),
    /* @__PURE__ */ (0, import_jsx_runtime7.jsx)(
      Cells,
      {
        size: s * 1.1,
        cells: [
          { text: `${t("receipt.totalQtyTotal")}:`, flex: 4, bold: true },
          { text: totals.totalQuantity, flex: 1, align: "center" },
          { text: formatMoney(totals.grandTotal), flex: 3, align: "right" }
        ]
      }
    ),
    /* @__PURE__ */ (0, import_jsx_runtime7.jsx)(
      Cells,
      {
        size: s * 1.1,
        cells: [
          { text: `${t("receipt.customerPaid")}:`, flex: 4, bold: true },
          { text: transaction.paymentMethod ?? "", flex: 2, align: "center" },
          { text: formatMoney(totals.amountPaid), flex: 2, align: "right" }
        ]
      }
    ),
    /* @__PURE__ */ (0, import_jsx_runtime7.jsx)(Text, { size: s * 0.85, children: t("receipt.vatIncludedAmount", {
      rate: data.tax.vatRate,
      amount: formatMoney(totals.vatAmount)
    }) }),
    /* @__PURE__ */ (0, import_jsx_runtime7.jsx)(RuleLine, { dashed: true }),
    /* @__PURE__ */ (0, import_jsx_runtime7.jsxs)(import_antd7.Flex, { gap: 8, align: "center", children: [
      /* @__PURE__ */ (0, import_jsx_runtime7.jsxs)(import_antd7.Flex, { vertical: true, flex: 1, children: [
        /* @__PURE__ */ (0, import_jsx_runtime7.jsx)(Text, { bold: true, size: s * 1.1, children: t("receipt.thanksShort") }),
        /* @__PURE__ */ (0, import_jsx_runtime7.jsx)(Text, { children: `${t("receipt.cashier")}: ${(transaction.cashier ?? "").toUpperCase()}` }),
        /* @__PURE__ */ (0, import_jsx_runtime7.jsx)(Text, { children: t("receipt.dateTimeLine", { date: dateTime.slice(0, 10), time: dateTime.slice(11) }) }),
        /* @__PURE__ */ (0, import_jsx_runtime7.jsx)(Text, { children: `POS: ${transaction.posNo ?? ""}` })
      ] }),
      display.showQr !== false ? /* @__PURE__ */ (0, import_jsx_runtime7.jsx)(import_antd7.Flex, { className: "shrink-0 border border-solid border-[#1c1c1c] p-1", children: /* @__PURE__ */ (0, import_jsx_runtime7.jsx)(PrintImage, { src: codes.qrDataUrl, width: s * 5.5 }) }) : null
    ] }),
    /* @__PURE__ */ (0, import_jsx_runtime7.jsx)(RuleLine, { dashed: true }),
    /* @__PURE__ */ (0, import_jsx_runtime7.jsx)(Text, { size: s * 0.75, children: data.footerNote ?? "" }),
    display.showBarcode !== false ? /* @__PURE__ */ (0, import_jsx_runtime7.jsx)(import_antd7.Flex, { justify: "center", className: "mt-2", children: /* @__PURE__ */ (0, import_jsx_runtime7.jsx)(PrintImage, { src: codes.barcodeDataUrl, width: Math.round(s * 20), height: s * 2.2 }) }) : null
  ] });
};
var familyMartTemplate = {
  id: "familymart",
  name: "FamilyMart / GS25 layout",
  description: "Convenience store in Times, thank-you box with QR, bilingual invoice note",
  printerStyle: "Times New Roman",
  component: FamilyMart,
  fontId: "tinos" /* tinos */,
  fontSize: 16,
  paperWidth: PAPER_WIDTH.mm58 + 16,
  catalogAccounts: ["familymart", "gs25"],
  fields: [
    "store.address",
    "store.phone",
    "transaction.invoiceNo",
    "transaction.posNo",
    "transaction.cashier",
    "transaction.paymentMethod",
    "transaction.amountPaid",
    "footerNote"
  ],
  defaults: {
    store: {
      name: "Ng\xF4iSao 24h",
      address: "B20 B\u1EA1ch \u0110\u1EB1ng, P T\xE2n S\u01A1n H\xF2a, TP HCM",
      phone: "028 0000 0000",
      /** Default logo image src for this template; empty → text wordmark */
      logoUrl: "",
      showLogo: true,
      logoAlign: "center"
    },
    transaction: {
      invoiceNo: "2026010340UhzgwedRhi",
      posNo: "POS01",
      cashier: "Nguy\u1EC5n Th\u1ECB Di\u1EC5m",
      paymentMethod: "MOMO"
    },
    footerNote: "Xu\u1EA5t h\xF3a \u0111\u01A1n: Qu\xE9t QR ho\u1EB7c truy c\u1EADp https://portal.example.com/xuat-hoa-don\nY\xEAu c\u1EA7u xu\u1EA5t h\xF3a \u0111\u01A1n VAT ch\u1EC9 nh\u1EADn trong 120 ph\xFAt sau khi mua h\xE0ng\nInvoice issuing: Scan QR or visit https://portal.example.com\nRequest VAT invoice within 120 minutes of purchase"
  }
};

// src/components/Bills/templates/FarmersMarket/index.tsx
var import_antd8 = require("antd");
var import_jsx_runtime8 = require("react/jsx-runtime");
var FarmersMarket = ({ data, totals, codes, font, t }) => {
  const { store, transaction, display } = data;
  const s = font.size;
  const dateTime = formatDateTime(transaction.dateTime, "DD/MM/YYYY HH:mm:ss");
  return /* @__PURE__ */ (0, import_jsx_runtime8.jsxs)(import_antd8.Flex, { vertical: true, children: [
    /* @__PURE__ */ (0, import_jsx_runtime8.jsxs)(import_antd8.Flex, { justify: "space-between", align: "flex-start", gap: 12, children: [
      /* @__PURE__ */ (0, import_jsx_runtime8.jsx)(
        Logo,
        {
          inline: true,
          store: { ...store, logoWidth: store.logoWidth ?? 110 },
          defaultAlign: "left",
          fallback: /* @__PURE__ */ (0, import_jsx_runtime8.jsx)(Wordmark, { text: store.name, size: s * 1.2, letterSpacing: 0 })
        }
      ),
      /* @__PURE__ */ (0, import_jsx_runtime8.jsx)(Text, { align: "right", size: s * 0.8, flex: 1, children: store.address ?? "" })
    ] }),
    /* @__PURE__ */ (0, import_jsx_runtime8.jsx)(Text, { align: "center", bold: true, size: s * 1.15, className: "mt-2", children: t("receipt.purchaseSlip").toUpperCase() }),
    /* @__PURE__ */ (0, import_jsx_runtime8.jsxs)(import_antd8.Flex, { justify: "space-between", className: "mt-1", children: [
      /* @__PURE__ */ (0, import_jsx_runtime8.jsx)(Text, { size: s * 0.85, children: `${t("receipt.saleDate")}: ${dateTime}` }),
      /* @__PURE__ */ (0, import_jsx_runtime8.jsx)(Text, { size: s * 0.85, align: "right", children: `${t("receipt.printDate")}: ${dateTime}` })
    ] }),
    /* @__PURE__ */ (0, import_jsx_runtime8.jsx)(Text, { size: s * 0.85, children: `${t("receipt.memberName")}: ${transaction.customerName || t("receipt.walkIn")}` }),
    /* @__PURE__ */ (0, import_jsx_runtime8.jsx)(Text, { size: s * 0.85, children: `${t("receipt.memberCard")}: ${transaction.memberCode ?? ""}` }),
    /* @__PURE__ */ (0, import_jsx_runtime8.jsx)(Text, { size: s * 0.85, children: `${t("receipt.cashier")}: ${transaction.cashier ?? ""}` }),
    /* @__PURE__ */ (0, import_jsx_runtime8.jsx)(
      Cells,
      {
        className: "mt-2",
        cells: [
          { text: t("receipt.price"), flex: 2, align: "center", bold: true },
          { text: t("receipt.quantity"), flex: 2, align: "center", bold: true },
          { text: t("receipt.amount"), flex: 2, align: "right", bold: true }
        ]
      }
    ),
    /* @__PURE__ */ (0, import_jsx_runtime8.jsx)(RuleLine, { dashed: true }),
    totals.lines.map((line) => /* @__PURE__ */ (0, import_jsx_runtime8.jsxs)(import_antd8.Flex, { vertical: true, className: "mb-1", children: [
      /* @__PURE__ */ (0, import_jsx_runtime8.jsx)(Text, { size: s * 0.85, children: `${line.title}${line.barcode ? ` (${line.barcode})` : ""}` }),
      /* @__PURE__ */ (0, import_jsx_runtime8.jsx)(
        Cells,
        {
          cells: [
            { text: formatMoney(line.unitPrice), flex: 2, align: "center" },
            { text: line.quantity, flex: 2, align: "center" },
            { text: formatMoney(line.unitPrice * line.quantity), flex: 2, align: "right" }
          ]
        }
      ),
      line.discount ? /* @__PURE__ */ (0, import_jsx_runtime8.jsx)(Text, { align: "right", children: `- ${formatMoney(line.discount)}` }) : null
    ] }, line.index)),
    /* @__PURE__ */ (0, import_jsx_runtime8.jsx)(RuleLine, { dashed: true }),
    /* @__PURE__ */ (0, import_jsx_runtime8.jsx)(
      KeyValue,
      {
        label: `${t("receipt.totalBeforeDiscount")}:`,
        value: formatMoney(totals.grossAmount)
      }
    ),
    /* @__PURE__ */ (0, import_jsx_runtime8.jsx)(
      KeyValue,
      {
        label: `${t("receipt.totalDiscountShort")}:`,
        value: `${totals.totalDiscount ? "- " : ""}${formatMoney(totals.totalDiscount)}`
      }
    ),
    /* @__PURE__ */ (0, import_jsx_runtime8.jsx)(KeyValue, { label: `${t("receipt.amountDue")}:`, value: formatMoney(totals.grandTotal), bold: true }),
    /* @__PURE__ */ (0, import_jsx_runtime8.jsx)(Text, { size: s * 0.8, children: t("receipt.vatIncludedAmount", {
      rate: data.tax.vatRate,
      amount: formatMoney(totals.vatAmount)
    }) }),
    /* @__PURE__ */ (0, import_jsx_runtime8.jsx)(Spacer, { size: 10 }),
    /* @__PURE__ */ (0, import_jsx_runtime8.jsx)(Text, { bold: true, size: s * 1.1, children: t("receipt.paymentMethod") }),
    /* @__PURE__ */ (0, import_jsx_runtime8.jsx)(
      KeyValue,
      {
        label: transaction.paymentMethod || t("receipt.cash"),
        value: formatMoney(totals.amountPaid)
      }
    ),
    /* @__PURE__ */ (0, import_jsx_runtime8.jsx)(Spacer, { size: 8 }),
    /* @__PURE__ */ (0, import_jsx_runtime8.jsx)(
      KeyValue,
      {
        label: `${t("receipt.amountReceived")}:`,
        value: formatMoney(totals.amountPaid),
        bold: true
      }
    ),
    /* @__PURE__ */ (0, import_jsx_runtime8.jsx)(KeyValue, { label: `${t("receipt.changeShort")}:`, value: formatMoney(totals.change), bold: true }),
    /* @__PURE__ */ (0, import_jsx_runtime8.jsx)(Spacer, { size: 10 }),
    /* @__PURE__ */ (0, import_jsx_runtime8.jsxs)(import_antd8.Flex, { gap: 8, align: "center", children: [
      /* @__PURE__ */ (0, import_jsx_runtime8.jsx)(Text, { size: s * 0.8, flex: 1, children: t("receipt.scanQrInvoiceSite", { site: store.website ?? "" }) }),
      display.showQr !== false ? /* @__PURE__ */ (0, import_jsx_runtime8.jsx)(PrintImage, { src: codes.qrDataUrl, width: s * 6 }) : null
    ] }),
    /* @__PURE__ */ (0, import_jsx_runtime8.jsx)(RuleLine, { dashed: true }),
    /* @__PURE__ */ (0, import_jsx_runtime8.jsx)(Text, { align: "center", size: s * 0.85, children: `${t("receipt.feedbackHotline")}: ${store.hotline ?? ""}` }),
    /* @__PURE__ */ (0, import_jsx_runtime8.jsx)(Spacer, { size: 6 }),
    /* @__PURE__ */ (0, import_jsx_runtime8.jsx)(Text, { size: s * 0.8, children: data.footerNote ?? "" }),
    display.showBarcode !== false ? /* @__PURE__ */ (0, import_jsx_runtime8.jsxs)(import_antd8.Flex, { vertical: true, align: "center", className: "mt-2", children: [
      /* @__PURE__ */ (0, import_jsx_runtime8.jsx)(PrintImage, { src: codes.barcodeDataUrl, width: Math.round(s * 13), height: s * 2.2 }),
      /* @__PURE__ */ (0, import_jsx_runtime8.jsx)(Text, { size: s * 0.7, align: "center", children: codes.barcodeValue })
    ] }) : null
  ] });
};
var farmersMarketTemplate = {
  id: "farmers-market",
  name: "Farmers Market layout",
  description: "Fresh market, member block, per-line discounts, payment section, policy text",
  printerStyle: "Segoe UI-like sans",
  component: FarmersMarket,
  fontId: "open-sans" /* openSans */,
  fontSize: 15,
  paperWidth: PAPER_WIDTH.mm58 + 32,
  catalogAccounts: ["farmers"],
  fields: [
    "store.address",
    "store.hotline",
    "store.website",
    "transaction.cashier",
    "transaction.paymentMethod",
    "transaction.amountPaid",
    "transaction.customerName",
    "transaction.memberCode",
    "item.barcode",
    "item.discount",
    "footerNote"
  ],
  defaults: {
    store: {
      name: "N\xF4ng Tr\u1EA1i Fresh",
      address: "513 S\u01B0 V\u1EA1n H\u1EA1nh, Ph\u01B0\u1EDDng H\xF2a H\u01B0ng, TP.HCM",
      hotline: "1800 0000",
      website: "einvoice.nongtrai.example.com",
      /** Default logo image src for this template; empty → text wordmark */
      logoUrl: "",
      showLogo: true
    },
    transaction: {
      cashier: "E6952 - L\xFD Kh\xE1nh Ph\u01B0\u01A1ng",
      paymentMethod: "C\xE0 th\u1EBB",
      memberCode: "C9999999"
    },
    footerNote: "Ch\xEDnh s\xE1ch b\u1EA3o h\xE0nh/ \u0111\u1ED5i tr\u1EA3 s\u1EA3n ph\u1EA9m:\n- H\xE0ng h\xF3a b\u1ECB r\xE1ch bao b\xEC/ h\u01B0 h\u1ECFng trong qu\xE1 tr\xECnh giao\n- H\xE0ng h\xF3a h\u1EBFt h\u1EA1n s\u1EED d\u1EE5ng/ l\u1ED7i do nh\xE0 s\u1EA3n xu\u1EA5t\nVui l\xF2ng gi\u1EEF phi\u1EBFu t\xEDnh ti\u1EC1n \u0111\u1EC3 \u0111\u1ED5i tr\u1EA3 s\u1EA3n ph\u1EA9m trong 24h.\nC\u1EA3m \u01A1n \u0111\xE3 l\u1EF1a ch\u1ECDn mua s\u1EAFm t\u1EA1i N\xF4ng Tr\u1EA1i Fresh!"
  }
};

// src/components/Bills/templates/GoTops/index.tsx
var import_antd9 = require("antd");
var import_jsx_runtime9 = require("react/jsx-runtime");
var GoTops = ({ data, totals, codes, font, t }) => {
  const { store, transaction, display, tax } = data;
  const s = font.size;
  const dateTime = formatDateTime(transaction.dateTime, "DD/MM/YYYY HH:mm:ss");
  return /* @__PURE__ */ (0, import_jsx_runtime9.jsxs)(import_antd9.Flex, { vertical: true, children: [
    /* @__PURE__ */ (0, import_jsx_runtime9.jsx)(Logo, { store, fallback: /* @__PURE__ */ (0, import_jsx_runtime9.jsx)(Wordmark, { text: store.name, size: s * 2, variant: "boxed" }) }),
    /* @__PURE__ */ (0, import_jsx_runtime9.jsxs)(import_antd9.Flex, { vertical: true, align: "center", children: [
      /* @__PURE__ */ (0, import_jsx_runtime9.jsx)(Text, { align: "center", children: store.name }),
      /* @__PURE__ */ (0, import_jsx_runtime9.jsx)(Text, { align: "center", children: store.legalName ?? "" }),
      /* @__PURE__ */ (0, import_jsx_runtime9.jsx)(Text, { align: "center", children: store.address ?? "" }),
      /* @__PURE__ */ (0, import_jsx_runtime9.jsx)(Text, { align: "center", children: `${t("receipt.taxCode")}: ${store.taxCode ?? ""}` }),
      /* @__PURE__ */ (0, import_jsx_runtime9.jsx)(Text, { align: "center", children: `${t("receipt.phoneLong")}: ${store.phone ?? ""}` }),
      /* @__PURE__ */ (0, import_jsx_runtime9.jsx)(Text, { align: "center", children: `Hotline: ${store.hotline ?? ""}` }),
      /* @__PURE__ */ (0, import_jsx_runtime9.jsx)(Text, { align: "center", children: t("receipt.bill").toUpperCase() })
    ] }),
    /* @__PURE__ */ (0, import_jsx_runtime9.jsxs)(import_antd9.Flex, { justify: "space-between", children: [
      /* @__PURE__ */ (0, import_jsx_runtime9.jsx)(Text, { children: t("receipt.description") }),
      /* @__PURE__ */ (0, import_jsx_runtime9.jsx)(Text, { align: "right", children: "VAT" })
    ] }),
    /* @__PURE__ */ (0, import_jsx_runtime9.jsx)(CharLine, {}),
    totals.lines.map((line) => /* @__PURE__ */ (0, import_jsx_runtime9.jsxs)(import_antd9.Flex, { vertical: true, children: [
      /* @__PURE__ */ (0, import_jsx_runtime9.jsxs)(import_antd9.Flex, { justify: "space-between", children: [
        /* @__PURE__ */ (0, import_jsx_runtime9.jsx)(Text, { flex: 1, children: line.title.toUpperCase() }),
        /* @__PURE__ */ (0, import_jsx_runtime9.jsx)(Text, { align: "right", nowrap: true, children: String(tax.vatRate) })
      ] }),
      /* @__PURE__ */ (0, import_jsx_runtime9.jsx)(
        Cells,
        {
          cells: [
            { text: line.quantity, width: s * 2.5, align: "right" },
            { text: `${line.unit || t("receipt.unitDefault")}  x`, width: s * 5, align: "right" },
            { text: formatMoney(line.unitPrice), flex: 1, align: "right" },
            { text: formatMoney(line.lineTotal), flex: 1, align: "right" }
          ]
        }
      )
    ] }, line.index)),
    /* @__PURE__ */ (0, import_jsx_runtime9.jsx)(CharLine, {}),
    /* @__PURE__ */ (0, import_jsx_runtime9.jsxs)(import_antd9.Flex, { justify: "space-between", align: "flex-start", children: [
      /* @__PURE__ */ (0, import_jsx_runtime9.jsx)(PrintScale, { fontSize: s, children: /* @__PURE__ */ (0, import_jsx_runtime9.jsx)(Text, { children: t("receipt.total").toUpperCase() }) }),
      /* @__PURE__ */ (0, import_jsx_runtime9.jsx)(PrintScale, { fontSize: s, align: "center", children: /* @__PURE__ */ (0, import_jsx_runtime9.jsx)(Text, { children: "VND" }) }),
      /* @__PURE__ */ (0, import_jsx_runtime9.jsx)(PrintScale, { fontSize: s, align: "right", children: /* @__PURE__ */ (0, import_jsx_runtime9.jsx)(Text, { children: formatMoney(totals.grandTotal) }) })
    ] }),
    /* @__PURE__ */ (0, import_jsx_runtime9.jsx)(Text, { children: `${t("receipt.quantity")}:  ${totals.totalQuantity}` }),
    /* @__PURE__ */ (0, import_jsx_runtime9.jsx)(CharLine, {}),
    /* @__PURE__ */ (0, import_jsx_runtime9.jsx)(
      Cells,
      {
        cells: [
          { text: (transaction.paymentMethod || t("receipt.cash")).toUpperCase(), flex: 2 },
          { text: "VND", flex: 1, align: "center" },
          { text: formatMoney(totals.amountPaid), flex: 2, align: "right" }
        ]
      }
    ),
    /* @__PURE__ */ (0, import_jsx_runtime9.jsx)(Text, { children: `${t("receipt.netValue")}:` }),
    /* @__PURE__ */ (0, import_jsx_runtime9.jsx)(
      Cells,
      {
        cells: [
          { text: `${tax.vatRate.toFixed(2)} ${t("receipt.percentOf")}`, flex: 2 },
          { text: formatMoney(totals.preTaxAmount), flex: 2, align: "right" },
          { text: formatMoney(totals.vatAmount), flex: 2, align: "right" }
        ]
      }
    ),
    /* @__PURE__ */ (0, import_jsx_runtime9.jsx)(CharLine, {}),
    transaction.memberCode ? /* @__PURE__ */ (0, import_jsx_runtime9.jsx)(Text, { children: `${t("receipt.memberNo")}:  ${transaction.memberCode}` }) : null,
    transaction.customerName ? /* @__PURE__ */ (0, import_jsx_runtime9.jsx)(Text, { children: `${t("receipt.customerShort")}  ${transaction.customerName}` }) : null,
    transaction.memberCode || transaction.customerName ? /* @__PURE__ */ (0, import_jsx_runtime9.jsx)(CharLine, {}) : null,
    /* @__PURE__ */ (0, import_jsx_runtime9.jsx)(
      Cells,
      {
        cells: [
          { text: t("receipt.date"), flex: 3 },
          { text: t("receipt.time"), flex: 2 },
          { text: "POS", flex: 1, align: "right" },
          { text: t("receipt.cashier"), flex: 2, align: "right" },
          { text: t("receipt.ticket"), flex: 2, align: "right" }
        ]
      }
    ),
    /* @__PURE__ */ (0, import_jsx_runtime9.jsx)(
      Cells,
      {
        cells: [
          { text: dateTime.slice(0, 10), flex: 3 },
          { text: dateTime.slice(11), flex: 2 },
          { text: transaction.posNo ?? "", flex: 1, align: "right" },
          { text: transaction.cashier ?? "", flex: 2, align: "right" },
          { text: transaction.invoiceNo ?? "", flex: 2, align: "right" }
        ]
      }
    ),
    display.showQr !== false ? /* @__PURE__ */ (0, import_jsx_runtime9.jsxs)(import_antd9.Flex, { vertical: true, align: "center", className: "mt-2", children: [
      /* @__PURE__ */ (0, import_jsx_runtime9.jsx)(PrintImage, { src: codes.qrDataUrl, width: s * 6 }),
      /* @__PURE__ */ (0, import_jsx_runtime9.jsx)(Text, { align: "center", children: t("receipt.scanQrInvoice") })
    ] }) : null,
    /* @__PURE__ */ (0, import_jsx_runtime9.jsx)(Text, { align: "center", className: "mt-2", children: data.footerNote ?? "" }),
    display.showBarcode !== false ? /* @__PURE__ */ (0, import_jsx_runtime9.jsxs)(import_antd9.Flex, { vertical: true, align: "center", className: "mt-1", children: [
      /* @__PURE__ */ (0, import_jsx_runtime9.jsx)(PrintImage, { src: codes.barcodeDataUrl, width: Math.round(s * 18), height: s * 2 }),
      /* @__PURE__ */ (0, import_jsx_runtime9.jsx)(Text, { align: "center", children: codes.barcodeValue })
    ] }) : null
  ] });
};
var goTopsTemplate = {
  id: "go-tops",
  name: "GO! / Tops Market layout",
  description: "Hypermarket POS: qty \xD7 price lines, double-height total, VAT table, QR footer",
  printerStyle: "Condensed thermal mono (Epson Font B)",
  component: GoTops,
  fontId: "inconsolata-condensed" /* inconsolataCondensed */,
  fontSize: 16,
  paperWidth: PAPER_WIDTH.mm58,
  catalogAccounts: ["go!", "mini go", "tops"],
  fields: [
    "store.legalName",
    "store.address",
    "store.phone",
    "store.hotline",
    "store.taxCode",
    "transaction.invoiceNo",
    "transaction.posNo",
    "transaction.cashier",
    "transaction.paymentMethod",
    "transaction.amountPaid",
    "transaction.customerName",
    "transaction.memberCode",
    "item.unit",
    "footerNote"
  ],
  defaults: {
    store: {
      name: "PH\u1ED0 XANH!",
      legalName: "CTy TNHH TMDV Si\xEAu Th\u1ECB Ph\u1ED1 Xanh",
      address: "L\xF4 7, KDC H\u01B0ng Th\u1EA1nh, P. H\u01B0ng Ph\xFA, TP. C\u1EA7n Th\u01A1",
      phone: "0292 0000 111",
      hotline: "1900 0000",
      taxCode: "0100000002",
      /** Default logo image src for this template; empty → text wordmark */
      logoUrl: "",
      showLogo: true,
      logoAlign: "center",
      logoWidth: 180
    },
    transaction: {
      invoiceNo: "029010875",
      posNo: "029",
      cashier: "120126",
      paymentMethod: "CASH",
      memberCode: "3101533****",
      customerName: "Tr\u1EA7n Minh Anh"
    },
    footerNote: "C\xE1m \u01A1n Qu\xFD Kh\xE1ch !\nH\u1EB9n g\u1EB7p l\u1EA1i!\nPhi\u1EBFu t\xEDnh ti\u1EC1n ch\u1EC9 c\xF3 gi\xE1 tr\u1ECB xu\u1EA5t\nh\xF3a \u0111\u01A1n trong v\xF2ng 120 ph\xFAt"
  }
};

// src/components/Bills/templates/WinMart/index.tsx
var import_antd10 = require("antd");
var import_jsx_runtime10 = require("react/jsx-runtime");
var WinMart = ({ data, totals, codes, font, t }) => {
  const { store, transaction, display } = data;
  const s = font.size;
  return /* @__PURE__ */ (0, import_jsx_runtime10.jsxs)(import_antd10.Flex, { vertical: true, children: [
    /* @__PURE__ */ (0, import_jsx_runtime10.jsx)(
      Logo,
      {
        store,
        fallback: /* @__PURE__ */ (0, import_jsx_runtime10.jsx)(Wordmark, { text: store.name, size: s * 2.4, letterSpacing: 0 })
      }
    ),
    /* @__PURE__ */ (0, import_jsx_runtime10.jsxs)(import_antd10.Flex, { vertical: true, align: "center", children: [
      /* @__PURE__ */ (0, import_jsx_runtime10.jsx)(Text, { align: "center", bold: true, size: s * 1.3, children: t("receipt.bill").toUpperCase() }),
      /* @__PURE__ */ (0, import_jsx_runtime10.jsx)(Text, { align: "center", children: `${formatDateTime(transaction.dateTime, "DD/MM/YYYY HH:mm")}|MSCH:${store.branch ?? ""}|NV:${transaction.cashier ?? ""}` }),
      /* @__PURE__ */ (0, import_jsx_runtime10.jsx)(Text, { align: "center", children: `PTT:${transaction.invoiceNo ?? ""}` }),
      /* @__PURE__ */ (0, import_jsx_runtime10.jsx)(Text, { align: "center", italic: true, children: `${t("receipt.taxAuthorityCode")}: ${transaction.lookupCode || codes.barcodeValue.slice(0, 14)}` })
    ] }),
    /* @__PURE__ */ (0, import_jsx_runtime10.jsx)(
      Cells,
      {
        className: "mt-3",
        cells: [
          { text: t("receipt.itemPrice"), flex: 3 },
          { text: t("receipt.qty"), flex: 1, align: "center" },
          { text: t("receipt.promo"), flex: 1, align: "center" },
          { text: t("receipt.amountShort"), flex: 2, align: "right" }
        ]
      }
    ),
    totals.lines.map((line) => /* @__PURE__ */ (0, import_jsx_runtime10.jsxs)(import_antd10.Flex, { vertical: true, className: "mt-1", children: [
      /* @__PURE__ */ (0, import_jsx_runtime10.jsx)(Text, { children: line.title }),
      /* @__PURE__ */ (0, import_jsx_runtime10.jsx)(
        Cells,
        {
          cells: [
            { text: formatMoney(line.unitPrice), flex: 3 },
            { text: line.quantity, flex: 1, align: "center" },
            { text: line.discount ? formatMoney(line.discount) : "", flex: 1, align: "center" },
            { text: formatMoney(line.lineTotal), flex: 2, align: "right" }
          ]
        }
      )
    ] }, line.index)),
    /* @__PURE__ */ (0, import_jsx_runtime10.jsx)(RuleLine, { dashed: true }),
    /* @__PURE__ */ (0, import_jsx_runtime10.jsx)(
      Cells,
      {
        cells: [
          { text: t("receipt.totalAmount").toUpperCase(), flex: 3, bold: true },
          { text: "", flex: 1 },
          { text: formatMoney(totals.totalDiscount), flex: 1, align: "center" },
          { text: formatMoney(totals.grandTotal), flex: 2, align: "right", bold: true }
        ]
      }
    ),
    /* @__PURE__ */ (0, import_jsx_runtime10.jsx)(
      KeyValue,
      {
        label: t("receipt.vatInRate", { rate: data.tax.vatRate }),
        value: formatMoney(totals.vatAmount)
      }
    ),
    /* @__PURE__ */ (0, import_jsx_runtime10.jsx)(RuleLine, { dashed: true }),
    /* @__PURE__ */ (0, import_jsx_runtime10.jsxs)(import_antd10.Flex, { gap: 8, align: "flex-start", children: [
      display.showQr !== false ? /* @__PURE__ */ (0, import_jsx_runtime10.jsxs)(import_antd10.Flex, { vertical: true, className: "shrink-0", children: [
        /* @__PURE__ */ (0, import_jsx_runtime10.jsx)(PrintImage, { src: codes.qrDataUrl, width: s * 6.5 }),
        /* @__PURE__ */ (0, import_jsx_runtime10.jsx)(Text, { children: `${t("receipt.invoiceCode")}: ${(transaction.invoiceNo ?? "").slice(-4)}` })
      ] }) : null,
      /* @__PURE__ */ (0, import_jsx_runtime10.jsxs)(import_antd10.Flex, { vertical: true, flex: 1, children: [
        /* @__PURE__ */ (0, import_jsx_runtime10.jsx)(Text, { children: data.footerNote ?? "" }),
        display.showBarcode !== false ? /* @__PURE__ */ (0, import_jsx_runtime10.jsx)(import_antd10.Flex, { className: "mt-2", children: /* @__PURE__ */ (0, import_jsx_runtime10.jsx)(PrintImage, { src: codes.barcodeDataUrl, width: Math.round(s * 13), height: s * 2.4 }) }) : null,
        /* @__PURE__ */ (0, import_jsx_runtime10.jsx)(Text, { children: `${t("receipt.phone")}: ${store.hotline ?? ""}` })
      ] })
    ] })
  ] });
};
var winMartTemplate = {
  id: "winmart",
  name: "WinMart / B\xE1ch H\xF3a Xanh layout",
  description: "Compact minimart slip, discount column, QR + e-invoice note side by side",
  printerStyle: "Arial / Helvetica",
  component: WinMart,
  fontId: "arimo" /* arimo */,
  fontSize: 15,
  paperWidth: PAPER_WIDTH.mm58 + 16,
  catalogAccounts: ["winmart", "bach hoa xanh", "bhx"],
  fields: [
    "store.branch",
    "store.hotline",
    "transaction.invoiceNo",
    "transaction.cashier",
    "transaction.lookupCode",
    "item.discount",
    "footerNote"
  ],
  defaults: {
    store: {
      name: "H\u1EA1nhPh\xFAc",
      branch: "1664",
      hotline: "024 0000 0000",
      /** Default logo image src for this template; empty → text wordmark */
      logoUrl: "",
      showLogo: true,
      logoAlign: "center"
    },
    transaction: {
      invoiceNo: "166401250803265",
      cashier: "09043572"
    },
    footerNote: "Qu\xE9t QR \u0111\u1EC3 xu\u1EA5t h\xF3a \u0111\u01A1n ho\u1EB7c truy c\u1EADp hoadon.example.com trong 60 ph\xFAt. Xin t\u1EEB ch\u1ED1i ch\u1ECBu tr\xE1ch nhi\u1EC7m n\u1EBFu nh\u1EADp th\xF4ng tin sai."
  }
};

// src/components/Bills/registry.ts
var BILL_TEMPLATES = [
  circleKTemplate,
  goTopsTemplate,
  aeonTemplate,
  aeonCitimartTemplate,
  coopmartTemplate,
  emartTemplate,
  winMartTemplate,
  familyMartTemplate,
  farmersMarketTemplate
];
var BILL_TEMPLATE_MAP = Object.fromEntries(
  BILL_TEMPLATES.map((template) => [template.id, template])
);
var DEFAULT_TEMPLATE_ID = BILL_TEMPLATES[0].id;
var getBillTemplate = (templateId) => BILL_TEMPLATE_MAP[templateId ?? ""] ?? BILL_TEMPLATE_MAP[DEFAULT_TEMPLATE_ID];

// src/utils/render-bill/index.ts
var import_fs = __toESM(require("fs"));
var import_module = require("module");
var import_path = __toESM(require("path"));
var import_react2 = __toESM(require("react"));

// src/components/Bills/helpers/codes.ts
var import_bwip_js = require("bwip-js");

// src/components/Bills/helpers/random.ts
var hashSeed = (seed) => {
  let hash = 1779033703 ^ seed.length;
  for (let i = 0; i < seed.length; i++) {
    hash = Math.imul(hash ^ seed.charCodeAt(i), 3432918353);
    hash = hash << 13 | hash >>> 19;
  }
  return hash >>> 0;
};
var createRandom = (seed) => {
  let state = hashSeed(seed || "receipt-lab");
  const next = () => {
    state = state + 1831565813 | 0;
    let t = Math.imul(state ^ state >>> 15, 1 | state);
    t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t;
    return ((t ^ t >>> 14) >>> 0) / 4294967296;
  };
  const int = (min, max) => Math.floor(next() * (max - min + 1)) + min;
  const digits = (length) => Array.from({ length }, (_, i) => i === 0 ? int(1, 9) : int(0, 9)).join("");
  const alphanumeric = (length) => {
    const charset = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
    return Array.from({ length }, () => charset[int(0, charset.length - 1)]).join("");
  };
  return { next, int, digits, alphanumeric };
};
var randomSeed = () => Math.random().toString(36).slice(2, 10);

// src/components/Bills/helpers/codes.ts
var toBase64 = (text) => typeof Buffer !== "undefined" ? Buffer.from(text, "utf-8").toString("base64") : btoa(unescape(encodeURIComponent(text)));
var svgToDataUrl = (svg) => `data:image/svg+xml;base64,${toBase64(svg)}`;
var generateBillCodes = (data) => {
  const seed = data.display?.seed || "receipt-lab";
  const random = createRandom(seed);
  const lookupCode = data.transaction?.lookupCode || random.alphanumeric(10);
  const randomQr = `https://einvoice.example.com/lookup?code=${lookupCode}&ref=${random.alphanumeric(
    12
  )}`;
  const randomBarcode = random.digits(20);
  const qrSvgFor = (text) => (0, import_bwip_js.toSVG)({ bcid: "qrcode", text, scale: 3, eclevel: "M" });
  const barcodeSvgFor = (text) => (0, import_bwip_js.toSVG)({ bcid: "code128", text, scale: 2, height: 10, includetext: false });
  const encode = (custom, fallback, draw) => {
    const text = custom?.trim();
    if (text) {
      try {
        return { value: text, svg: draw(text) };
      } catch {
      }
    }
    return { value: fallback, svg: draw(fallback) };
  };
  const qr = encode(data.display?.qrText, randomQr, qrSvgFor);
  const barcode = encode(data.display?.barcodeText, randomBarcode, barcodeSvgFor);
  const qrPayload = qr.value;
  const barcodeValue = barcode.value;
  const qrSvg = qr.svg;
  const barcodeSvg = barcode.svg;
  return {
    qrPayload,
    qrDataUrl: svgToDataUrl(qrSvg),
    barcodeValue,
    barcodeDataUrl: svgToDataUrl(barcodeSvg)
  };
};

// src/locales/en-US/receipt.ts
var receiptLocale = {
  "receipt.bill": "Receipt",
  "receipt.salesInvoice": "Sales receipt",
  "receipt.retailInvoice": "Retail invoice",
  "receipt.purchaseSlip": "Purchase receipt",
  "receipt.supermarketOrder": "Supermarket order",
  "receipt.description": "Description",
  "receipt.product": "Product",
  "receipt.productName": "Item",
  "receipt.productNameLong": "Product name",
  "receipt.productCode": "Item code",
  "receipt.itemPrice": "Item/price",
  "receipt.quantity": "Quantity",
  "receipt.qty": "Qty",
  "receipt.unitPrice": "Unit price",
  "receipt.price": "Price",
  "receipt.amount": "Amount",
  "receipt.amountShort": "Amount",
  "receipt.money": "Amount",
  "receipt.promo": "Disc.",
  "receipt.total": "Total",
  "receipt.totalAmount": "Total",
  "receipt.subtotal": "Subtotal",
  "receipt.totalWithTax": "Total incl. tax",
  "receipt.totalBeforeTax": "Total before tax",
  "receipt.netValue": "Net of tax",
  "receipt.tax": "Tax",
  "receipt.vatIncludedRate": "Incl. VAT {rate}%",
  "receipt.vatIncludedAmount": "(VAT {rate}% included: {amount})",
  "receipt.vatInRate": "of which VAT {rate}%",
  "receipt.pricesIncludeVat": "Prices include VAT",
  "receipt.totalDiscount": "Total discount",
  "receipt.discount": "Discount",
  "receipt.totalBeforeDiscount": "Total before discount",
  "receipt.amountDue": "Amount due",
  "receipt.amountToReceive": "Amount due",
  "receipt.totalPayment": "Total payment",
  "receipt.cash": "Cash",
  "receipt.customerPaid": "Paid",
  "receipt.amountReceived": "Amount received",
  "receipt.change": "Change",
  "receipt.changeShort": "Change",
  "receipt.changeCash": "Change ({method})",
  "receipt.paymentMethod": "Payment method",
  "receipt.cashier": "Cashier",
  "receipt.staff": "Staff",
  "receipt.counter": "Counter",
  "receipt.date": "Date",
  "receipt.time": "Time",
  "receipt.invoiceNo": "Receipt no.",
  "receipt.invoiceNoLong": "Receipt no.",
  "receipt.transactionNo": "Transaction no.",
  "receipt.transactionCode": "Txn code",
  "receipt.taxCode": "Tax code",
  "receipt.phone": "Tel",
  "receipt.salesLocation": "Location",
  "receipt.customer": "Customer",
  "receipt.customerShort": "Customer",
  "receipt.walkIn": "Walk-in customer",
  "receipt.memberName": "Member",
  "receipt.memberCard": "Member card",
  "receipt.memberId": "Member ID",
  "receipt.cardNo": "Card no.",
  "receipt.points": "Points",
  "receipt.currentPoints": "Current points",
  "receipt.pointsUsed": "Points used",
  "receipt.pointsNote": "(Points at time of printing)",
  "receipt.loyalty": "Loyalty member",
  "receipt.fullName": "Name",
  "receipt.itemCount": "Number of items",
  "receipt.totalQuantity": "Total quantity",
  "receipt.totalItems": "Total items",
  "receipt.thanks": "Thank you",
  "receipt.thanksShort": "Thank you for shopping!",
  "receipt.lookupCode": "Lookup code",
  "receipt.trackingCode": "Tracking code",
  "receipt.scanQrInvoice": "Scan the QR code above\nto request an e-invoice",
  "receipt.scanQrInvoiceSide": "Scan the QR or visit {site} within 60 minutes for an invoice.",
  "receipt.scanQrVat": "This receipt can be exchanged for a VAT invoice within 2 hours of payment. Please scan the QR code to request it",
  "receipt.scanQrFeedback": "Please share your feedback by scanning the QR code",
  "receipt.scanQrInvoiceSite": "To get a VAT invoice, scan the QR code to visit {site} and fill in your details on the day of purchase",
  "receipt.updateInvoiceInfo": "To update invoice information, please visit: {site}",
  "receipt.saleDate": "Sale date",
  "receipt.printDate": "Printed",
  "receipt.feedbackHotline": "Feedback hotline",
  "receipt.openingHours": "Opening hours",
  "receipt.taxable": "Taxable amount",
  "receipt.vatAmount": "Value added tax",
  "receipt.totalTax": "Total tax",
  "receipt.store": "Store",
  "receipt.terminal": "Terminal",
  "receipt.itemsQty": "Qty",
  "receipt.cardHolder": "Cardholder",
  "receipt.change.due": "Change due",
  "receipt.website": "Website",
  "receipt.percentOf": "% of",
  "receipt.phoneLong": "Tel",
  "receipt.memberNo": "Member No",
  "receipt.ticket": "Ticket",
  "receipt.unitDefault": "pc",
  "receipt.tel": "Tel",
  "receipt.pointsStar": "Points(*)",
  "receipt.memberCardLong": "Member card",
  "receipt.phoneFull": "Phone",
  "receipt.pointSave": "*** POINT SAVE ***",
  "receipt.memberCode": "Member no.",
  "receipt.taxAuthorityCode": "Tax auth. code",
  "receipt.invoiceCode": "Receipt code",
  "receipt.totalQtyTotal": "Qty/Total",
  "receipt.totalDiscountShort": "Total discount",
  "receipt.dateTimeLine": "Date: {date} - Time: {time}"
};

// src/locales/vi-VN/receipt.ts
var receiptLocale2 = {
  "receipt.bill": "Phi\u1EBFu t\xEDnh ti\u1EC1n",
  "receipt.salesInvoice": "H\xF3a \u0111\u01A1n b\xE1n h\xE0ng",
  "receipt.retailInvoice": "H\xF3a \u0111\u01A1n b\xE1n l\u1EBB",
  "receipt.purchaseSlip": "Phi\u1EBFu mua h\xE0ng",
  "receipt.supermarketOrder": "\u0110\u01A1n h\xE0ng si\xEAu th\u1ECB",
  "receipt.description": "M\xF4 t\u1EA3",
  "receipt.product": "S\u1EA3n ph\u1EA9m",
  "receipt.productName": "T\xEAn h\xE0ng",
  "receipt.productNameLong": "T\xEAn s\u1EA3n ph\u1EA9m",
  "receipt.productCode": "M\xE3 h\xE0ng",
  "receipt.itemPrice": "M\u1EB7t h\xE0ng/gi\xE1",
  "receipt.quantity": "S\u1ED1 l\u01B0\u1EE3ng",
  "receipt.qty": "SL",
  "receipt.unitPrice": "\u0110\u01A1n gi\xE1",
  "receipt.price": "Gi\xE1",
  "receipt.amount": "Th\xE0nh ti\u1EC1n",
  "receipt.amountShort": "T.Ti\u1EC1n",
  "receipt.money": "S\u1ED1 ti\u1EC1n",
  "receipt.promo": "KM",
  "receipt.total": "T\u1ED5ng c\u1ED9ng",
  "receipt.totalAmount": "T\u1ED5ng ti\u1EC1n",
  "receipt.subtotal": "T\u1ED5ng s\u1ED1",
  "receipt.totalWithTax": "T\u1ED5ng ti\u1EC1n c\xF3 thu\u1EBF",
  "receipt.totalBeforeTax": "T\u1ED5ng ti\u1EC1n ch\u01B0a thu\u1EBF",
  "receipt.netValue": "G.tr\u1ECB ch\u01B0a thu\u1EBF",
  "receipt.tax": "Ti\u1EC1n thu\u1EBF",
  "receipt.vatIncludedRate": "Bao g\u1ED3m thu\u1EBF GTGT {rate}%",
  "receipt.vatIncludedAmount": "(\u0110\xE3 bao g\u1ED3m VAT {rate}%: {amount})",
  "receipt.vatInRate": "Trong \u0111\xF3 VAT {rate}%",
  "receipt.pricesIncludeVat": "Gi\xE1 tr\xEAn \u0111\xE3 bao g\u1ED3m thu\u1EBF GTGT",
  "receipt.totalDiscount": "T\u1ED5ng ti\u1EC1n gi\u1EA3m gi\xE1",
  "receipt.discount": "Chi\u1EBFt kh\u1EA5u",
  "receipt.totalBeforeDiscount": "T\u1ED5ng ti\u1EC1n tr\u01B0\u1EDBc chi\u1EBFt kh\u1EA5u",
  "receipt.amountDue": "T\u1ED5ng th\xE0nh ti\u1EC1n ph\u1EA3i thanh to\xE1n",
  "receipt.amountToReceive": "S\u1ED1 ti\u1EC1n s\u1EBD nh\u1EADn",
  "receipt.totalPayment": "T\u1ED5ng thanh to\xE1n",
  "receipt.cash": "Ti\u1EC1n m\u1EB7t",
  "receipt.customerPaid": "Kh\xE1ch tr\u1EA3",
  "receipt.amountReceived": "T\u1ED5ng ti\u1EC1n thu c\u1EE7a qu\xFD kh\xE1ch",
  "receipt.change": "Ti\u1EC1n th\u1ED1i l\u1EA1i",
  "receipt.changeShort": "Ti\u1EC1n th\u1EEBa",
  "receipt.changeCash": "Tr\u1EA3 l\u1EA1i ({method})",
  "receipt.paymentMethod": "Ph\u01B0\u01A1ng th\u1EE9c thanh to\xE1n",
  "receipt.cashier": "Thu ng\xE2n",
  "receipt.staff": "NV",
  "receipt.counter": "Qu\u1EA7y",
  "receipt.date": "Ng\xE0y",
  "receipt.time": "Gi\u1EDD",
  "receipt.invoiceNo": "S\u1ED1 H\u0110",
  "receipt.invoiceNoLong": "S\u1ED1 h\xF3a \u0111\u01A1n",
  "receipt.transactionNo": "S\u1ED1 giao d\u1ECBch",
  "receipt.transactionCode": "M\xE3 GD",
  "receipt.taxCode": "M\xE3 s\u1ED1 thu\u1EBF",
  "receipt.phone": "\u0110T",
  "receipt.salesLocation": "\u0110\u1ECBa \u0111i\u1EC3m b\xE1n",
  "receipt.customer": "Kh\xE1ch h\xE0ng",
  "receipt.customerShort": "Kh\xE1ch",
  "receipt.walkIn": "Kh\xE1ch l\u1EBB",
  "receipt.memberName": "T\xEAn th\xE0nh vi\xEAn",
  "receipt.memberCard": "M\xE3 th\u1EBB th\xE0nh vi\xEAn",
  "receipt.memberId": "M\xE3 th\xE0nh vi\xEAn",
  "receipt.cardNo": "S\u1ED1 th\u1EBB",
  "receipt.points": "\u0110i\u1EC3m t\xEDch l\u0169y",
  "receipt.currentPoints": "\u0110i\u1EC3m t\xEDch l\u0169y hi\u1EC7n t\u1EA1i",
  "receipt.pointsUsed": "\u0110i\u1EC3m thanh to\xE1n trong giao d\u1ECBch",
  "receipt.pointsNote": "(S\u1ED1 \u0111i\u1EC3m th\u1EC3 hi\u1EC7n t\u1EA1i th\u1EDDi \u0111i\u1EC3m in bill)",
  "receipt.loyalty": "Th\xF4ng tin kh\xE1ch h\xE0ng th\xE2n thi\u1EBFt",
  "receipt.fullName": "H\u1ECD t\xEAn",
  "receipt.itemCount": "S\u1ED1 l\u01B0\u1EE3ng m\u1EB7t h\xE0ng",
  "receipt.totalQuantity": "T\u1ED5ng s\u1ED1 l\u01B0\u1EE3ng h\xE0ng",
  "receipt.totalItems": "T\u1ED5ng s\u1ED1 h\xE0ng S\u1ED1 l\u01B0\u1EE3ng",
  "receipt.thanks": "C\u1EA3m \u01A1n Qu\xFD kh\xE1ch",
  "receipt.thanksShort": "Xin c\u1EA3m \u01A1n qu\xFD kh\xE1ch!",
  "receipt.lookupCode": "M\xE3 tra c\u1EE9u",
  "receipt.trackingCode": "M\xE3 tra c\u1EE9u/Tracking code",
  "receipt.scanQrInvoice": "\u0110\u1EC3 xu\u1EA5t h\xF3a \u0111\u01A1n \u0111i\u1EC7n t\u1EED\nvui l\xF2ng qu\xE9t QR code ph\xEDa tr\xEAn",
  "receipt.scanQrInvoiceSide": "Qu\xE9t QR \u0111\u1EC3 xu\u1EA5t h\xF3a \u0111\u01A1n ho\u1EB7c truy c\u1EADp {site} trong 60 ph\xFAt.",
  "receipt.scanQrVat": "Phi\u1EBFu n\xE0y c\xF3 gi\xE1 tr\u1ECB xu\u1EA5t h\xF3a \u0111\u01A1n GTGT trong v\xF2ng 02 gi\u1EDD k\u1EC3 t\u1EEB th\u1EDDi \u0111i\u1EC3m thanh to\xE1n. Qu\xFD kh\xE1ch vui l\xF2ng qu\xE9t m\xE3 QR \u0111\u1EC3 xu\u1EA5t h\xF3a \u0111\u01A1n GTGT",
  "receipt.scanQrFeedback": "Vui l\xF2ng qu\xE9t m\xE3 QR \u0111\u1EC3 chia s\u1EBB \xFD ki\u1EBFn c\u1EE7a b\u1EA1n",
  "receipt.scanQrInvoiceSite": "\u0110\u1EC3 xu\u1EA5t h\xF3a \u0111\u01A1n VAT, vui l\xF2ng qu\xE9t QR code \u0111\u1EC3 truy c\u1EADp {site} v\xE0 \u0111i\u1EC1n th\xF4ng tin trong ng\xE0y mua h\xE0ng",
  "receipt.updateInvoiceInfo": "\u0110\u1EC3 c\u1EADp nh\u1EADt th\xF4ng tin xu\u1EA5t h\xF3a \u0111\u01A1n, qu\xFD kh\xE1ch vui l\xF2ng truy c\u1EADp: {site}",
  "receipt.saleDate": "Ng\xE0y b\xE1n",
  "receipt.printDate": "Ng\xE0y in",
  "receipt.feedbackHotline": "T\u1ED5ng \u0111\xE0i g\xF3p \xFD/ khi\u1EBFu n\u1EA1i",
  "receipt.openingHours": "Gi\u1EDD m\u1EDF c\u1EEDa",
  "receipt.taxable": "S\u1ED1 ti\u1EC1n h\u1EA1ng m\u1EE5c \u0111\xE1nh thu\u1EBF",
  "receipt.vatAmount": "Thu\u1EBF gi\xE1 tr\u1ECB gia t\u0103ng",
  "receipt.totalTax": "T\u1ED5ng s\u1ED1 thu\u1EBF",
  "receipt.store": "C\u1EEDa h\xE0ng",
  "receipt.terminal": "M\xE1y",
  "receipt.itemsQty": "S\u1ED1 l\u01B0\u1EE3ng",
  "receipt.cardHolder": "T\xEAn kh\xE1ch",
  "receipt.change.due": "Ti\u1EC1n th\u1ED1i",
  "receipt.website": "Website",
  "receipt.percentOf": "%c\u1EE7a",
  "receipt.phoneLong": "S\u1ED1 \u0110T",
  "receipt.memberNo": "The 1 No",
  "receipt.ticket": "Ticket",
  "receipt.unitDefault": "C\xE1i",
  "receipt.tel": "Tel",
  "receipt.pointsStar": "\u0110i\u1EC3m t\xEDch l\u0169y(*)",
  "receipt.memberCardLong": "M\xE3 th\u1EBB H\u1ED9i vi\xEAn",
  "receipt.phoneFull": "\u0110i\u1EC7n tho\u1EA1i",
  "receipt.pointSave": "*** POINT SAVE ***",
  "receipt.memberCode": "M\xE3 s\u1ED1",
  "receipt.taxAuthorityCode": "M\xE3 CQT",
  "receipt.invoiceCode": "M\xE3 H\u0110",
  "receipt.totalQtyTotal": "T\u1ED5ng s\u1ED1/T\u1ED5ng c\u1ED9ng",
  "receipt.totalDiscountShort": "T\u1ED5ng chi\u1EBFt kh\u1EA5u",
  "receipt.dateTimeLine": "Ng\xE0y: {date} - Gi\u1EDD: {time}"
};

// src/components/Bills/helpers/receipt-text.ts
var DICTIONARIES = { vi: receiptLocale2, en: receiptLocale };
var createReceiptT = (lang = "vi") => {
  const dictionary = DICTIONARIES[lang] ?? receiptLocale2;
  const t = ((key, values) => (dictionary[key] ?? receiptLocale2[key] ?? key).replace(
    /\{(\w+)\}/g,
    (_, name) => values?.[name] === void 0 ? `{${name}}` : String(values[name])
  ));
  t.lang = lang;
  return t;
};

// src/components/Bills/shared/Paper.tsx
var import_antd11 = require("antd");

// src/components/Bills/shared/Watermark.tsx
var import_jsx_runtime11 = require("react/jsx-runtime");
var clamp = (value, { min, max, default: fallback }) => Math.min(max, Math.max(min, Number.isFinite(value) ? value : fallback));
var resolveWatermark = (options = {}) => {
  const custom = (options.text ?? "").trim() || WATERMARK_LIMITS.defaultText;
  const text = custom.toUpperCase().includes(WATERMARK_LIMITS.requiredMark) ? custom : `${WATERMARK_LIMITS.requiredMark} \xB7 ${custom}`;
  return {
    text,
    opacity: clamp(options.opacity, WATERMARK_LIMITS.opacity),
    size: clamp(options.size, WATERMARK_LIMITS.size),
    angle: clamp(options.angle, WATERMARK_LIMITS.angle),
    spacing: clamp(options.spacing, WATERMARK_LIMITS.spacing),
    color: options.color || "#b3261e"
  };
};
var escapeXml = (text) => text.replace(/[<>&'"]/g, (char) => `&#${char.charCodeAt(0)};`);
var buildWatermarkMarkup = (options) => {
  const { text, opacity, size, angle, spacing, color } = resolveWatermark(options);
  const tileWidth = Math.round(text.length * size * 0.8 + size * 3 * spacing);
  const rowHeight = Math.round(size * 3.2 * spacing);
  const label = escapeXml(text);
  const textAttrs = `font-family="Arimo, Arial, sans-serif" font-weight="700" font-size="${size}" fill="${color}"`;
  return `<defs><pattern id="receipt-lab-watermark" patternUnits="userSpaceOnUse" width="${tileWidth}" height="${rowHeight * 2}" patternTransform="rotate(${angle})"><text x="0" y="${Math.round(rowHeight * 0.65)}" ${textAttrs}>${label}</text><text x="${-tileWidth}" y="${Math.round(rowHeight * 0.65)}" ${textAttrs}>${label}</text><text x="${-tileWidth / 2}" y="${Math.round(rowHeight * 1.65)}" ${textAttrs}>${label}</text><text x="${tileWidth / 2}" y="${Math.round(rowHeight * 1.65)}" ${textAttrs}>${label}</text></pattern></defs><rect x="0" y="0" width="100%" height="100%" fill="url(#receipt-lab-watermark)" opacity="${opacity}"/>`;
};
var WATERMARK_TILE_HEIGHT = 3e3;
var buildWatermarkDataUrl = (options, width) => `data:image/svg+xml;charset=utf-8,${encodeURIComponent(
  `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${WATERMARK_TILE_HEIGHT}">${buildWatermarkMarkup(
    options
  )}</svg>`
)}`;
var Watermark = ({
  options,
  width
}) => /* @__PURE__ */ (0, import_jsx_runtime11.jsx)(
  "div",
  {
    className: "absolute inset-0 pointer-events-none bg-repeat-y bg-top",
    style: {
      backgroundImage: `url("${buildWatermarkDataUrl(options, width)}")`,
      backgroundSize: `${width}px ${WATERMARK_TILE_HEIGHT}px`
    }
  }
);

// src/components/Bills/shared/Paper.tsx
var import_jsx_runtime12 = require("react/jsx-runtime");
var Paper = ({
  width,
  fontFamily,
  fontSize,
  inkDensity = 1,
  watermark,
  withWatermarkOverlay = true,
  children
}) => /* @__PURE__ */ (0, import_jsx_runtime12.jsxs)(import_antd11.Flex, { vertical: true, className: "relative overflow-hidden bg-[#fdfdfb]", style: { width }, children: [
  /* @__PURE__ */ (0, import_jsx_runtime12.jsx)(
    import_antd11.Flex,
    {
      vertical: true,
      className: "w-full pt-6 px-[18px] pb-7",
      style: {
        fontFamily,
        fontSize,
        lineHeight: 1.25,
        color: INK,
        opacity: Math.min(1, Math.max(0.45, inkDensity))
      },
      children
    }
  ),
  withWatermarkOverlay ? /* @__PURE__ */ (0, import_jsx_runtime12.jsx)(Watermark, { options: watermark, width }) : null
] });

// src/components/Bills/BillRenderer.tsx
var import_jsx_runtime13 = require("react/jsx-runtime");
var resolveBillView = (data) => {
  const template = getBillTemplate(data.templateId);
  const font = getFontPreset(data.display?.fontId || template.fontId);
  const fontSize = Number(data.display?.fontSize) || template.fontSize;
  const paperWidth = Number(data.display?.paperWidth) || template.paperWidth;
  return { template, font, fontSize, paperWidth };
};
var BillRenderer = ({
  data,
  totals,
  codes,
  withWatermarkOverlay
}) => {
  const { template, font, fontSize, paperWidth } = resolveBillView(data);
  const Template = template.component;
  return /* @__PURE__ */ (0, import_jsx_runtime13.jsx)(
    Paper,
    {
      width: paperWidth,
      fontFamily: font.family,
      fontSize,
      inkDensity: data.display?.inkDensity,
      watermark: data.display?.watermark,
      withWatermarkOverlay,
      children: /* @__PURE__ */ (0, import_jsx_runtime13.jsx)(
        Template,
        {
          data,
          totals: totals ?? calculateTotals(data),
          codes: codes ?? generateBillCodes(data),
          font: { family: font.family, size: fontSize },
          t: createReceiptT(data.display?.language)
        }
      )
    }
  );
};
var BillRenderer_default = BillRenderer;

// src/components/Bills/helpers/normalize.ts
var SAMPLE_ITEMS = [
  {
    title: "N\u01B0\u1EDBc su\u1ED1i tinh khi\u1EBFt 500ml",
    barcode: "8930000000017",
    unit: "Chai",
    unitPrice: 7e3,
    quantity: 3
  },
  {
    title: "M\xEC \u0103n li\u1EC1n v\u1ECB t\xF4m chua cay 75g",
    barcode: "8930000000024",
    unit: "G\xF3i",
    unitPrice: 4500,
    quantity: 5
  }
];
var normalizeBillData = (input = {}) => {
  const template = getBillTemplate(input.templateId);
  const { defaults } = template;
  const items = (input.items?.length ? input.items : SAMPLE_ITEMS).map((item) => ({
    title: item.title ?? "",
    barcode: item.barcode ?? "",
    unit: item.unit ?? "",
    unitPrice: Number(item.unitPrice) || 0,
    quantity: Number(item.quantity) || 0,
    discount: Number(item.discount) || 0
  }));
  return {
    templateId: template.id,
    store: { ...defaults.store, ...input.store, name: input.store?.name || defaults.store.name },
    transaction: {
      ...defaults.transaction,
      dateTime: (/* @__PURE__ */ new Date()).toISOString(),
      ...input.transaction
    },
    items,
    tax: {
      vatRate: DEFAULT_VAT_RATE,
      priceIncludesVat: true,
      ...defaults.tax,
      ...input.tax
    },
    display: {
      fontId: template.fontId,
      fontSize: template.fontSize,
      paperWidth: template.paperWidth,
      seed: randomSeed(),
      language: "vi",
      showQr: true,
      showBarcode: true,
      inkDensity: 1,
      ...input.display,
      watermark: {
        text: WATERMARK_LIMITS.defaultText,
        opacity: WATERMARK_LIMITS.opacity.default,
        size: WATERMARK_LIMITS.size.default,
        angle: WATERMARK_LIMITS.angle.default,
        spacing: WATERMARK_LIMITS.spacing.default,
        ...input.display?.watermark
      }
    },
    footerNote: input.footerNote ?? defaults.footerNote
  };
};

// src/utils/render-bill/to-satori.ts
var import_antd12 = require("antd");
var import_lodash = require("lodash");
var import_react = __toESM(require("react"));
var FORWARD_REF = /* @__PURE__ */ Symbol.for("react.forward_ref");
var MEMO = /* @__PURE__ */ Symbol.for("react.memo");
var FLEX_GAP = { small: 8, middle: 16, large: 24 };
var dropEmpty = (style) => Object.fromEntries(
  Object.entries(style).filter(([, value]) => value !== void 0 && value !== null)
);
var hostProps = (props, style = {}) => {
  const { className, tw, style: ownStyle } = props;
  const rest = (0, import_lodash.omit)(props, ["className", "tw", "style", "children"]);
  const classes = [tw, className].filter(Boolean).join(" ");
  return {
    ...rest,
    ...classes ? { tw: classes } : {},
    style: dropEmpty({ ...style, ...ownStyle })
  };
};
var toSatoriTree = (node) => {
  if (Array.isArray(node)) {
    return node.map((child, index) => {
      const converted = toSatoriTree(child);
      return import_react.default.isValidElement(converted) ? import_react.default.cloneElement(converted, { key: converted.key ?? index }) : converted;
    });
  }
  if (!import_react.default.isValidElement(node)) return node;
  const { type } = node;
  const props = node.props;
  if (type === import_react.default.Fragment) return toSatoriTree(props.children);
  if (type === import_antd12.Flex) {
    const { vertical, wrap, justify, align, flex, gap } = props;
    const rest = (0, import_lodash.omit)(props, ["vertical", "wrap", "justify", "align", "flex", "gap", "component"]);
    return import_react.default.createElement(
      "div",
      hostProps(rest, {
        display: "flex",
        flexDirection: vertical ? "column" : "row",
        flexWrap: wrap === true ? "wrap" : wrap || void 0,
        justifyContent: justify,
        alignItems: align,
        flex,
        gap: typeof gap === "string" ? FLEX_GAP[gap] ?? gap : gap
      }),
      toSatoriTree(props.children)
    );
  }
  if (type === import_antd12.Image) {
    const { src, width, height } = props;
    const rest = (0, import_lodash.omit)(props, ["preview", "fallback", "placeholder", "rootClassName"]);
    return import_react.default.createElement(
      "img",
      hostProps({ ...rest, src, width, height }, { width, height, objectFit: "contain" })
    );
  }
  if (typeof type === "function") {
    return toSatoriTree(type(props));
  }
  const exotic = type;
  if (exotic?.$$typeof === FORWARD_REF) return toSatoriTree(exotic.render(props, null));
  if (exotic?.$$typeof === MEMO) {
    return toSatoriTree(import_react.default.createElement(exotic.type, props));
  }
  return import_react.default.createElement(type, hostProps(props), toSatoriTree(props.children));
};

// src/utils/render-bill/index.ts
var nodeRequire = (0, import_module.createRequire)(import_path.default.join(process.cwd(), "package.json"));
var fontsDir = () => import_path.default.join(process.cwd(), "public", FONTS_BASE_PATH);
var fontCache;
var loadFonts = () => {
  if (fontCache) return fontCache;
  fontCache = Object.values(FONT_PRESETS).flatMap(
    (font) => font.files.map(({ weight, file }) => ({
      name: font.family,
      data: import_fs.default.readFileSync(import_path.default.join(fontsDir(), file)),
      weight,
      style: "normal"
    }))
  );
  return fontCache;
};
var renderBill = async (input, options = {}) => {
  const data = normalizeBillData(input);
  const { paperWidth } = resolveBillView(data);
  const scale = Math.min(4, Math.max(1, Number(options.scale) || 2));
  const satori = nodeRequire("satori").default;
  const tree = toSatoriTree(
    import_react2.default.createElement(BillRenderer_default, { data, withWatermarkOverlay: false })
  );
  const rawSvg = await satori(tree, { width: paperWidth, fonts: loadFonts() });
  const svg = rawSvg.replace(
    /<\/svg>\s*$/,
    `${buildWatermarkMarkup(data.display.watermark)}</svg>`
  );
  if (options.format === "svg") {
    return { data, contentType: "image/svg+xml", body: Buffer.from(svg) };
  }
  const { Resvg } = nodeRequire("@resvg/resvg-js");
  const png = new Resvg(svg, {
    fitTo: { mode: "zoom", value: scale },
    background: "#fdfdfb",
    font: {
      loadSystemFonts: false,
      fontFiles: [import_path.default.join(fontsDir(), "Arimo-Bold.ttf")],
      defaultFontFamily: "Arimo"
    }
  }).render().asPng();
  return { data, contentType: "image/png", body: png };
};

// src/api/bills/render.ts
var MAX_ITEMS = 200;
var decodePayload = (payload) => JSON.parse(
  Buffer.from(payload.replace(/-/g, "+").replace(/_/g, "/"), "base64").toString("utf-8")
);
var first = (value) => Array.isArray(value) ? value[0] : value;
var fromQuery = (query) => {
  const payload = first(query.payload);
  const base = payload ? decodePayload(payload) : {};
  const items = first(query.items);
  return {
    ...base,
    templateId: first(query.template) ?? base.templateId,
    store: {
      ...base.store,
      ...first(query.name) ? { name: first(query.name) } : {},
      ...first(query.logo) ? { logoUrl: first(query.logo) } : {}
    },
    transaction: {
      ...base.transaction,
      ...first(query.cashier) ? { cashier: first(query.cashier) } : {},
      ...first(query.invoice) ? { invoiceNo: first(query.invoice) } : {}
    },
    tax: { ...base.tax, ...first(query.vat) ? { vatRate: Number(first(query.vat)) } : {} },
    display: {
      ...base.display,
      ...first(query.seed) ? { seed: first(query.seed) } : {},
      ...first(query.qr) ? { qrText: first(query.qr) } : {},
      ...first(query.barcode) ? { barcodeText: first(query.barcode) } : {},
      ...first(query.language) === "en" || first(query.language) === "vi" ? { language: first(query.language) } : {}
    },
    items: items ? JSON.parse(items) : base.items,
    scale: first(query.scale),
    format: first(query.format)
  };
};
async function render_default(req, res) {
  try {
    if (first(req.query.list) === "templates") {
      res.status(200).json(
        BILL_TEMPLATES.map(({ id, name, description, printerStyle, fields }) => ({
          id,
          name,
          description,
          printerStyle,
          fields
        }))
      );
      return;
    }
    let input;
    if (req.method === "POST") {
      input = typeof req.body === "string" ? JSON.parse(req.body) : req.body ?? {};
    } else {
      input = fromQuery(req.query);
    }
    if ((input.items?.length ?? 0) > MAX_ITEMS) {
      res.status(400).json({ message: `At most ${MAX_ITEMS} items per bill.` });
      return;
    }
    const { scale, format, ...bill } = input;
    const result = await renderBill(bill, {
      scale: Number(scale) || void 0,
      format: format === "svg" ? "svg" : "png"
    });
    res.status(200).header("Content-Type", result.contentType).header("Cache-Control", "no-store").header("X-Bill-Template", result.data.templateId).header("X-Bill-Seed", String(result.data.display.seed)).end(result.body);
  } catch (error) {
    res.status(400).json({ message: error?.message ?? "Render failed" });
  }
}

// src/.umi-production/api/bills/render.ts
var import_apiRoute = __toESM(require_apiRoute());
var apiRoutes = [{ "path": "catalog/products", "id": "catalog/products", "file": "catalog/products.ts", "absPath": "/catalog/products", "__content": "import type { UmiApiRequest, UmiApiResponse } from '@umijs/max';\n\nimport { stripDiacritics } from '@/components/Bills/helpers/calc';\nimport { BUILT_IN_CATALOG } from '@/const/catalog';\n\nconst fold = (text: string) => stripDiacritics(text).toLowerCase();\n\n/** GET /api/catalog/products?keyword= \u2014 built-in sample products */\nexport default async function (req: UmiApiRequest, res: UmiApiResponse) {\n  const keyword = fold(String(req.query.keyword ?? ''));\n  const products: API.TCatalogProduct[] = BUILT_IN_CATALOG.map((product, index) => ({\n    ...product,\n    id: `built-in:${index}`,\n    source: 'built-in',\n  })).filter(\n    (product) =>\n      !keyword || fold(product.title).includes(keyword) || product.barcode.includes(keyword),\n  );\n  res.status(200).json(products);\n}\n" }, { "path": "bills/render", "id": "bills/render", "file": "bills/render.ts", "absPath": "/bills/render", "__content": "import type { UmiApiRequest, UmiApiResponse } from '@umijs/max';\n\nimport type { TDeepPartialBill } from '@/components/Bills/helpers/normalize';\nimport { BILL_TEMPLATES } from '@/components/Bills/registry';\nimport { renderBill } from '@/utils/render-bill';\n\nconst MAX_ITEMS = 200;\n\nconst decodePayload = (payload: string) =>\n  JSON.parse(\n    Buffer.from(payload.replace(/-/g, '+').replace(/_/g, '/'), 'base64').toString('utf-8'),\n  );\n\nconst first = (value: string | string[] | undefined) => (Array.isArray(value) ? value[0] : value);\n\n/**\n * Query-string shortcuts on top of the full JSON bill:\n *   template, vat, seed, language (vi|en), name, logo (image URL), cashier, invoice, qr, barcode,\n *   scale, format,\n *   items (JSON array)\n */\nconst fromQuery = (\n  query: UmiApiRequest['query'],\n): TDeepPartialBill & { scale?: string; format?: string } => {\n  const payload = first(query.payload);\n  const base: TDeepPartialBill = payload ? decodePayload(payload) : {};\n  const items = first(query.items);\n  return {\n    ...base,\n    templateId: first(query.template) ?? base.templateId,\n    store: {\n      ...base.store,\n      ...(first(query.name) ? { name: first(query.name) } : {}),\n      ...(first(query.logo) ? { logoUrl: first(query.logo) } : {}),\n    },\n    transaction: {\n      ...base.transaction,\n      ...(first(query.cashier) ? { cashier: first(query.cashier) } : {}),\n      ...(first(query.invoice) ? { invoiceNo: first(query.invoice) } : {}),\n    },\n    tax: { ...base.tax, ...(first(query.vat) ? { vatRate: Number(first(query.vat)) } : {}) },\n    display: {\n      ...base.display,\n      ...(first(query.seed) ? { seed: first(query.seed) } : {}),\n      ...(first(query.qr) ? { qrText: first(query.qr) } : {}),\n      ...(first(query.barcode) ? { barcodeText: first(query.barcode) } : {}),\n      ...(first(query.language) === 'en' || first(query.language) === 'vi'\n        ? { language: first(query.language) as 'vi' | 'en' }\n        : {}),\n    },\n    items: items ? JSON.parse(items) : base.items,\n    scale: first(query.scale),\n    format: first(query.format),\n  };\n};\n\n/**\n * GET|POST /api/bills/render \u2192 image/png (or image/svg+xml with format=svg)\n * GET /api/bills/render?list=templates \u2192 available template ids\n */\nexport default async function (req: UmiApiRequest, res: UmiApiResponse) {\n  try {\n    if (first(req.query.list) === 'templates') {\n      res.status(200).json(\n        BILL_TEMPLATES.map(({ id, name, description, printerStyle, fields }) => ({\n          id,\n          name,\n          description,\n          printerStyle,\n          fields,\n        })),\n      );\n      return;\n    }\n\n    let input: TDeepPartialBill & { scale?: string | number; format?: string };\n    if (req.method === 'POST') {\n      // umi has already read the body before calling the handler\n      input = typeof req.body === 'string' ? JSON.parse(req.body) : req.body ?? {};\n    } else {\n      input = fromQuery(req.query);\n    }\n\n    if ((input.items?.length ?? 0) > MAX_ITEMS) {\n      res.status(400).json({ message: `At most ${MAX_ITEMS} items per bill.` });\n      return;\n    }\n\n    const { scale, format, ...bill } = input;\n    const result = await renderBill(bill, {\n      scale: Number(scale) || undefined,\n      format: format === 'svg' ? 'svg' : 'png',\n    });\n\n    res\n      .status(200)\n      .header('Content-Type', result.contentType)\n      .header('Cache-Control', 'no-store')\n      .header('X-Bill-Template', result.data.templateId)\n      .header('X-Bill-Seed', String(result.data.display.seed))\n      .end(result.body);\n  } catch (error: any) {\n    res.status(400).json({ message: error?.message ?? 'Render failed' });\n  }\n}\n" }];
var render_default2 = async (req, res) => {
  const umiReq = new import_apiRoute.UmiApiRequest(req, apiRoutes);
  await umiReq.readBody();
  const umiRes = new import_apiRoute.UmiApiResponse(res);
  await new Promise((resolve) => middlewares_default(umiReq, umiRes, resolve));
  await render_default(umiReq, umiRes);
};
