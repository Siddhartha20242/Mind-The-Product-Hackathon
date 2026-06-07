import puppeteer from "puppeteer-core";
import { pendoTrack } from "../utils/pendo";

export async function scrapeUrl(
  targetUrl: string,
  scrapeType: string,
  selectors: string[],
  visitorId: string,
  accountId: string
) {
  const startTime = Date.now();

  const browser = await puppeteer.launch({
    executablePath: process.env.CHROMIUM_PATH || "/usr/bin/chromium",
    args: ["--no-sandbox", "--disable-setuid-sandbox"],
  });

  try {
    const page = await browser.newPage();
    await page.goto(targetUrl, { waitUntil: "networkidle0" });

    const extractedData: any[] = [];
    for (const selector of selectors) {
      const elements = await page.$$(selector);
      for (const el of elements) {
        const text = await el.evaluate((node: Element) => node.textContent?.trim() || "");
        if (text) extractedData.push(text);
      }
    }

    const scrapeDuration = Date.now() - startTime;

    // Track successful web scrape
    await pendoTrack("web_scrape_completed", visitorId, accountId, {
      targetUrl: targetUrl.substring(0, 200),
      scrapeDuration,
      dataPointsExtracted: extractedData.length,
      pageCount: 1,
      scrapeType,
    });

    return { data: extractedData, duration: scrapeDuration };
  } finally {
    await browser.close();
  }
}
