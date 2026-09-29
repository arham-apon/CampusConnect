const { By, until } = require("selenium-webdriver");
const { buildDriver, BASE_URL } = require("./driver");

describe("Medical Support tabs", () => {
  let driver;

  beforeAll(async () => {
    driver = await buildDriver();
  }, 30000);

  afterAll(async () => {
    if (driver) await driver.quit();
  });

  test("switches from Emergency Contacts to Blood Bank on click", async () => {
    await driver.get(`${BASE_URL}/medical-support`);

    const heading = await driver.wait(
      until.elementLocated(
        By.xpath("//h1[contains(text(), 'Campus Blood Support')]"),
      ),
      10000,
    );
    await driver.wait(until.elementIsVisible(heading), 5000);

    const bloodBankTab = await driver.findElement(
      By.xpath("//button[contains(text(), 'Blood Bank')]"),
    );
    await bloodBankTab.click();

    await driver.wait(async () => {
      const cls = await bloodBankTab.getAttribute("class");
      return cls.includes("from-[#e50914]");
    }, 5000);

    const activeClass = await bloodBankTab.getAttribute("class");
    expect(activeClass).toContain("from-[#e50914]");
  });
});
