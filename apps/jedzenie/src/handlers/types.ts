import {
    AllMiddlewareArgs,
    App,
    SlackAction,
    SlackActionMiddlewareArgs,
    SlackCommandMiddlewareArgs,
    SlackViewAction,
    SlackViewMiddlewareArgs,
} from "@slack/bolt";
import { TawernaMenuService } from "../services/TawernaMenuService";
import { RestaurantsService } from "../services/RestaurantsService";

export type CommandArgs = SlackCommandMiddlewareArgs & AllMiddlewareArgs;
export type ViewArgs = SlackViewMiddlewareArgs<SlackViewAction> & AllMiddlewareArgs;
export type ActionArgs = SlackActionMiddlewareArgs<SlackAction> & AllMiddlewareArgs;

export type Dependencies = {
    niechKtosBotId: string;
    tawernaMenuService: TawernaMenuService;
    restaurantsService: RestaurantsService;
};
export type WebClient = App["client"];
