import {
    AllMiddlewareArgs,
    App,
    SlackAction,
    SlackActionMiddlewareArgs,
    SlackCommandMiddlewareArgs,
    SlackViewAction,
    SlackViewMiddlewareArgs,
} from "@slack/bolt";

export type CommandArgs = SlackCommandMiddlewareArgs & AllMiddlewareArgs;
export type ViewArgs = SlackViewMiddlewareArgs<SlackViewAction> & AllMiddlewareArgs;
export type ActionArgs = SlackActionMiddlewareArgs<SlackAction> & AllMiddlewareArgs;

export type Dependencies = { niechKtosBotId: string };
export type WebClient = App["client"];
