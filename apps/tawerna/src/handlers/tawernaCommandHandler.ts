import { CommandArgs } from "./types";
import { chromium } from "playwright";

export async function tawernaCommandHandler(args: CommandArgs) {
    const { respond, ack } = args;

    await ack();

    const { title, menu } = await getLunchMenu();

    respond(
        [
            title,
            menu
                .map(({ title, ingredients, price }, i) => `${i + 1}. *${title}* ${ingredients}\n_${price}_`)
                .join("\n\n"),
        ].join("\n\n"),
    );
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
                await page.locator(".rst-menu-item--inner").all()
            ).map(async locator =>
                Promise.all([
                    locator.locator(".the-title").first().innerText(),
                    locator.locator(".the-ingredients").first().innerText(),
                    locator.locator(".the-price").first().innerText(),
                ]),
            ),
        )
    ).map(([title, ingredients, price]) => ({ title, ingredients, price }));

    await context.close();
    await browser.close();

    return { title, menu };
}
