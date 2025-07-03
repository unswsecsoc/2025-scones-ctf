// Modified from CTF-XSS-BOT
const { chromium, firefox, webkit } = require('playwright');
const fs = require('fs');
const path = require('path');

const CONFIG = {
    APPNAME: "Admin",
    APPURL: "http://127.17.0.1",
    APPURLREGEX: "^.*$",
    APPFLAG: "SCONES{cLi3nt_s1de_$anit1sati0n}",
    APPLIMITTIME: Number(process.env['APPLIMITTIME'] || "60"),
    APPLIMIT: Number(process.env['APPLIMIT'] || "5"),
    APPBROWSER: 'chromium'
};

console.table(CONFIG);

function sleep(s) {
    return new Promise((resolve) => setTimeout(resolve, s));
}

const browserArgs = {
    headless: (() => {
        const is_x11_exists = fs.existsSync('/tmp/.X11-unix');
        if (process.env['DISPLAY'] !== undefined && is_x11_exists) {
            return false;
        }
        return true;
    })(),
    args: [
        '--disable-dev-shm-usage',
        '--no-sandbox',
        '--disable-setuid-sandbox',
        '--disable-gpu',
        '--no-gpu',
        '--disable-default-apps',
        '--disable-translate',
        '--disable-device-discovery-notifications',
        '--disable-software-rasterizer',
        '--disable-xss-auditor',
        ...(() => {
            if (CONFIG.APPEXTENSIONS === "") return [];
            return [
                `--disable-extensions-except=${CONFIG.APPEXTENSIONS}`,
                `--load-extension=${CONFIG.APPEXTENSIONS}`
            ];
        })(),
    ],
    ignoreHTTPSErrors: true
};

/** @type {import('playwright').Browser} */
let initBrowser = null;

async function getContext() {
    /** @type {import('playwright').BrowserContext} */
    let context = null;

    const flagParams = {
        userAgent: CONFIG.APPFLAG
    }

    // if (CONFIG.APPEXTENSIONS === "") {
    if (initBrowser === null) {
        initBrowser = await (CONFIG.APPBROWSER === 'firefox' ? firefox.launch(browserArgs) : chromium.launch(browserArgs));
    }
    context = await initBrowser.newContext(flagParams);
    // } else {
    // context = await (CONFIG.APPBROWSER === 'firefox' ? firefox.launch({ browserArgs }) : chromium.launch(browserArgs)).newContext(flagParams);
    // }
    return context
}

console.log("Bot started...");

module.exports = {
    name: CONFIG.APPNAME,
    urlRegex: CONFIG.APPURLREGEX,
    rateLimit: {
        windowS: CONFIG.APPLIMITTIME,
        max: CONFIG.APPLIMIT
    },
    bot: async (saveData) => {
        const context = await getContext()
        try {
            const page = await context.newPage();
            // await context.addCookies([{
            //     name: "flag",
            //     httpOnly: false,
            //     value: CONFIG.APPFLAG,
            //     url: CONFIG.APPURL
            // }]);

            saveData = atob(saveData);

            await context.addInitScript((saveData) => {
                localStorage.setItem("dodecaSave", saveData);
            }, saveData)

            console.log(`bot using ${saveData}`);
            await page.goto('localhost:9999', {
                waitUntil: 'load',
                timeout: 10 * 1000
            });
            await sleep(15000);

            console.log("browser close...");
            return true;
        } catch (e) {
            console.error(e);
            return false;
        } finally {
            // if (CONFIG.APPEXTENSIONS !== "") {
            // await context.browser().close();
            // } else {
            await context.close();
            // }
        }
    }
};
