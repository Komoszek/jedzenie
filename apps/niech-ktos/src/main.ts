import { App } from "@slack/bolt"
import path from "path"
import { ensureDefined } from "@leancodepl/utils"
import { handlers } from "./handlers"
import { State } from "./services/state"

const state = new State(path.resolve(process.cwd(), ensureDefined(process.env.STATE_PATH)))

const app = new App({
    token: ensureDefined(process.env.SLACK_BOT_TOKEN, "SLACK_BOT_TOKEN not defined"),
    socketMode: true,
    appToken: ensureDefined(process.env.SLACK_APP_TOKEN, "SLACK_APP_TOKEN not defined"),
})

const { nkCommandHandler, appMentionHandler, messageImHandler, silentNkShortcutHandler } = handlers({ state })

app.command("/nk", nkCommandHandler)
app.event("app_mention", appMentionHandler)
app.event("message", messageImHandler)
app.shortcut("silent_nk", silentNkShortcutHandler)

await app.start()

// eslint-disable-next-line no-console
console.log("⚡️ Niech ktos is running!")
