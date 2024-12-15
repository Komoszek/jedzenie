import {
    AllMiddlewareArgs,
    App,
    SlackAction,
    SlackActionMiddlewareArgs,
    SlackCommandMiddlewareArgs,
    SlackEventMiddlewareArgs,
    SlackViewAction,
    SlackViewMiddlewareArgs,
} from "@slack/bolt"
import { IntlService } from "../services/IntlService"
import { RestaurantsService } from "../services/RestaurantsService"

export type CommandArgs = AllMiddlewareArgs & SlackCommandMiddlewareArgs
export type ViewArgs = AllMiddlewareArgs & SlackViewMiddlewareArgs<SlackViewAction>
export type ActionArgs = AllMiddlewareArgs & SlackActionMiddlewareArgs<SlackAction>
export type AppMentionArgs = AllMiddlewareArgs & SlackEventMiddlewareArgs<"app_mention">

export type Dependencies = {
    jedzenieBotId: string
    niechKtosBotId: string
    restaurantsService: RestaurantsService
    intlService: IntlService
}
export type WebClient = App["client"]
