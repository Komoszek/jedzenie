import { KnownBlock, SectionBlock } from "@slack/bolt";
import { CommandArgs, WebClient } from "./types";
import { Locator } from "playwright";
import { scrapePage } from "../utils/scrapePage";

export async function tawernaCommandHandler({ client, ack, command: { channel_id, user_id, text } }: CommandArgs) {
    await ack();

    const args: Parameters<WebClient["chat"]["postEphemeral"]>[0] = {
        channel: channel_id,
        user: user_id,
    };

    if (text.trim() === "menu") {
        const menu = await getMenu();

        console.log(menu);
        args.username = "Tawerna Grecka - Menu";
        args.blocks = menu.map(mapMenuItemToSectionBlock);
    } else {
        const { title, menu } = await getLunchMenu();

        args.username = "Tawerna Grecka - Lunch Menu";
        args.blocks = [
            {
                type: "section",
                text: {
                    type: "plain_text",
                    text: title,
                },
            },
            ...menu.map(mapMenuItemToSectionBlock),
        ];
    }

    await client.chat.postEphemeral(args);
}

function mapMenuItemToSectionBlock({ title, extra, price, image }): SectionBlock {
    return {
        type: "section",
        text: {
            type: "mrkdwn",
            text: `${[`*${title}*`, extra].filter(Boolean).join(" ")}\n_${price}_`,
        },
        accessory: {
            type: "image",
            image_url: image,
            alt_text: title,
        },
    };
}

function getMenu(): Promise<MenuItem[]> {
    return scrapePage(async page => {
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
                                locator.locator(".attachment-woocommerce_thumbnail").first().getAttribute("src"),
                            ]);
                        }),
                    )
                ).map<MenuItem>(([title, price, image]) => ({ title, price, image })),
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

function getLunchMenu(): Promise<{ title: string; menu: MenuItem[] }> {
    return scrapePage(async page => {
        await page.goto("https://tawernagrecka.pl/lunchmenu/");

        const title = (
            await page
                .locator(".ct-section-inner-wrap .ct-div-block", { has: page.locator("h3", { hasText: "Lunch menu" }) })
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
                        getMenuItemImage(locator),
                    ]);
                }),
            )
        ).map<MenuItem>(([title, extra, price, image]) => ({ title, extra, price, image }));

        return { title, menu };
    });
}

async function getMenuItemImage(locator: Locator) {
    try {
        const imageLocator = (await locator.locator(".the-feature").all()).at(0);
        const image = await imageLocator.evaluate(el => {
            return el.style.backgroundImage.slice(5, -2);
        });

        return image;
    } catch {
        return "https://tawernagrecka.pl/wp-content/uploads/2023/05/dinner-scaled.jpg";
    }
}

type MenuItem = {
    title: string;
    extra?: string;
    price: string;
    image: string;
};
