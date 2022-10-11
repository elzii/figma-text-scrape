"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
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
Object.defineProperty(exports, "__esModule", { value: true });
exports.iterateRESTAPIExample = exports.buildFigmaUrlWithParameters = exports.scrapeFigmaFile = exports.initRemoteEvalRuntime = exports.getWindowId = exports.getFigmaFileViaRESTAPI = exports.getChromeRemoteDebuggingWebSocketInfo = void 0;
const dotenv = __importStar(require("dotenv"));
const puppeteer = __importStar(require("puppeteer"));
const argparse_1 = require("argparse");
const CProc = __importStar(require("child_process"));
// SETUP
dotenv.config();
// dotenv.config({ path: path.resolve('../.env') })
// dotenv.config({ path: path.resolve(__dirname, '../.env') })
// DEFAULTS
const DEFAULT_FIGMA_FILE_KEY = `AaMB8IZv56Hg2a7ve7BHj7`;
const DEFAULT_FIGMA_FILE_URL = `https://www.figma.com/file/${DEFAULT_FIGMA_FILE_KEY}/Untitled`;
const FIGMA_FILE_KEY = process.env.FIGMA_FILE_KEY;
const parser = new argparse_1.ArgumentParser({ description: 'Figma Puppeteer Scraping' });
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
const args = parser.parse_args();
// @ts-ignore
const [_p, _n, ...argv] = process.argv;
if (argv.length === 0) {
    parser.print_help();
    process.exit();
}
function getChromeRemoteDebuggingWebSocketInfo(wsInfoUrl) {
    return __awaiter(this, void 0, void 0, function* () {
        const fetch = (...args) => import("node-fetch").then(({ default: fetch }) => fetch(args));
        const url = wsInfoUrl !== null && wsInfoUrl !== void 0 ? wsInfoUrl : `http://127.0.0.1:9222/json/version`;
        const response = yield fetch(url).then(res => res.json());
        return response;
    });
}
exports.getChromeRemoteDebuggingWebSocketInfo = getChromeRemoteDebuggingWebSocketInfo;
// https://www.figma.com/developers/api#get-file-nodes-endpoint
function getFigmaFileViaRESTAPI({ fileKey, nodeId, versionId, token, depth }) {
    return __awaiter(this, void 0, void 0, function* () {
        const fetch = (...args) => import("node-fetch").then(({ default: fetch }) => fetch(args));
        const uriBase = `https://api.figma.com/v1/files/${fileKey}`;
        const qs = new URLSearchParams();
        !!depth && qs.set('depth', Number(depth).toString());
        !!nodeId && qs.set('ids', nodeId);
        !!versionId && qs.set('version-id', versionId);
        const url = `${uriBase}?${qs.toString()}`;
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
        return new Promise((resolve, reject) => {
            const cmd = `curl --silent -X GET \
      --header "X-Figma-Token: ${process.env.FIGMA_FILE_KEY}" \
      ${url}`;
            CProc.exec(cmd, (err, stdout, _stderr) => {
                if (err)
                    reject(err);
                resolve(JSON.parse(stdout));
            });
        });
    });
}
exports.getFigmaFileViaRESTAPI = getFigmaFileViaRESTAPI;
function getWindowId(client) {
    return __awaiter(this, void 0, void 0, function* () {
        const { windowId } = yield client.send('Browser.getWindowForTarget');
        return windowId;
    });
}
exports.getWindowId = getWindowId;
function initRemoteEvalRuntime(page) {
    return __awaiter(this, void 0, void 0, function* () {
        const target = page.target();
        const client = yield target.createCDPSession();
        yield client.send('Debugger.enable'); // returns debuggerId
        yield client.send('Inspector.enable');
        yield client.send('Runtime.enable');
        return client;
    });
}
exports.initRemoteEvalRuntime = initRemoteEvalRuntime;
function scrapeFigmaFile(url, expression) {
    return __awaiter(this, void 0, void 0, function* () {
        // Get our websocket debugging url 
        // @NOTE This supposes you have already opened chrome with remote-debugging enabled
        const ws = yield getChromeRemoteDebuggingWebSocketInfo();
        // Connect to running browser
        // @NOTE Requires starting with certain flags, Ex:
        // /Applications/Google\ Chrome.app/Contents/MacOS/Google\ Chrome \
        //   --remote-debugging-port=9222 \
        //   --no-first-run \
        //   --no-default-browser-check \
        //   --user-data-dir=$(mktemp -d -t 'chrome-remote_data_dir')
        const browser = yield puppeteer.connect({
            browserWSEndpoint: ws.webSocketDebuggerUrl,
            ignoreHTTPSErrors: true
        });
        // Open a new page in the browser
        const page = yield browser.newPage();
        // Go the URL and wait for it to finish loading before we start.
        yield page.goto(url, { waitUntil: 'networkidle0' });
        // Evaluate things on the DOM. We aren't using this, in this case.
        yield page.evaluate(() => {
            var _a, _b;
            const body = document.body;
            const svg = (_b = (_a = body.querySelector('[data-testid="set-tool-default"]')) === null || _a === void 0 ? void 0 : _a.querySelector('span:first-child svg')) === null || _b === void 0 ? void 0 : _b.innerHTML;
            return svg;
        });
        // Initialize remote runtime for in devtool evaluation
        const client = yield initRemoteEvalRuntime(page);
        // Evaluate an expression in the devools console with the documents runtime enabled
        let results = yield client.send('Runtime.evaluate', { expression }).catch(console.error);
        yield page.close();
        return results;
    });
}
exports.scrapeFigmaFile = scrapeFigmaFile;
function buildFigmaUrlWithParameters(url) {
    let figmaUrl = url !== null && url !== void 0 ? url : DEFAULT_FIGMA_FILE_URL;
    let qs;
    if (args.fileVersion) {
        let [base, params] = figmaUrl.split('?');
        if (params) {
            qs = new URLSearchParams(params);
            qs.set('version-id', args.fileVersion);
            figmaUrl = `${base}/${qs.toString()}`;
        }
        else {
            qs = new URLSearchParams(`?version-id=${args.fileVersion}`);
            figmaUrl = `${figmaUrl}/${qs.toString()}`;
        }
    }
    return figmaUrl;
}
exports.buildFigmaUrlWithParameters = buildFigmaUrlWithParameters;
function iterateRESTAPIExample() {
    return __awaiter(this, void 0, void 0, function* () {
        dotenv.config({ path: __dirname + '/./../.env' });
        const file = yield getFigmaFileViaRESTAPI({
            fileKey: DEFAULT_FIGMA_FILE_KEY,
            token: process.env.FIGMA_FILE_KEY,
        });
        // TRY INSTEAD: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Operators/yield
        const recurse = (node, arr) => node.children ? arr.concat(node.children) : arr.push(node);
        let arr = [];
        for (let p of file.document.children) {
            arr.push(p);
            if (p.children) {
                for (let c of p.children) {
                    arr.push(c);
                    if (c.children) {
                        for (let x of c.children) {
                            recurse(x, arr);
                        }
                    }
                }
            }
        }
        return arr;
    });
}
exports.iterateRESTAPIExample = iterateRESTAPIExample;
// IF CALLING DIRECTLY: Ex: ts-node src/index.ts -u http://figma.com/file/abcXYZ123/MyDocumentName
if (typeof require !== 'undefined' && require.main === module) {
    // console.log(process.env)
    // console.log(args)
    ;
    (() => __awaiter(void 0, void 0, void 0, function* () {
        // IMPORT ENV VARS
        dotenv.config({ path: __dirname + '/./../.env' });
        const figmaUrl = buildFigmaUrlWithParameters(args.url);
        // Our script to evaluate in console
        const expression = `JSON.stringify(
      figma.currentPage.findAllWithCriteria({ types: ['TEXT'] })
        .map(n => ({ id: n.id, text: n.characters }))
    )`;
        const { result: { value } } = yield scrapeFigmaFile(figmaUrl, expression);
        const data = JSON.parse(value);
        const transformed = data.map((_a) => {
            var { id } = _a, n = __rest(_a, ["id"]);
            return Object.assign({ url: `${figmaUrl}?node-id=${encodeURIComponent(id)}` }, n);
        });
        console.log(transformed);
        process.exit(0);
    }))();
}
