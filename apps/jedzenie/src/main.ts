import { App } from "@slack/bolt";
import { ensureDefined } from "@leancodepl/utils";
import { startJedzenieThreadViewId } from "./handlers/jedzenieCommandHandler";
import { handlers } from "./handlers";
import { editJedzenieThreadViewId } from "./handlers/editThreadButtonHandler";
import { editThreadButtonId, showTawernaLunchMenuButtonId } from "./utils/getJedzenieThreadBlock";
import { TawernaMenuService } from "./services/TawernaMenuService";

const niechKtosBotId = ensureDefined(process.env.NIECH_KTOS_BOT_ID, "NIECH_KTOS_BOT_ID not defined");

const app = new App({
    token: ensureDefined(process.env.SLACK_BOT_TOKEN, "SLACK_BOT_TOKEN not defined"),
    socketMode: true,
    appToken: ensureDefined(process.env.SLACK_APP_TOKEN, "SLACK_APP_TOKEN not defined"),
});

const {
    tawernaCommandHandler,
    editThreadButtonHandler,
    showTawernaLunchMenuButtonHandler,
    jedzenieCommandHandler,
    startJedzenieThreadViewHandler,
    editJedzenieThreadViewHandler,
} = handlers({
    niechKtosBotId,
    tawernaMenuService: new TawernaMenuService(),
});

app.command("/tawerna", tawernaCommandHandler);
app.command("/jedzenie", jedzenieCommandHandler);
app.view(startJedzenieThreadViewId, startJedzenieThreadViewHandler);
app.view(editJedzenieThreadViewId, editJedzenieThreadViewHandler);
app.action(editThreadButtonId, editThreadButtonHandler);
app.action(showTawernaLunchMenuButtonId, showTawernaLunchMenuButtonHandler);

(async () => {
    await app.start();

    console.log("🍔 Jedzenie is running!");
})();
