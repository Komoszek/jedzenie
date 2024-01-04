import { SlackCommandMiddlewareArgs, AllMiddlewareArgs, App, SlackEventMiddlewareArgs } from "@slack/bolt";
import { State } from "../services/state";
import { StringIndexed } from "@slack/bolt/dist/types/helpers";

export type CommandArgs = SlackCommandMiddlewareArgs & AllMiddlewareArgs;
export type MessageArgs = SlackEventMiddlewareArgs<"message"> & AllMiddlewareArgs;

export type Dependencies = { state: State };
export type WebClient = App<StringIndexed>["client"];
