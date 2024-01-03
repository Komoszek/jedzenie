import { CommandArgs } from "./types";
import { Locator, chromium } from "playwright";

export async function tawernaCommandHandler({ client, ack, command }: CommandArgs) {
    await ack();

    const { title, menu } = await getLunchMenu();

    await client.chat.postEphemeral({
        channel: command.channel_id,
        user: command.user_id,
        username: "Tawerna Grecka - Lunch Menu",
        blocks: [
            {
                type: "section",
                text: {
                    type: "plain_text",
                    text: title,
                },
            },
            ...menu.map(({ title, ingredients, price, image }, i) => ({
                type: "section",
                text: {
                    type: "mrkdwn",
                    text: `${i + 1}. *${title}* ${ingredients}\n_${price}_`,
                },
                accessory: {
                    type: "image",
                    image_url: image,
                    alt_text: title,
                },
            })),
        ],
    });
}

async function getLunchMenu() {
    const browser = await chromium.launch();
    const context = await browser.newContext();
    const page = await context.newPage();

    await context.route("**/*", route => {
        switch (route.request().resourceType()) {
            case "stylesheet":
            case "image":
            case "media":
            case "font":
                return route.abort();
            default:
                return route.continue();
        }
    });

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
    ).map(([title, ingredients, price, image]) => ({ title, ingredients, price, image }));

    await context.close();
    await browser.close();

    return { title, menu };
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
