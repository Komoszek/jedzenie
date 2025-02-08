import { App } from "@slack/bolt"
import { ensureDefined } from "@leancodepl/utils"
import { editThreadButtonId } from "./blocks/getEditThreadButtonBlock"
import { threadOverflowActionsId } from "./blocks/getJedzenieThreadBlock"
import { editRestaurantButtonId } from "./blocks/getRestaurantDetailsBlocks"
import { handlers } from "./handlers"
import { cancelJedzenieThreadViewId } from "./handlers/cancelThreadButtonHandler"
import { cancelThreadButtonId, editJedzenieThreadViewId } from "./handlers/editThreadButtonHandler"
import { startJedzenieThreadViewId } from "./handlers/jedzenieCommandHandler"
import { applyRestaurants } from "./restaurants"
import { showTawernaLunchMenuButtonId, tawerna } from "./restaurants/tawerna"
import { TawernaMenuService } from "./restaurants/tawerna/TawernaMenuService"
import { IntlService } from "./services/IntlService"
import { RestaurantActionsMap, RestaurantsService } from "./services/RestaurantsService"
import { restaurantPagePaginationId } from "./utils/getRestaurantsPage"
import { restaurantEditorId } from "./utils/openRestaurantEditor"

const niechKtosBotId = ensureDefined(process.env.NIECH_KTOS_BOT_ID, "NIECH_KTOS_BOT_ID not defined")

const app = new App({
    token: ensureDefined(process.env.SLACK_BOT_TOKEN, "SLACK_BOT_TOKEN not defined"),
    socketMode: true,
    appToken: ensureDefined(process.env.SLACK_APP_TOKEN, "SLACK_APP_TOKEN not defined"),
})

const intlService = new IntlService()

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

const jedzenieBotId = ensureDefined((await app.client.auth.test()).bot_id, "Couldn't fetch jedzenie bot id")

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
    editRestaurantButtonHandler,
} = handlers({
    jedzenieBotId,
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
app.action(editRestaurantButtonId, editRestaurantButtonHandler)
app.action(editThreadButtonId, editThreadButtonHandler)
app.action(cancelThreadButtonId, cancelThreadButtonHandler)
app.action(threadOverflowActionsId, threadOverflowActionsHandler)
app.action(new RegExp(`^${restaurantPagePaginationId}`), restauracjePaginationHandler)
app.event("app_mention", appMentionHandler)

applyRestaurants(app, tawerna({ intlService, tawernaMenuService: new TawernaMenuService() }))

await app.start()

// eslint-disable-next-line no-console
console.log("🍔 Jedzenie is running!")
