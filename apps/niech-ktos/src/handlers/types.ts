import { SlackCommandMiddlewareArgs, AllMiddlewareArgs, App } from "@slack/bolt";
import { StringIndexed } from "@slack/bolt/dist/types/helpers";
import { Config } from "../services/config";

export type CommandArgs = SlackCommandMiddlewareArgs & AllMiddlewareArgs;
export type Dependencies = { app: App<StringIndexed>; config: Config };
