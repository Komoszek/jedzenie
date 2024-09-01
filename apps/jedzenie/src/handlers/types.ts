import {
    AllMiddlewareArgs,
    App,
    SlackAction,
    SlackActionMiddlewareArgs,
    SlackCommandMiddlewareArgs,
    SlackViewAction,
    SlackViewMiddlewareArgs,
} from "@slack/bolt"
import { RestaurantsService } from "../services/RestaurantsService"
import { TawernaMenuService } from "../services/TawernaMenuService"

export type CommandArgs = AllMiddlewareArgs & SlackCommandMiddlewareArgs
export type ViewArgs = AllMiddlewareArgs & SlackViewMiddlewareArgs<SlackViewAction>
export type ActionArgs = AllMiddlewareArgs & SlackActionMiddlewareArgs<SlackAction>

export type Dependencies = {
    niechKtosBotId: string
    tawernaMenuService: TawernaMenuService
    restaurantsService: RestaurantsService
}
export type WebClient = App["client"]
