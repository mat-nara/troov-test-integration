const { chromium, firefox, webkit, devices } = require('@playwright/test');
const config = require('../../../../config/env.js');

let browser, context, page;

async function initializeBrowser() {
  var browserType = config.browserName;
  var headless = config.headless;
  var mobileDevice = config.mobileDevice;

  if (!browser) {
    if (mobileDevice) {
      // If a mobile device is provided, use Playwright's device descriptors
      const device = devices[mobileDevice];
      
      if (!device) {
        throw new Error(`Mobile device "${mobileDevice}" is not a valid Playwright device.`);
      }

      browser = await chromium.launch({ headless: headless });
      context = await browser.newContext({
        ...device, // Apply mobile device emulation settings
      });
      page = await context.newPage();
    } else {
      // If no mobile device is specified, launch as usual (desktop browser)
      switch (browserType) {
        case 'firefox':
          browser = await firefox.launch({ headless: headless });
          break;
        case 'webkit': // WebKit is for Safari
          browser = await webkit.launch({ headless: headless });
          break;
        case 'chromium':
        default:
          browser = await chromium.launch({ headless: headless });
          break;
      }
      context = await browser.newContext(); 
      page = await context.newPage(); 
    }
  }
  return { browser, context, page };
}

async function closeBrowser() {
  if (browser) {
    await browser.close(); 
    browser = null; 
  }
}

module.exports = { initializeBrowser, closeBrowser };
