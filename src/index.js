"use strict";
var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (_) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
var __rest = (this && this.__rest) || function (s, e) {
    var t = {};
    for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p) && e.indexOf(p) < 0)
        t[p] = s[p];
    if (s != null && typeof Object.getOwnPropertySymbols === "function")
        for (var i = 0, p = Object.getOwnPropertySymbols(s); i < p.length; i++) {
            if (e.indexOf(p[i]) < 0 && Object.prototype.propertyIsEnumerable.call(s, p[i]))
                t[p[i]] = s[p[i]];
        }
    return t;
};
exports.__esModule = true;
exports.iterateRESTAPIExample = exports.buildFigmaUrlWithParameters = exports.scrapeFigmaFile = exports.initRemoteEvalRuntime = exports.getWindowId = exports.getFigmaFileViaRESTAPI = exports.getChromeRemoteDebuggingWebSocketInfo = void 0;
var dotenv = require("dotenv");
var puppeteer = require("puppeteer");
var argparse_1 = require("argparse");
var CProc = require("child_process");
// SETUP
dotenv.config();
// dotenv.config({ path: path.resolve('../.env') })
// dotenv.config({ path: path.resolve(__dirname, '../.env') })
// DEFAULTS
var DEFAULT_FIGMA_FILE_KEY = "AaMB8IZv56Hg2a7ve7BHj7";
var DEFAULT_FIGMA_FILE_URL = "https://www.figma.com/file/".concat(DEFAULT_FIGMA_FILE_KEY, "/Untitled");
var FIGMA_FILE_KEY = process.env.FIGMA_FILE_KEY;
var parser = new argparse_1.ArgumentParser({ description: 'Figma Puppeteer Scraping' });
parser.add_argument('-u', '--url', {
    help: 'The URL of the Figma File [Ex: https://www.figma.com/file/AaMB8IZv56Hg2a7ve7BHj7/Untitled]',
    type: "str",
    required: false
});
parser.add_argument('-e', '--example', {
    help: 'Run using the default example figma file url',
    action: "store_true",
    required: false
});
parser.add_argument('-V', '--fileVersion', {
    help: 'Version # from Figmas version history, usually an epoch time stamp. Ex: 2447069535',
    required: false
});
parser.add_argument('-d', '--debug', {
    help: 'Sets a debug flag',
    action: "store_true",
    required: false
});
parser.add_argument('-t', '--testConnection', {
    help: 'Open the remote WS URL to test [http://127.0.0.1:9222/json/version]',
    required: false
});
var args = parser.parse_args();
// @ts-ignore
var _a = process.argv, _p = _a[0], _n = _a[1], argv = _a.slice(2);
if (argv.length === 0) {
    parser.print_help();
    process.exit();
}
function getChromeRemoteDebuggingWebSocketInfo(wsInfoUrl) {
    return __awaiter(this, void 0, void 0, function () {
        var fetch, url, response;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    fetch = function () {
                        var args = [];
                        for (var _i = 0; _i < arguments.length; _i++) {
                            args[_i] = arguments[_i];
                        }
                        return Promise.resolve().then(function () { return require("node-fetch"); }).then(function (_a) {
                            var fetch = _a["default"];
                            return fetch(args);
                        });
                    };
                    url = wsInfoUrl !== null && wsInfoUrl !== void 0 ? wsInfoUrl : "http://127.0.0.1:9222/json/version";
                    return [4 /*yield*/, fetch(url).then(function (res) { return res.json(); })];
                case 1:
                    response = _a.sent();
                    return [2 /*return*/, response];
            }
        });
    });
}
exports.getChromeRemoteDebuggingWebSocketInfo = getChromeRemoteDebuggingWebSocketInfo;
// https://www.figma.com/developers/api#get-file-nodes-endpoint
function getFigmaFileViaRESTAPI(_a) {
    var fileKey = _a.fileKey, nodeId = _a.nodeId, versionId = _a.versionId, token = _a.token, depth = _a.depth;
    return __awaiter(this, void 0, void 0, function () {
        var fetch, uriBase, qs, url;
        return __generator(this, function (_b) {
            fetch = function () {
                var args = [];
                for (var _i = 0; _i < arguments.length; _i++) {
                    args[_i] = arguments[_i];
                }
                return Promise.resolve().then(function () { return require("node-fetch"); }).then(function (_a) {
                    var fetch = _a["default"];
                    return fetch(args);
                });
            };
            uriBase = "https://api.figma.com/v1/files/".concat(fileKey);
            qs = new URLSearchParams();
            !!depth && qs.set('depth', Number(depth).toString());
            !!nodeId && qs.set('ids', nodeId);
            !!versionId && qs.set('version-id', versionId);
            url = "".concat(uriBase, "?").concat(qs.toString());
            // @TOKEN_ERROR
            // const response = await fetch(url, {
            //   method: 'GET',
            //   headers: {
            //     'X-Figma-Token': `${token}`,
            //     'Accept': '*/*'
            //   },
            // })
            //   .then(res => res.json())
            // return response
            // @WORKING
            return [2 /*return*/, new Promise(function (resolve, reject) {
                    var cmd = "curl --silent -X GET       --header \"X-Figma-Token: ".concat(process.env.FIGMA_FILE_KEY, "\"       ").concat(url);
                    CProc.exec(cmd, function (err, stdout, _stderr) {
                        if (err)
                            reject(err);
                        resolve(JSON.parse(stdout));
                    });
                })];
        });
    });
}
exports.getFigmaFileViaRESTAPI = getFigmaFileViaRESTAPI;
function getWindowId(client) {
    return __awaiter(this, void 0, void 0, function () {
        var windowId;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, client.send('Browser.getWindowForTarget')];
                case 1:
                    windowId = (_a.sent()).windowId;
                    return [2 /*return*/, windowId];
            }
        });
    });
}
exports.getWindowId = getWindowId;
function initRemoteEvalRuntime(page) {
    return __awaiter(this, void 0, void 0, function () {
        var target, client;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    target = page.target();
                    return [4 /*yield*/, target.createCDPSession()];
                case 1:
                    client = _a.sent();
                    return [4 /*yield*/, client.send('Debugger.enable')]; // returns debuggerId
                case 2:
                    _a.sent(); // returns debuggerId
                    return [4 /*yield*/, client.send('Inspector.enable')];
                case 3:
                    _a.sent();
                    return [4 /*yield*/, client.send('Runtime.enable')];
                case 4:
                    _a.sent();
                    return [2 /*return*/, client];
            }
        });
    });
}
exports.initRemoteEvalRuntime = initRemoteEvalRuntime;
function scrapeFigmaFile(url, expression) {
    return __awaiter(this, void 0, void 0, function () {
        var ws, browser, page, client, results;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, getChromeRemoteDebuggingWebSocketInfo()
                    // Connect to running browser
                    // @NOTE Requires starting with certain flags, Ex:
                    // /Applications/Google\ Chrome.app/Contents/MacOS/Google\ Chrome \
                    //   --remote-debugging-port=9222 \
                    //   --no-first-run \
                    //   --no-default-browser-check \
                    //   --user-data-dir=$(mktemp -d -t 'chrome-remote_data_dir')
                ];
                case 1:
                    ws = _a.sent();
                    return [4 /*yield*/, puppeteer.connect({
                            browserWSEndpoint: ws.webSocketDebuggerUrl,
                            ignoreHTTPSErrors: true
                        })
                        // Open a new page in the browser
                    ];
                case 2:
                    browser = _a.sent();
                    return [4 /*yield*/, browser.newPage()
                        // Go the URL and wait for it to finish loading before we start.
                    ];
                case 3:
                    page = _a.sent();
                    // Go the URL and wait for it to finish loading before we start.
                    return [4 /*yield*/, page.goto(url, { waitUntil: 'networkidle0' })
                        // Evaluate things on the DOM. We aren't using this, in this case.
                    ];
                case 4:
                    // Go the URL and wait for it to finish loading before we start.
                    _a.sent();
                    // Evaluate things on the DOM. We aren't using this, in this case.
                    return [4 /*yield*/, page.evaluate(function () {
                            var _a, _b;
                            var body = document.body;
                            var svg = (_b = (_a = body.querySelector('[data-testid="set-tool-default"]')) === null || _a === void 0 ? void 0 : _a.querySelector('span:first-child svg')) === null || _b === void 0 ? void 0 : _b.innerHTML;
                            return svg;
                        })
                        // Initialize remote runtime for in devtool evaluation
                    ];
                case 5:
                    // Evaluate things on the DOM. We aren't using this, in this case.
                    _a.sent();
                    return [4 /*yield*/, initRemoteEvalRuntime(page)
                        // Evaluate an expression in the devools console with the documents runtime enabled
                    ];
                case 6:
                    client = _a.sent();
                    return [4 /*yield*/, client.send('Runtime.evaluate', { expression: expression })["catch"](console.error)];
                case 7:
                    results = _a.sent();
                    return [4 /*yield*/, page.close()];
                case 8:
                    _a.sent();
                    return [2 /*return*/, results];
            }
        });
    });
}
exports.scrapeFigmaFile = scrapeFigmaFile;
function buildFigmaUrlWithParameters(url) {
    var figmaUrl = url !== null && url !== void 0 ? url : DEFAULT_FIGMA_FILE_URL;
    var qs;
    if (args.fileVersion) {
        var _a = figmaUrl.split('?'), base = _a[0], params = _a[1];
        if (params) {
            qs = new URLSearchParams(params);
            qs.set('version-id', args.fileVersion);
            figmaUrl = "".concat(base, "/").concat(qs.toString());
        }
        else {
            qs = new URLSearchParams("?version-id=".concat(args.fileVersion));
            figmaUrl = "".concat(figmaUrl, "/").concat(qs.toString());
        }
    }
    return figmaUrl;
}
exports.buildFigmaUrlWithParameters = buildFigmaUrlWithParameters;
function iterateRESTAPIExample() {
    return __awaiter(this, void 0, void 0, function () {
        var file, recurse, arr, _i, _a, p, _b, _c, c, _d, _e, x;
        return __generator(this, function (_f) {
            switch (_f.label) {
                case 0:
                    dotenv.config({ path: __dirname + '/./../.env' });
                    return [4 /*yield*/, getFigmaFileViaRESTAPI({
                            fileKey: DEFAULT_FIGMA_FILE_KEY,
                            token: process.env.FIGMA_FILE_KEY
                        })
                        // TRY INSTEAD: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Operators/yield
                    ];
                case 1:
                    file = _f.sent();
                    recurse = function (node, arr) { return node.children ? arr.concat(node.children) : arr.push(node); };
                    arr = [];
                    for (_i = 0, _a = file.document.children; _i < _a.length; _i++) {
                        p = _a[_i];
                        arr.push(p);
                        if (p.children) {
                            for (_b = 0, _c = p.children; _b < _c.length; _b++) {
                                c = _c[_b];
                                arr.push(c);
                                if (c.children) {
                                    for (_d = 0, _e = c.children; _d < _e.length; _d++) {
                                        x = _e[_d];
                                        recurse(x, arr);
                                    }
                                }
                            }
                        }
                    }
                    return [2 /*return*/, arr];
            }
        });
    });
}
exports.iterateRESTAPIExample = iterateRESTAPIExample;
// IF CALLING DIRECTLY: Ex: ts-node src/index.ts -u http://figma.com/file/abcXYZ123/MyDocumentName
if (typeof require !== 'undefined' && require.main === module) {
    // console.log(process.env)
    // console.log(args)
    ;
    (function () { return __awaiter(void 0, void 0, void 0, function () {
        var figmaUrl, expression, value, data, transformed;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    // IMPORT ENV VARS
                    dotenv.config({ path: __dirname + '/./../.env' });
                    figmaUrl = buildFigmaUrlWithParameters(args.url);
                    expression = "JSON.stringify(\n      figma.currentPage.findAllWithCriteria({ types: ['TEXT'] })\n        .map(n => ({ id: n.id, text: n.characters }))\n    )";
                    return [4 /*yield*/, scrapeFigmaFile(figmaUrl, expression)];
                case 1:
                    value = (_a.sent()).result.value;
                    data = JSON.parse(value);
                    transformed = data.map(function (_a) {
                        var id = _a.id, n = __rest(_a, ["id"]);
                        return __assign({ url: "".concat(figmaUrl, "?node-id=").concat(encodeURIComponent(id)) }, n);
                    });
                    console.log(transformed);
                    process.exit(0);
                    return [2 /*return*/];
            }
        });
    }); })();
}
