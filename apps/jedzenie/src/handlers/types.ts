import { AllMiddlewareArgs, SlackCommandMiddlewareArgs, SlackViewAction, SlackViewMiddlewareArgs } from "@slack/bolt";
import { State } from "../services/state";

export type CommandArgs = SlackCommandMiddlewareArgs & AllMiddlewareArgs;
export type ViewArgs = SlackViewMiddlewareArgs<SlackViewAction> & AllMiddlewareArgs;

export type Dependencies = { state: State };
