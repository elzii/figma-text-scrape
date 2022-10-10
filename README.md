## Figma Puppeteer Scraping


## URLs
- https://www.npmjs.com/package/argparse
- https://medium.com/@jaredpotter1/connecting-puppeteer-to-existing-chrome-window-8a10828149e0
- ws://localhost:9222/devtools/browser/41a0b5f0–6747–446a-91b6–5ba30c87e951


## Meow

```js
const cli = meow(`
  Usage
    $ twitch <cmd>

  Commands
    list live
    list vods
    list clips
    

  Flags
    --pretty  Print the list in a nicer format, when available.

  Examples
    $ twitch list live --pretty
`, 
// @ts-ignore
{
  flags: {
    url: {
      type: "string",
      alias: 'u',
      default: DEFAULT_URL,
      isMultiple: false,
      isRequired: true
    },
    remoteDebug: {
      type: "boolean",
      alias: "r",
      isRequired: false
    }
  }
})



```


## Unused JS

```js
// const scriptResponse = await client.send('Runtime.runScript', {
//   scriptId: 'figma-scraper',
//   awaitPromise: true,
// })
// minimize
// await client.send('Browser.setWindowBounds', {windowId, bounds: {windowState: 'minimized'}});

// intercept(page, urrns, transform)
// browser.on('targetcreated', async (target) => {
//   const page = await target.page()
//   console.log('TAGET CREATED, INTERCEPT?', page)
// })


// in page eval
const scriptEl = document.createElement('script')
      scriptEl.id = 'figma-scraper'
      scriptEl.innerHTML = `console.log('figma',figma)`

document.body.appendChild(scriptEl)
const scripts = body.querySelectorAll('script')

const s = document.querySelector('#figma-scraper')

console.log(scriptEl.innerHTML, s?.innerHTML)


// Puppeteer browser create instead of connect
// headless:false, 
// defaultViewport:null,
// devtools: true,
// args: ['--window-size=1920,1170','--window-position=0,0']




// INTERCEPTION




const requestCache = new Map();

const urlPatterns = [
  '*'
]

function transform(source) {
  return prettier.format(source, {parser:'babel'});
}


async function intercept(page, patterns, transform) {
  const client = await page.target().createCDPSession();

  await client.send('Network.enable');

  await client.send('Network.setRequestInterception', { 
    patterns: patterns.map(pattern => ({
      urlPattern: pattern, resourceType: 'Script', interceptionStage: 'HeadersReceived'
    }))
  });

  client.on('Network.requestIntercepted', async ({ interceptionId, request, responseHeaders, resourceType }) => {
    console.log(`Intercepted ${request.url} {interception id: ${interceptionId}}`);

    const response = await client.send('Network.getResponseBodyForInterception',{ interceptionId });

    const contentTypeHeader = Object.keys(responseHeaders).find(k => k.toLowerCase() === 'content-type');
    // @ts-ignore
    let newBody, contentType = responseHeaders[contentTypeHeader];

    if (requestCache.has(response.body)) {
      newBody = requestCache.get(response.body);
    } else {
      const bodyData = response.base64Encoded ? atob(response.body) : response.body;
      try {
        if (resourceType === 'Script') newBody = transform(bodyData, { parser: 'babel' });
        else newBody === bodyData
      } catch(e) {
        console.log(`Failed to process ${request.url} {interception id: ${interceptionId}}: ${e}`);
        newBody = bodyData
      }
  
      requestCache.set(response.body, newBody);
    }

    const newHeaders = [
      'Date: ' + (new Date()).toUTCString(),
      'Connection: closed',
      'Content-Length: ' + newBody.length,
      'Content-Type: ' + contentType
    ];

    console.log(`Continuing interception ${interceptionId}`)
    client.send('Network.continueInterceptedRequest', {
      interceptionId,
      rawResponse: btoa('HTTP/1.1 200 OK' + '\r\n' + newHeaders.join('\r\n') + '\r\n\r\n' + newBody)
    });
  });
}
```
