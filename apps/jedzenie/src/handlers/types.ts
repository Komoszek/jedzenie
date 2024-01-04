import { AllMiddlewareArgs, SlackCommandMiddlewareArgs, SlackViewAction, SlackViewMiddlewareArgs } from "@slack/bolt";

export type CommandArgs = SlackCommandMiddlewareArgs & AllMiddlewareArgs;
export type ViewArgs = SlackViewMiddlewareArgs<SlackViewAction> & AllMiddlewareArgs;

export type Dependencies = { niechKtosBotId: string };
