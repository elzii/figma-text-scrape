import prettier from 'prettier'
import puppeteer from 'puppeteer'
import { ArgumentParser } from 'argparse'
import * as ChildProcess from 'child_process'
// const fetch = import('node-fetch').then(module => module.default)
const fetch = (...args: any) => import("node-fetch").then(({ default: fetch }) => fetch(args))

// @ts-ignore
// const [_p, _n, ...args] = process.argv

// const DEFAULT_URL = `https://www.figma.com/file/OpAbJf3YnYAvhUw2jtRFUy/TV-MVP`
const DEFAULT_URL = `https://www.figma.com/file/AaMB8IZv56Hg2a7ve7BHj7/Untitled`
const DEFAULT_WS_INFO_URL = `http://127.0.0.1:9222/json/version`
let WS_DEBUGGER_URL: string = '',
    FIGMA_TEXT_ARR: any[] = []

const parser = new ArgumentParser({
  description: 'Figma Puppeteer Scraping'
})

parser.add_argument('-u', '--url', { 
  help: 'The URL of the Figma File', 
  default: DEFAULT_URL,
  required: false
})
parser.add_argument('-r', '--remoteDebug', { 
  help: 'Whether to use a remote chrome debugging instance.',
  required: false
})
parser.add_argument('-t', '--testConnection', {
  help: 'Open the remote WS URL to test [http://127.0.0.1:9222/json/version]',

  required: false
})
 
const args = parser.parse_args()

interface ChromeWSInfoResponse {
  'Browser': 'string',
  'Protocol-Version': string,
  'User-Agent': string,
  'V8-Version': string,
  'WebKit-Version': string
  'webSocketDebuggerUrl': string
}
async function getChromeRemoteDebuggingWebSocket() {
  try {
    const response = await fetch(DEFAULT_WS_INFO_URL).then(res => res.json()) as ChromeWSInfoResponse
    WS_DEBUGGER_URL = response.webSocketDebuggerUrl
    return response
  } catch (ex: any) {
    console.error(ex.toString())
    return null
  }
}

async function initializeCDP(page) {
  return await page.target().createCDPSession()
}

async function main(url: string, wsUrl: string) {
  let results: any

  if ( url ) {
    // const browser = await puppeteer.launch()
    const browser = await puppeteer.connect({
      // devtools: true,
      browserWSEndpoint: wsUrl,
      ignoreHTTPSErrors: true
    })
    const page = await browser.newPage()
    await page.goto(url, {
      waitUntil: 'networkidle0',
      // waitUntil: 'domcontentloaded'
    })

    // const page = (await browser.pages())[0];

    await initializeCDP(page)
    // await initalizeCDP(browser.pages()[0])
    
    // SETUP DEVTOOLS PROTOCOL
    browser.on('targetcreated', async (target) => {
      const p = await target.page()
      await initializeCDP(p)
      
    })

    // EVAL SOMETHING IN PAGE DOM
    // results = await page.evaluate(() => {
    //   const svg = document.querySelector('[data-testid="set-tool-default"]')?.querySelector('span:first-child svg') as SVGElement
    //   return svg.innerHTML
    // })

    browser.disconnect()

    return results
  } else {
    return null
  }
}

;(async () => {
  console.dir(args)

  args.testConnection && ChildProcess.execSync(`open ${DEFAULT_WS_INFO_URL}`)

  await getChromeRemoteDebuggingWebSocket()

  const res = await main(args.url, WS_DEBUGGER_URL)
  console.log(res)

})()
