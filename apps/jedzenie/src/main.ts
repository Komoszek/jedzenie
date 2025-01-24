import { ensureDefined } from "@jedzenie/utils"
import { App } from "@slack/bolt"
import { handlers } from "./handlers"
import { cancelJedzenieThreadViewId } from "./handlers/cancelThreadButtonHandler"
import { cancelThreadButtonId, editJedzenieThreadViewId } from "./handlers/editThreadButtonHandler"
import { startJedzenieThreadViewId } from "./handlers/jedzenieCommandHandler"
import { restaurantEditorId } from "./handlers/threadOverflowActionsHandler"
import { tawernaHandlers } from "./restaurants/tawerna"
import { IntlService } from "./services/IntlService"
import { RestaurantActionsMap, RestaurantsService } from "./services/RestaurantsService"
import { TawernaMenuService } from "./services/TawernaMenuService"
import { editThreadButtonId, threadOverflowActionsId } from "./utils/getJedzenieThreadBlock"
import { restaurantPagePaginationId } from "./utils/getRestaurantsPage"

const niechKtosBotId = ensureDefined(process.env.NIECH_KTOS_BOT_ID, "NIECH_KTOS_BOT_ID not defined")

const app = new App({
    token: ensureDefined(process.env.SLACK_BOT_TOKEN, "SLACK_BOT_TOKEN not defined"),
    socketMode: true,
    appToken: ensureDefined(process.env.SLACK_APP_TOKEN, "SLACK_APP_TOKEN not defined"),
})

const intlService = new IntlService()

const showTawernaLunchMenuButtonId = "show_tawerna_lunch_menu"

const restaurantActions: RestaurantActionsMap = {
    tawerna: [
        {
            type: "button",
            text: {
                type: "plain_text",
                text: intlService.intl.formatMessage({
                    defaultMessage: "Pokaż menu lunchowe",
                    id: "restaurantActions.tawerna.showTawernaLunchMenu",
                }),
                emoji: true,
            },
            action_id: showTawernaLunchMenuButtonId,
        },
    ],
}

// Global jedzenie handlers
const {
    editThreadButtonHandler,
    cancelThreadButtonHandler,
    jedzenieCommandHandler,
    startJedzenieThreadViewHandler,
    editJedzenieThreadViewHandler,
    appMentionHandler,
    restauracjeCommandHandler,
    threadOverflowActionsHandler,
    cancelJedzenieThreadViewHandler,
    restaurantEditorViewHandler,
    restauracjePaginationHandler,
} = handlers({
    jedzenieBotId: ensureDefined((await app.client.auth.test()).bot_id, "Couldn't fetch jedzenie bot id"),
    niechKtosBotId,
    restaurantsService: new RestaurantsService(
        ensureDefined(process.env.RESTAURANTS_PATH, "RESTAURANTS_PATH not defined"),
        restaurantActions,
    ),
    intlService,
})

app.command("/jedzenie", jedzenieCommandHandler)
app.command("/restauracje", restauracjeCommandHandler)
app.view(startJedzenieThreadViewId, startJedzenieThreadViewHandler)
app.view(editJedzenieThreadViewId, editJedzenieThreadViewHandler)
app.view(cancelJedzenieThreadViewId, cancelJedzenieThreadViewHandler)
app.view(restaurantEditorId, restaurantEditorViewHandler)
app.action(editThreadButtonId, editThreadButtonHandler)
app.action(cancelThreadButtonId, cancelThreadButtonHandler)
app.action(threadOverflowActionsId, threadOverflowActionsHandler)
app.action(new RegExp(`^${restaurantPagePaginationId}`), restauracjePaginationHandler)
app.event("app_mention", appMentionHandler)

// Tawerna handlers
const { tawernaCommandHandler, showTawernaLunchMenuButtonHandler } = tawernaHandlers({
    tawernaMenuService: new TawernaMenuService(),
    intlService,
})

app.command("/tawerna", tawernaCommandHandler)
app.action(showTawernaLunchMenuButtonId, showTawernaLunchMenuButtonHandler)

await app.start()

// eslint-disable-next-line no-console
console.log("🍔 Jedzenie is running!")
