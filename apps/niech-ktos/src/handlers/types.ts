import {
    SlackCommandMiddlewareArgs,
    AllMiddlewareArgs,
    App,
    SlackEventMiddlewareArgs,
    SlackShortcut,
    SlackShortcutMiddlewareArgs,
} from "@slack/bolt";
import { State } from "../services/state";
import { StringIndexed } from "@slack/bolt/dist/types/helpers";

export type AppMentionArgs = SlackEventMiddlewareArgs<"app_mention"> & AllMiddlewareArgs;
export type CommandArgs = SlackCommandMiddlewareArgs & AllMiddlewareArgs;
export type MessageArgs = SlackEventMiddlewareArgs<"message"> & AllMiddlewareArgs;
export type ShortcutArgs = SlackShortcutMiddlewareArgs<SlackShortcut> & AllMiddlewareArgs;

export type Dependencies = { state: State };
export type WebClient = App<StringIndexed>["client"];
