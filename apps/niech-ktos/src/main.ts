import { App } from "@slack/bolt";
import path from "path";
import { ensureDefined } from "@leancodepl/utils";
import { Config } from "./services/config";
import { handlers } from "./handlers";

const config = new Config(path.resolve(process.cwd(), ensureDefined(process.env.CONFIG_PATH)));

const app = new App({
    token: ensureDefined(process.env.SLACK_BOT_TOKEN, "SLACK_BOT_TOKEN not defined"),
    socketMode: true,
    appToken: ensureDefined(process.env.SLACK_APP_TOKEN, "SLACK_APP_TOKEN not defined"),
});

const { nkCommandHandler, appMentionHandler } = handlers({ app, config });

app.command("/nk", nkCommandHandler);
app.event("app_mention", appMentionHandler);

(async () => {
    await app.start();

    console.log("⚡️ Niech ktos is running!");
})();
