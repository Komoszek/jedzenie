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

const watchedChannelIds = process.env.WATCHED_CHANNEL_IDS?.split(";") ?? []

const { nkCommandHandler, appMentionHandler, messageImHandler, silentNkShortcutHandler, memberJoinedChannelHandler } =
    handlers({
        state,
        watchedChannelIds,
    })

app.command("/nk", nkCommandHandler)
app.shortcut("silent_nk", silentNkShortcutHandler)
app.event("app_mention", appMentionHandler)
app.event("message", messageImHandler)

if (watchedChannelIds.length > 0) {
    app.event("member_joined_channel", memberJoinedChannelHandler)
}

await app.start()

// eslint-disable-next-line no-console
console.log("⚡️ Niech ktos is running!")
