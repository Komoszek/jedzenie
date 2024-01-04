import {
    AllMiddlewareArgs,
    App,
    SlackCommandMiddlewareArgs,
    SlackViewAction,
    SlackViewMiddlewareArgs,
} from "@slack/bolt";
import { StringIndexed } from "@slack/bolt/dist/types/helpers";

export type CommandArgs = SlackCommandMiddlewareArgs & AllMiddlewareArgs;
export type ViewArgs = SlackViewMiddlewareArgs<SlackViewAction> & AllMiddlewareArgs;

export type Dependencies = { niechKtosBotId: string };
export type WebClient = App<StringIndexed>["client"];
