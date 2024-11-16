import { App } from "@slack/bolt"
import { ensureDefined } from "@leancodepl/utils"
import { handlers } from "./handlers"
import { cancelJedzenieThreadViewHandler } from "./handlers/cancelJedzenieThreadViewHandler"
import { cancelJedzenieThreadViewId } from "./handlers/cancelThreadButtonHandler"
import { cancelThreadButtonId, editJedzenieThreadViewId } from "./handlers/editThreadButtonHandler"
import { startJedzenieThreadViewId } from "./handlers/jedzenieCommandHandler"
import { IntlService } from "./services/IntlService"
import { RestaurantsService } from "./services/RestaurantsService"
import { TawernaMenuService } from "./services/TawernaMenuService"
import { editThreadButtonId, showTawernaLunchMenuButtonId } from "./utils/getJedzenieThreadBlock"

const niechKtosBotId = ensureDefined(process.env.NIECH_KTOS_BOT_ID, "NIECH_KTOS_BOT_ID not defined")

const app = new App({
    token: ensureDefined(process.env.SLACK_BOT_TOKEN, "SLACK_BOT_TOKEN not defined"),
    socketMode: true,
    appToken: ensureDefined(process.env.SLACK_APP_TOKEN, "SLACK_APP_TOKEN not defined"),
})

const {
    tawernaCommandHandler,
    editThreadButtonHandler,
    cancelThreadButtonHandler,
    showTawernaLunchMenuButtonHandler,
    jedzenieCommandHandler,
    startJedzenieThreadViewHandler,
    editJedzenieThreadViewHandler,
    appMentionHandler,
} = handlers({
    niechKtosBotId,
    tawernaMenuService: new TawernaMenuService(),
    restaurantsService: new RestaurantsService(
        ensureDefined(process.env.RESTAURANTS_PATH, "RESTAURANTS_PATH not defined"),
    ),
    intlService: new IntlService(),
})

app.command("/tawerna", tawernaCommandHandler)
app.command("/jedzenie", jedzenieCommandHandler)
app.view(startJedzenieThreadViewId, startJedzenieThreadViewHandler)
app.view(editJedzenieThreadViewId, editJedzenieThreadViewHandler)
app.view(cancelJedzenieThreadViewId, cancelJedzenieThreadViewHandler)
app.action(editThreadButtonId, editThreadButtonHandler)
app.action(cancelThreadButtonId, cancelThreadButtonHandler)
app.action(showTawernaLunchMenuButtonId, showTawernaLunchMenuButtonHandler)
app.event("app_mention", appMentionHandler)

await app.start()

// eslint-disable-next-line no-console
console.log("🍔 Jedzenie is running!")
