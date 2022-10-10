import * as puppeteer from 'puppeteer'
import { ArgumentParser } from 'argparse'


const DEFAULT_FIGMA_FILE_URL = `https://www.figma.com/file/AaMB8IZv56Hg2a7ve7BHj7/Untitled`

const parser = new ArgumentParser({ description: 'Figma Puppeteer Scraping' })
      parser.add_argument('-u', '--url', { 
        help: 'The URL of the Figma File [Ex: https://www.figma.com/file/AaMB8IZv56Hg2a7ve7BHj7/Untitled]', 
        type: "str",
        required: false
      })
      parser.add_argument('-e', '--example', {
        help: 'Run using the default example figma file url',
        action: "store_true",
        required: false
      })
      parser.add_argument('-t', '--testConnection', {
        help: 'Open the remote WS URL to test [http://127.0.0.1:9222/json/version]',
        required: false
      })
       
const args = parser.parse_args()

// @ts-ignore
const [ _p, _n, ...argv ] = process.argv

if ( argv.length === 0) {
  parser.print_help()
  process.exit()
}


export interface ChromeWSInfoResponse {
  'Browser': 'string',
  'Protocol-Version': string,
  'User-Agent': string,
  'V8-Version': string,
  'WebKit-Version': string
  'webSocketDebuggerUrl': string
}

export async function getChromeRemoteDebuggingWebSocketInfo(wsInfoUrl?: string) {
  const fetch = (...args: any) => import("node-fetch").then(({ default: fetch }) => fetch(args))
  const url = wsInfoUrl ?? `http://127.0.0.1:9222/json/version`
  const response = await fetch(url).then(res => res.json()) as ChromeWSInfoResponse
  return response
}


export async function getWindowId(client: puppeteer.CDPSession) {
  const {windowId} = await client.send('Browser.getWindowForTarget')
  return windowId
}

export async function initRemoteEvalRuntime(page: puppeteer.Page) {

  const target = page.target()
  const client = await target.createCDPSession()
  
  await client.send('Debugger.enable') // returns debuggerId
  await client.send('Inspector.enable')
  await client.send('Runtime.enable')
  
  return client
}


export async function scrapeFigmaFile(url :string, expression: string) {
  
  // Get our websocket debugging url 
  // @NOTE This supposes you have already opened chrome with remote-debugging enabled
  const ws = await getChromeRemoteDebuggingWebSocketInfo()
  
  // Connect to running browser
  // @NOTE Requires starting with certain flags, Ex:
  // /Applications/Google\ Chrome.app/Contents/MacOS/Google\ Chrome \
  //   --remote-debugging-port=9222 \
  //   --no-first-run \
  //   --no-default-browser-check \
  //   --user-data-dir=$(mktemp -d -t 'chrome-remote_data_dir')
  const browser = await puppeteer.connect({
    browserWSEndpoint: ws.webSocketDebuggerUrl,
    ignoreHTTPSErrors: true
  })

  // Open a new page in the browser
  const page = await browser.newPage()

  // Go the URL and wait for it to finish loading before we start.
  await page.goto(url, { waitUntil: 'networkidle0' })

  // Evaluate things on the DOM. We aren't using this, in this case.
  await page.evaluate(() => {
    const body = document.body
    const svg = (body.querySelector('[data-testid="set-tool-default"]')
                  ?.querySelector('span:first-child svg') as SVGElement)?.innerHTML
    return svg
  })
  
  // Initialize remote runtime for in devtool evaluation
  const client = await initRemoteEvalRuntime(page)
  
  // Evaluate an expression in the devools console with the documents runtime enabled
  let results = await client.send('Runtime.evaluate', { expression }).catch(console.error)

  return results as puppeteer.Protocol.Runtime.EvaluateResponse
}


// IF CALLING DIRECTLY: Ex: ts-node src/index.ts -u http://figma.com/file/abcXYZ123/MyDocumentName
if (typeof require !== 'undefined' && require.main === module) {


  ;(async () => {
    
    const figmaUrl = args.url ?? DEFAULT_FIGMA_FILE_URL

    // Our script to evaluate in console
    const expression = `JSON.stringify(
      figma.currentPage.findAllWithCriteria({ types: ['TEXT'] })
        .map(n => ({ id: n.id, text: n.characters }))
    )`

    const { result: { value } } = await scrapeFigmaFile(figmaUrl, expression)
    const data = JSON.parse(value)

    const transformed = data.map(({ id, ...n }) => {
      return {
        url: `${figmaUrl}?node-id=${encodeURIComponent(id)}`,
        ...n
      }
    })

    console.log(transformed)

    process.exit(0)
  })()
}

