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
// Need to update this to find the version installed
EXTENSION_PATH = `${process.env.HOME}/Library/Application\ Support/Google/Chrome/Default/Extensions/${EXTENSION_ID}/1.18.0_0`;


async function waitSeconds(seconds) {
    function delay(seconds) {
      return new Promise((resolve) => setTimeout(resolve, seconds * 1000))
    }
    await delay(seconds)
}

/* Get all the links to find the login URL
* Login to this site
*
* Arguments
* siteUrl - main url
* tab - which tab will be redirected to this login
* loginType - 1password, facebook, google
*/
async function loginToSite(siteUrl, tab, loginType) {
    // Possible the login is already on this page?
    // Navigate to site to login
    await tab.goto(siteUrl);
    await tab.bringToFront();

    console.log(`Finding login URL for ${siteUrl}`);
    const links = await tab.$$eval('a', els => els.map(el => el.href));
    const loginUrl = links.find( link => link.match(/(log)[\s]*(in)/gi) );
    // const links2 = await tab.$$eval('a[href*=/(log)[\s]*(in)/gi]', els => els.map(el => el.href));
    // console.log("links css regex", links2);

    if (loginUrl) {
        await tab.goto(loginUrl);
        console.log(`Navigating to ${loginUrl}`);
    } else { // Check buttons
        console.log("No login URL found, checking buttons");
        await tab.$$eval('button', els => {
            els.map(el => {
                if (el.textContent.match(/(log)[\s]*(in)/gi)) {
                    el.click();
                    return
                }
            })
        });
        // console.log("Login button found yay!");
        // console.log("BUTTTTTONs", buttons);
        // const loginButton = buttons.find( button => button.match(/(log)[\s]*(in)/gi) );
        // console.log("Button FOUND yahhh", loginButton);
        // await loginButton.click();
    }
    // } else {} 
    // await tab.waitForNavigation();
    // These keystrokes are opening the 1Password X Extension popover
    if (loginType === '1password') {
        await waitSeconds(1);
        await tab.keyboard.press('ArrowDown');
        await waitSeconds(2);
        await tab.keyboard.press('Enter');
        await waitSeconds(1);
        await tab.keyboard.press('Enter');
    } else {
        // Probably need to search for buttons?
        // await waitSeconds(1);
        await tab.waitForNavigation();
        const loginElementsLinks = await tab.$$eval(`a`, els => els.map(el => el.href));
        const loginElements = await tab.$$eval(`a,button`, els => els.map(el => el.textContent));
        console.log(loginElementsLinks);
        console.log(loginElements);
        const loginElement = await tab.$(`a[href*=${loginType}],a[textContent*=${loginType}],button[textContent*=${loginType}]`);
        console.log(loginElement);
        await loginElement.click();
        // loginLinks = await tab.$$eval('a', els => els.map(el => el.href));
        // console.log("login links", loginLinks);
        // const loginTypeLink = links.find(link => link.includes(loginType));
        // console.log("login type links", loginTypeLink);

    }

    await tab.waitForNavigation();
    return;
}

/*
*/
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
        
        // Get 1password accounts
        // await tabTwo.goto('https://my.1password.com/signin');
        // await tabTwo.bringToFront();
    
        // These keystrokes are opening the 1Password X Extension popover
        // await waitSeconds(2);
        // await tabTwo.keyboard.press('ArrowDown');
        // await waitSeconds(2);
        // await tabTwo.keyboard.press('Enter');
        // await waitSeconds(1);
        // await tabTwo.keyboard.press('Enter');

        // await tabTwo.waitForNavigation();
        // const buttons = await tabTwo.$$eval('button.open', els => els.map(el => el.className));
        // console.log(buttons);
        // await page.$$eval('button.open', elements => elements[0].click());
        // page.waitForSelector('button.open', {visible: true}).then(element => {
        //     console.log("UHHHHH");
        //     element.click();
        // });

        // Look for Google or Facebook accounts?

        // Google logins
        // await tabOne.goto('https://accounts.google.com/ServiceLogin');
        // await tabOne.bringToFront();
        // await waitSeconds(2);
        // await tabOne.keyboard.press('ArrowDown');
        // await waitSeconds(2);
        // await tabOne.keyboard.press('Enter');
        
        // await waitSeconds(1);
        // await tabOne.keyboard.press('Enter');
        // await tabOne.waitForNavigation();
        // await waitSeconds(2);
        // await tabOne.keyboard.press('Enter');
        // await tabOne.goto('https://myaccount.google.com/permissions');
        
        // Email subscriptions
        // Emails linked to an account?


        
        // Get all the links to find the login URL
        // console.log(`Finding login URL for ${SITE_URL}`);
        // const links = await tabOne.$$eval('a', els => els.map(el => el.href));
        // const loginUrl = links.find(link => link.includes('login'));

        // console.log(`Navigating to ${loginUrl}`);
        // await tabOne.goto(loginUrl);

        // Optional screenshot
        // await tabOne.screenshot({path: 'yus.png'});
        // await browser.close();

        // await tabThree.goto('https://open.spotify.com/');

        await loginToSite(SITE_URL, tabOne, '1password');
        // Need to make sure the login type has been accessed in order to login to a linked account
        await loginToSite('https://open.spotify.com/', tabTwo, 'facebook');

        await waitSeconds(2);
        await tabTwo.goto('https://open.spotify.com/genre/recently-played');
        await waitSeconds(2);
        // await tabTwo.waitForNavigation();
        console.log(await tabTwo.content());
    }
})();