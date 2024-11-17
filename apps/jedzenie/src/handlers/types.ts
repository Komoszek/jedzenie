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
import { TawernaMenuService } from "../services/TawernaMenuService"

export type CommandArgs = AllMiddlewareArgs & SlackCommandMiddlewareArgs
export type ViewArgs = AllMiddlewareArgs & SlackViewMiddlewareArgs<SlackViewAction>
export type ActionArgs = AllMiddlewareArgs & SlackActionMiddlewareArgs<SlackAction>
export type AppMentionArgs = AllMiddlewareArgs & SlackEventMiddlewareArgs<"app_mention">

export type Dependencies = {
    niechKtosBotId: string
    tawernaMenuService: TawernaMenuService
    restaurantsService: RestaurantsService
    intlService: IntlService
}
export type WebClient = App["client"]
