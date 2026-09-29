const { By, until } = require('selenium-webdriver');
const { buildDriver, BASE_URL } = require('./driver');

describe('Lost & Found public route', () => {
  let driver;

  beforeAll(async () => {
    driver = await buildDriver();
  }, 30000);

  afterAll(async () => {
    if (driver) await driver.quit();
  });

  test('renders the "Lost & Found" heading and item tabs', async () => {
    await driver.get(`${BASE_URL}/lost-found`);

    const heading = await driver.wait(
      until.elementLocated(By.xpath("//h1[contains(text(), 'Lost & Found')]")),
      10000
    );
    await driver.wait(until.elementIsVisible(heading), 5000);
    expect(await heading.getText()).toBe('Lost & Found');

    const allTab = await driver.findElement(
      By.xpath("//button[contains(text(), 'Lost Items')]")
    );
    const myTab = await driver.findElement(
      By.xpath("//button[contains(text(), 'My Items')]")
    );
    expect(await allTab.isDisplayed()).toBe(true);
    expect(await myTab.isDisplayed()).toBe(true);
  });
});
