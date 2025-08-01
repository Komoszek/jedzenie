import { CachedPromise } from "@jedzenie/utils"
import { Locator } from "playwright"
import { MenuItem } from "../../types/MenuItem"
import { scrapePage } from "../../utils/scrapePage"

const imagePlaceholder = "https://tawernagrecka.pl/wp-content/uploads/2023/05/dinner-scaled.jpg"

export class TawernaMenuService {
  private cachedLunchMenu = new CachedPromise(() => this.scrapeLunchMenu(), { value: 10, unit: "minutes" })
  private cachedMenu = new CachedPromise(() => this.scrapeMenu(), { value: 8, unit: "hours" })

  async getLunchMenu() {
    return await this.cachedLunchMenu.get()
  }

  async getMenu() {
    return await this.cachedMenu.get()
  }

  private async scrapeLunchMenu(): Promise<TawernaLunchMenuData> {
    return await scrapePage(async page => {
      await page.goto("https://tawernagrecka.pl/lunchmenu/")

      const title = (
        await page
          .locator(".ct-section-inner-wrap .ct-div-block", {
            has: page.locator("h3", { hasText: "Lunch menu" }),
          })
          .last()
          .innerText()
      ).replace(/\n\n/g, " ")

      const menu = (
        await Promise.all(
          (await page.locator(".rst-menu-item").all()).map(async locator =>
            Promise.all([
              locator.locator(".the-title").first().innerText(),
              locator.locator(".the-ingredients").first().innerText(),
              locator.locator(".the-price").first().innerText(),
              this.getLunchMenuItemImage(locator),
            ]),
          ),
        )
      ).map<MenuItem>(([title, extra, price, image]) => ({ title, extra, price, image }))

      return { title, menu }
    })
  }

  private async getLunchMenuItemImage(locator: Locator) {
    let image: string | undefined

    try {
      const imageLocator = (await locator.locator(".the-feature").all()).at(0)
      image = await imageLocator?.evaluate(el => el.style.backgroundImage.slice(5, -2))
    } catch {
      /* empty */
    }

    return image ?? imagePlaceholder
  }

  private async scrapeMenu(): Promise<MenuItem[]> {
    return await scrapePage(async page => {
      await page.goto("https://tawernagrecka.pl/menu/")
      const menuItems: MenuItem[] = []

      for (;;) {
        menuItems.push(
          ...(
            await Promise.all(
              (await page.locator(".product").all()).map(async locator =>
                Promise.all([
                  locator.locator(".woocommerce-loop-product__title").first().innerText(),
                  locator.locator(".price").first().innerText(),
                  locator.locator("img").first().getAttribute("src"),
                ]),
              ),
            )
          ).map<MenuItem>(([title, price, image]) => ({
            title,
            price,
            image: image ?? imagePlaceholder,
          })),
        )

        const nextPageButton = (await page.locator(".next.page-numbers").all()).at(0)

        if (!nextPageButton) {
          break
        }

        const currentUrl = page.url()
        await nextPageButton.click()
        await page.waitForURL(url => url.toString() !== currentUrl)
      }

      return menuItems
    })
  }
}

type TawernaLunchMenuData = { title: string; menu: MenuItem[] }
