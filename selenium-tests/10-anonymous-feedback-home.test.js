const { By, until } = require('selenium-webdriver');
const { buildDriver, BASE_URL } = require('./driver');

describe('Anonymous Feedback home route', () => {
  let driver;

  beforeAll(async () => {
    driver = await buildDriver();
  }, 30000);

  afterAll(async () => {
    if (driver) await driver.quit();
  });

  test('renders the "Anonymous Feedback" heading', async () => {
    await driver.get(`${BASE_URL}/home`);

    const heading = await driver.wait(
      until.elementLocated(By.xpath("//h1[contains(text(), 'Anonymous Feedback')]")),
      10000
    );
    await driver.wait(until.elementIsVisible(heading), 5000);
    expect(await heading.getText()).toBe('Anonymous Feedback');
  });
});
