import { App } from "@slack/bolt";
import { ensureDefined } from "@leancodepl/utils";
import { State } from "./services/state";
import path from "path";
import { jedzenieViewId } from "./handlers/jedzenieCommandHandler";
import { handleDeparture } from "./utils/handleDeparture";
import { handlers } from "./handlers";

const state = new State(
    path.resolve(process.cwd(), ensureDefined(process.env.STATE_PATH)),
    ensureDefined(process.env.NIECH_KTOS_BOT_ID, "NIECH_KTOS_BOT_ID not defined"),
);

const app = new App({
    token: ensureDefined(process.env.SLACK_BOT_TOKEN, "SLACK_BOT_TOKEN not defined"),
    socketMode: true,
    appToken: ensureDefined(process.env.SLACK_APP_TOKEN, "SLACK_APP_TOKEN not defined"),
});

const { tawernaCommandHandler, jedzenieCommandHandler, jedzenieViewSubmissionHandler } = handlers({ state });

app.command("/tawerna", tawernaCommandHandler);
app.command("/jedzenie", jedzenieCommandHandler);
app.view(jedzenieViewId, jedzenieViewSubmissionHandler);

(async () => {
    await app.start();

    console.log("🍔 Jedzenie is running!");

    state.getAllDepartures().forEach(departure => handleDeparture({ departure, client: app.client, state }));
})();
