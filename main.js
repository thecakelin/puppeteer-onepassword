const puppeteer = require('puppeteer');
const fs = require('fs');
require('dotenv').config(); // For getting the environment variables in the .env file

// Website to login into
SITE_URL = 'https://facebook.com'
// SITE_URL = 'https://twitter.com'
// SITE_URL = 'https://linkedin.com'

// 1Password Extension ID
EXTENSION_ID = 'aeblfdkhhhdcdjpifhhbdiojplfjncoa';

// Standard path is for MacOS chrome extensions is ~/Library/Application\ Support/Google/Chrome/Default/Extensions/
EXTENSION_PATH = `${process.env.HOME}/Library/Application\ Support/Google/Chrome/Default/Extensions/${EXTENSION_ID}/1.17.0_0`;


async function waitSeconds(seconds) {
    function delay(seconds) {
      return new Promise((resolve) => setTimeout(resolve, seconds * 1000))
    }
    await delay(seconds)
}

(async () => {
    if (!fs.existsSync(EXTENSION_PATH)) {
        console.log('Please install 1Password X Chrome Extension at https://chrome.google.com/webstore/detail/1password-x-%E2%80%93-password-ma/aeblfdkhhhdcdjpifhhbdiojplfjncoa');
        // could probably open a puppeteer browser to install it here
    } else {
        const browser = await puppeteer.launch({
            headless: false,
            args: [
                `--disable-extensions-except=${EXTENSION_PATH}`,
                `--load-extension=${EXTENSION_PATH}`
            ]
        });
        const page = await browser.newPage();

        // This path is from the extension popup, you can find it in the extensions manifest.json (grep default_popup manifest.json)
        await page.goto(`chrome-extension://${EXTENSION_ID}/mini/mini.html`);
        await waitSeconds(2);
        const pages = await browser.pages();

        // Get browser tabs
        const [tabOne, tabTwo, extPage] = pages;
    
        // Sign in to 1Password
        await extPage.click('#signInButton');
        await extPage.waitForNavigation();
        await extPage.type('#email', process.env.ONEPASSWORD_EMAIL);
        await extPage.type('#account-key', process.env.ONEPASSWORD_ACCOUNT_KEY);
        await extPage.type('#master-password', process.env.ONEPASSWORD_MASTER_PASSWORD);
    
        // Non standard keys must be keyboard.press in Puppeteer
        await extPage.keyboard.press('Enter');
        await extPage.waitForNavigation();
    
        //  Check if successfully logged in to 1Password
        const pageContent = await extPage.content();
        const successString = '1Password is ready to go!';
        if (pageContent.includes(successString)) {
            console.log(successString);
        }      
    
        // Navigate to site to login
        await tabOne.goto(SITE_URL);
        await tabOne.bringToFront();
        
        // Get all the links to find the login URL
        console.log(`Finding login URL for ${SITE_URL}`);
        const  links = await tabOne.$$eval('a', els => els.map(el => el.href));
        const loginUrl = links.find(link => link.includes('login'));

        console.log(`Navigating to ${loginUrl}`);
        await tabOne.goto(loginUrl);

        // These keystrokes are opening the 1Password X Extension popover
        await waitSeconds(1);
        await tabOne.keyboard.press('ArrowDown');
        await waitSeconds(2);
        await tabOne.keyboard.press('Enter');
        await waitSeconds(1);
        await tabOne.keyboard.press('Enter');

        await tabOne.waitForNavigation();

        // Optional screenshot
        // await tabOne.screenshot({path: 'ext.png'});
        // await browser.close();
    }
})();