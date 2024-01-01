import { AllMiddlewareArgs, SlackCommandMiddlewareArgs } from "@slack/bolt";

export type CommandArgs = SlackCommandMiddlewareArgs & AllMiddlewareArgs;
