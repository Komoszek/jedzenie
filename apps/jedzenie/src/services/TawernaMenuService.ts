import { Locator } from "playwright";
import { Observable, firstValueFrom, from, shareReplay } from "rxjs";
import { scrapePage } from "../utils/scrapePage";
import dayjs, { Dayjs } from "dayjs";
import { MenuItem } from "../types/MenuItem";

export class TawernaMenuService {
    private imagePlaceholder = "https://tawernagrecka.pl/wp-content/uploads/2023/05/dinner-scaled.jpg";

    private lunchCacheTime?: Dayjs;
    private $lunchPipe?: Observable<TawernaLunchMenuData>;

    private menuCacheTime?: Dayjs;
    private $menuPipe?: Observable<MenuItem[]>;

    async getLunchMenu(): Promise<TawernaLunchMenuData> {
        if (!this.$lunchPipe || !this.lunchCacheTime || this.lunchCacheTime < dayjs()) {
            this.$lunchPipe = from(this.scrapeLunchMenu()).pipe(shareReplay(1));
            this.lunchCacheTime = dayjs().add(10, "minutes");
        }

        return await firstValueFrom(this.$lunchPipe);
    }

    async getMenu(): Promise<MenuItem[]> {
        if (!this.$menuPipe || !this.menuCacheTime || this.menuCacheTime < dayjs()) {
            this.$menuPipe = from(this.scrapeMenu()).pipe(shareReplay(1));
            this.menuCacheTime = dayjs().add(8, "hours");
        }

        return await firstValueFrom(this.$menuPipe);
    }

    private async scrapeLunchMenu(): Promise<TawernaLunchMenuData> {
        return await scrapePage(async page => {
            await page.goto("https://tawernagrecka.pl/lunchmenu/");

            const title = (
                await page
                    .locator(".ct-section-inner-wrap .ct-div-block", {
                        has: page.locator("h3", { hasText: "Lunch menu" }),
                    })
                    .last()
                    .innerText()
            ).replace(/\n\n/g, " ");

            const menu = (
                await Promise.all(
                    (
                        await page.locator(".rst-menu-item").all()
                    ).map(async locator => {
                        return Promise.all([
                            locator.locator(".the-title").first().innerText(),
                            locator.locator(".the-ingredients").first().innerText(),
                            locator.locator(".the-price").first().innerText(),
                            this.getLunchMenuItemImage(locator),
                        ]);
                    }),
                )
            ).map<MenuItem>(([title, extra, price, image]) => ({ title, extra, price, image }));

            return { title, menu };
        });
    }

    private async getLunchMenuItemImage(locator: Locator) {
        try {
            const imageLocator = (await locator.locator(".the-feature").all()).at(0);
            const image = await imageLocator?.evaluate(el => {
                return el.style.backgroundImage.slice(5, -2);
            });

            return image ?? this.imagePlaceholder;
        } catch {
            return this.imagePlaceholder;
        }
    }

    private async scrapeMenu(): Promise<MenuItem[]> {
        return await scrapePage(async page => {
            await page.goto("https://tawernagrecka.pl/menu/");
            const menuItems: MenuItem[] = [];

            for (;;) {
                menuItems.push(
                    ...(
                        await Promise.all(
                            (
                                await page.locator(".product").all()
                            ).map(async locator => {
                                return Promise.all([
                                    locator.locator(".woocommerce-loop-product__title").first().innerText(),
                                    locator.locator(".price").first().innerText(),
                                    locator.locator("img").first().getAttribute("src"),
                                ]);
                            }),
                        )
                    ).map<MenuItem>(([title, price, image]) => ({
                        title,
                        price,
                        image: image ?? this.imagePlaceholder,
                    })),
                );

                const nextPageButton = (await page.locator(".next.page-numbers").all()).at(0);

                if (!nextPageButton) {
                    break;
                }

                const currentUrl = page.url();
                await nextPageButton.click();
                await page.waitForURL(url => url.toString() !== currentUrl);
            }

            return menuItems;
        });
    }
}

type TawernaLunchMenuData = { title: string; menu: MenuItem[] };
