const { By, until } = require('selenium-webdriver');
const { buildDriver, BASE_URL } = require('./driver');

describe('Accommodation / Roommate Wanted public route', () => {
  let driver;

  beforeAll(async () => {
    driver = await buildDriver();
  }, 30000);

  afterAll(async () => {
    if (driver) await driver.quit();
  });

  test('renders the "Non-Residential Support" heading', async () => {
    await driver.get(`${BASE_URL}/accommodation`);

    const heading = await driver.wait(
      until.elementLocated(By.xpath("//h1[contains(text(), 'Non-Residential Support')]")),
      10000
    );
    await driver.wait(until.elementIsVisible(heading), 5000);
    expect(await heading.getText()).toBe('Non-Residential Support');
  });
});
