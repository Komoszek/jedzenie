import { App } from "@slack/bolt"
import { ensureDefined } from "@leancodepl/utils"
import { editThreadButtonId } from "./blocks/getEditThreadButtonBlock"
import { threadOverflowActionsId } from "./blocks/getJedzenieThreadBlock"
import { editRestaurantButtonId } from "./blocks/getRestaurantDetailsBlocks"
import { startJedzenieThreadButtonId } from "./blocks/getStartThreadButtonBlock"
import { handlers } from "./handlers"
import { cancelJedzenieThreadViewId } from "./handlers/cancelThreadButtonHandler"
import { cancelThreadButtonId, editJedzenieThreadViewId } from "./handlers/editThreadButtonHandler"
import { startJedzenieThreadViewId } from "./handlers/jedzenieCommandHandler"
import { applyRestaurants } from "./restaurants"
import { tawerna } from "./restaurants/tawerna"
import { TawernaMenuService } from "./restaurants/tawerna/TawernaMenuService"
import { IntlService } from "./services/IntlService"
import { RestaurantsService } from "./services/RestaurantsService"
import { restaurantPagePaginationId } from "./utils/getRestaurantsPage"
import { restaurantEditorId } from "./utils/openRestaurantEditor"

const niechKtosBotId = ensureDefined(process.env.NIECH_KTOS_BOT_ID, "NIECH_KTOS_BOT_ID not defined")

const app = new App({
  token: ensureDefined(process.env.SLACK_BOT_TOKEN, "SLACK_BOT_TOKEN not defined"),
  socketMode: true,
  appToken: ensureDefined(process.env.SLACK_APP_TOKEN, "SLACK_APP_TOKEN not defined"),
})

const jedzenieBotId = ensureDefined((await app.client.auth.test()).bot_id, "Couldn't fetch jedzenie bot id")

const intlService = new IntlService()
const restaurantsService = new RestaurantsService({
  restaurantsPath: ensureDefined(process.env.RESTAURANTS_PATH, "RESTAURANTS_PATH not defined"),
})

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
  startJedzenieThreadButtonHandler,
  messageImHandler,
} = handlers({
  jedzenieBotId,
  niechKtosBotId,
  restaurantsService,
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
app.action(startJedzenieThreadButtonId, startJedzenieThreadButtonHandler)
app.action(cancelThreadButtonId, cancelThreadButtonHandler)
app.action(threadOverflowActionsId, threadOverflowActionsHandler)
app.action(new RegExp(`^${restaurantPagePaginationId}`), restauracjePaginationHandler)
app.event("app_mention", appMentionHandler)
app.event("message", messageImHandler)

applyRestaurants({ app, restaurantsService }, [tawerna({ intlService, tawernaMenuService: new TawernaMenuService() })])

await app.start()

// eslint-disable-next-line no-console
console.log("🍔 Jedzenie is running!")
