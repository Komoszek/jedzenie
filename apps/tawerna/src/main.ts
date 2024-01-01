import { App } from "@slack/bolt";
import { ensureDefined } from "@leancodepl/utils";
import { tawernaCommandHandler } from "./handlers/tawernaCommandHandler";

const app = new App({
    token: ensureDefined(process.env.SLACK_BOT_TOKEN, "SLACK_BOT_TOKEN not defined"),
    socketMode: true,
    appToken: ensureDefined(process.env.SLACK_APP_TOKEN, "SLACK_APP_TOKEN not defined"),
});

app.command("/tawerna", tawernaCommandHandler);

(async () => {
    await app.start();

    console.log("🇬🇷 Tawerna is running!");
})();
