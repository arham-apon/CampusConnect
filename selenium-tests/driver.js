const { Builder } = require("selenium-webdriver");
const chrome = require("selenium-webdriver/chrome");

const BASE_URL = process.env.BASE_URL || "http://localhost:5173";

async function buildDriver() {
  const options = new chrome.Options();
  if (process.env.HEADLESS !== "false") {
    options.addArguments("--headless=new");
  }
  options.addArguments("--window-size=1280,900", "--disable-gpu");

  return new Builder().forBrowser("chrome").setChromeOptions(options).build();
}

module.exports = { buildDriver, BASE_URL };
