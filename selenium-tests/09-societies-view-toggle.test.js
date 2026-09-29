const { By, until } = require('selenium-webdriver');
const { buildDriver, BASE_URL } = require('./driver');

describe('Societies view toggle', () => {
  let driver;

  beforeAll(async () => {
    driver = await buildDriver();
  }, 30000);

  afterAll(async () => {
    if (driver) await driver.quit();
  });

  test('switches from the Societies grid to the Calendar view', async () => {
    await driver.get(`${BASE_URL}/societies`);

    const heading = await driver.wait(
      until.elementLocated(By.xpath("//h1[contains(text(), 'Societies & Events')]")),
      10000
    );
    await driver.wait(until.elementIsVisible(heading), 5000);

    const calendarButton = await driver.findElement(
      By.xpath("//button[contains(., 'Calendar')]")
    );
    await calendarButton.click();

    await driver.wait(async () => {
      const cls = await calendarButton.getAttribute('class');
      return cls.includes('from-[#e50914]');
    }, 5000);

    const activeClass = await calendarButton.getAttribute('class');
    expect(activeClass).toContain('from-[#e50914]');
  });
});
