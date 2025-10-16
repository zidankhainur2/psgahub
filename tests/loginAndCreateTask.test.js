// File: e2e.test.js
// Deskripsi: Menguji alur login dan pembuatan tugas baru di PSGA menggunakan Selenium.

const { Builder, By, until } = require("selenium-webdriver");
const chrome = require("selenium-webdriver/chrome");
require("chromedriver");

jest.setTimeout(60000); // Timeout global agar stabil

describe("PSGA End-to-End Test", () => {
  let driver;

  // Setup
  beforeAll(async () => {
    const options = new chrome.Options();
    options.addArguments(
      "--headless", // Jalankan tanpa GUI (hapus jika ingin lihat browser)
      "--disable-gpu",
      "--no-sandbox",
      "--disable-dev-shm-usage",
      "--window-size=1920,1080"
    );

    driver = await new Builder()
      .forBrowser("chrome")
      .setChromeOptions(options)
      .build();

    await driver.manage().setTimeouts({
      implicit: 5000,
      pageLoad: 15000,
      script: 10000,
    });
  });

  // Teardown
  afterAll(async () => {
    if (driver) await driver.quit();
  });

  // -------------------------------
  // TC003: Login Pengguna Berhasil
  // -------------------------------
  test("TC003: User should be able to log in successfully", async () => {
    await driver.get("http://localhost:3000/login");

    // Tunggu halaman login muncul
    const emailInput = await driver.wait(
      until.elementLocated(By.css('input[name="email"]')),
      10000
    );
    await emailInput.clear();
    await emailInput.sendKeys("admin@gmail.com");

    const passwordInput = await driver.findElement(
      By.css('input[name="password"]')
    );
    await passwordInput.clear();
    await passwordInput.sendKeys("admin123");

    const loginButton = await driver.findElement(
      By.css('button[type="submit"]')
    );
    await driver.wait(until.elementIsEnabled(loginButton), 5000);
    await loginButton.click();

    // Tunggu URL berubah
    await driver.wait(until.urlContains("/dashboard"), 15000);

    const currentUrl = await driver.getCurrentUrl();
    expect(currentUrl).toContain("/dashboard");

    // Pastikan teks welcome muncul
    const welcomeHeader = await driver.wait(
      until.elementLocated(By.css("h1")),
      10000
    );
    const headerText = await welcomeHeader.getText();
    expect(headerText).toMatch(/selamat datang/i);
  });

  // -------------------------------
  // TC006: Membuat Tugas Baru
  // -------------------------------
  test("TC006: Logged-in user should be able to create a new task", async () => {
    await driver.get("http://localhost:3000/tasks");

    // Tunggu tombol tambah muncul
    const addTaskButton = await driver.wait(
      until.elementLocated(
        By.xpath("//button[contains(., 'Tambah Tugas Baru')]")
      ),
      10000
    );
    await driver.wait(until.elementIsVisible(addTaskButton), 5000);
    await addTaskButton.click();

    // Tunggu dialog muncul
    const dialog = await driver.wait(
      until.elementLocated(By.css('div[role="dialog"]')),
      10000
    );
    await driver.wait(until.elementIsVisible(dialog), 5000);

    const taskTitle = `Laporan Selenium ${Date.now()}`;

    // Isi form tugas
    const titleInput = await driver.findElement(
      By.css('div[role="dialog"] input[name="title"]')
    );
    await titleInput.clear();
    await titleInput.sendKeys(taskTitle);

    const dateInput = await driver.findElement(
      By.css('div[role="dialog"] input[type="date"]')
    );
    await dateInput.clear();
    await dateInput.sendKeys("2025-12-31");

    // Dropdown mata kuliah
    const dropdownButton = await driver.findElement(
      By.xpath("//button[contains(., 'Pilih mata kuliah')]")
    );
    await dropdownButton.click();

    // Pilih opsi pertama
    const firstOption = await driver.wait(
      until.elementLocated(By.xpath("//div[@role='option'][1]")),
      5000
    );
    await firstOption.click();

    // Klik tombol simpan
    const saveButton = await driver.findElement(
      By.xpath("//div[@role='dialog']//button[contains(., 'Simpan')]")
    );
    await saveButton.click();

    // Tunggu dialog tertutup
    await driver.wait(async () => {
      const dialogs = await driver.findElements(By.css('div[role="dialog"]'));
      return dialogs.length === 0;
    }, 10000);

    // Verifikasi tugas muncul di halaman
    await driver.wait(
      until.elementLocated(By.xpath(`//*[contains(text(), '${taskTitle}')]`)),
      10000
    );

    const pageText = await driver.findElement(By.tagName("body")).getText();
    expect(pageText).toContain(taskTitle);
  });
});
