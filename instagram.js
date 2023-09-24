import * as dotenv from 'dotenv';
import puppeteer from 'puppeteer';

const result = dotenv.config()

if (result.error) {
  throw result.error
}

// console.log(result.parsed)

// require('dotenv').config(); // For getting the environment variables in the .env file

// SITE_URL = 'https://facebook.com';

async function waitSeconds(seconds) {
  function delay(seconds) {
    return new Promise((resolve) => setTimeout(resolve, seconds * 1000))
  }
  await delay(seconds)
}

(async () => {
  // Launch the browser and open a new blank page
  const browser = await puppeteer.launch({headless: false});
  const page = await browser.newPage();

  await page.goto('https://instagram.com');
  // await waitSeconds(5);

  console.log(process.env.INSTAGRAM_USERNAME);

  await page.waitForSelector('input[name="username"]');
  await page.type('input[name="username"]', process.env.INSTAGRAM_USERNAME);

  await page.waitForSelector('input[name="password"]');
  await page.type('input[name="password"]', process.env.INSTAGRAM_PASSWORD);

  await page.waitForSelector('button[type="submit"]');

  const [response] = await Promise.all([
    page.waitForNavigation(),
    page.click('button[type="submit"]')
  ]);

  // Navigate the page to a URL
  await page.goto('https://www.instagram.com/p/CwQ0Bpfs14A/');

  // Set screen size
  await page.setViewport({width: 1080, height: 1024});

  await waitSeconds(2);
  console.log("oh boyyyy");

  // This code is to get a unique class for the comment section
  // const alldivs = await page.$$eval('div', divs => divs.map(div => div.getAttribute("class")));
  // const alldivsf = alldivs
  //   .filter(x => x !== null && x !== '')
  //   .flatMap(x => x.split(" "))
  //   .reduce((count, item) => (count[item] = count[item] + 1 || 1, count), {});
  // console.log(alldivsf);
  // Unique classes for comments: xw2csxc x1odjw0f

  // Check that these classes are unique
  console.log('xw2csxc how MANY?', (await page.$$('div.xw2csxc')).length);
  console.log('x1odjw0f how MANY?', (await page.$$('div.x1odjw0f')).length);
  console.log('xw2csxc span how MANY?', (await page.$$('div.xw2csxc span')).length);
  console.log('x1odjw0f span how MANY?', (await page.$$('div.x1odjw0f span')).length);
  
  // const options = await page.$$eval('span', options => {
  //   return options.map(option => option.textContent);
  // });
  // const spans = await page.$$eval('div[class="xw2csxc"] > span', elements => elements.map(el => el.innerText));
  await page.waitForSelector('.xw2csxc');
  const spans = await page.$$eval('div.xw2csxc span', elements => 
      elements.map(el => {
        // console.log(el.attributes);
        // if (el.hasAttributes()) {
        // const attrs = Object.keys(el.attributes).forEach(key => el.attributes[key]);
        // }
        return {
          class: el.getAttribute("class"), 
          text: el.textContent, 
          attributes: Object.entries(el.attributes)
        }
      })
  );
  await waitSeconds(2);
  console.log(spans);

  // spans.forEach(async sp => {
  //   if (sp.text.includes("View all")) {
  //     await page
  //   }
  // })
  // console.log(spans.filter(x => x.class.includes("1fhwpqd")));

  const alldivs = await page.$$eval('div.xw2csxc span:empty', divs => divs.map(div => div.getAttribute("class")));
  const alldivsf = alldivs
    .filter(x => x !== null && x !== '')
    .flatMap(x => x.split(" "))
    .reduce((count, item) => (count[item] = count[item] + 1 || 1, count), {});
  console.log(alldivsf);

  // Unique for replies? x1fhwpqd x1s688f x1roi4f4 x1s3etm8 x676frb 
  // 38 38 53 38 38
  ["x1fhwpqd", "x1s688f", "x1s3etm8", "x676frb"].forEach(async x => {
    console.log(x + " span how MANY?", (await page.$$("div.xw2csxc span." + x)).length);
  });
  

  // const spans2 = await page.$$eval('div.x1odjw0f span', elements => elements.map(el => el.textContent));
  // await waitSeconds(2);
  // console.log(spans2);

  await waitSeconds(25);

  await browser.close();
})();
