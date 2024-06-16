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

export type CommandArgs = SlackCommandMiddlewareArgs & AllMiddlewareArgs;
export type ViewArgs = SlackViewMiddlewareArgs<SlackViewAction> & AllMiddlewareArgs;
export type ActionArgs = SlackActionMiddlewareArgs<SlackAction> & AllMiddlewareArgs;

export type Dependencies = { niechKtosBotId: string; tawernaMenuService: TawernaMenuService };
export type WebClient = App["client"];
