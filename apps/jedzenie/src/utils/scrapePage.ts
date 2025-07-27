import { chromium, Page } from "playwright"

export async function scrapePage<TScraper extends (page: Page) => Promise<any>>(scraper: TScraper) {
  const browser = await chromium.launch()
  const context = await browser.newContext()
  const page = await context.newPage()

  await context.route("**/*", route => {
    switch (route.request().resourceType()) {
      case "stylesheet":
      case "image":
      case "media":
      case "font":
        return route.abort()
      default:
        return route.continue()
    }
  })

  const result = await scraper(page)

  await context.close()
  await browser.close()

  return result
}
