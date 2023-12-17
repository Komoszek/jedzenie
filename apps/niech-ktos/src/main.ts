import { App } from "@slack/bolt";
import path from "path";
import { ensureDefined } from "@leancodepl/utils";
import { Config } from "./services/config";
import { handlers } from "./handlers";

const config = new Config(path.resolve(process.cwd(), ensureDefined(process.env.CONFIG_PATH)));

const app = new App({
    signingSecret: process.env.SLACK_SIGNING_SECRET,
    token: process.env.SLACK_BOT_TOKEN,
    socketMode: true,
    appToken: process.env.SLACK_APP_TOKEN,
    port: Number(process.env.PORT || 3000),
});

const { nkCommandHandler, appMentionHandler } = handlers({ app, config });

app.command("/nk", nkCommandHandler);
app.event("app_mention", appMentionHandler);

(async () => {
    await app.start();

    console.log("⚡️ Niech ktos is running!");
})();
