// CREDIT: KalmarCTF
const puppeteer = require('puppeteer')


const FLAG = process.env.FLAG || 'ctf{test_flag}';
const DOMAIN = process.env.DOMAIN || 'http://localhost:7001/';

function sleep(ms) {
	return new Promise(res => setTimeout(res, ms));
}

async function visitUrl(url) {
	const browser = await puppeteer.launch({
		headless: 'new',
		args: ['--no-sandbox', '--disable-setuid-sandbox']
	});




	try {
		const page = await browser.newPage();

		// Set flag cookie
		await page.setCookie({
			name: 'flag',
			value: FLAG,
			domain: new URL(DOMAIN).hostname,
		});
		console.log(new URL(DOMAIN).hostname);
		page.setDefaultNavigationTimeout(3000);
		console.log("balling")
		await page.goto(url, {
			waitUntil: 'networkidle0',
		});
		console.log("end balling");
		let stuff = await page.content();
		console.log(stuff);
		fs.writeFileSync("index.html", stuff);
	} catch (err) {
		console.log(err);
		// Catches timeout error
	} finally {
		console.log("we done?????");
		await browser.close();
	}
}

module.exports = {
	visitUrl
}
