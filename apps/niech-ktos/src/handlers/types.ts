import {
    AllMiddlewareArgs,
    App,
    SlackCommandMiddlewareArgs,
    SlackEventMiddlewareArgs,
    SlackShortcut,
    SlackShortcutMiddlewareArgs,
} from "@slack/bolt"
import { IntlService } from "../services/IntlService"
import { State } from "../services/state"

export type AppMentionArgs = AllMiddlewareArgs & SlackEventMiddlewareArgs<"app_mention">
export type CommandArgs = AllMiddlewareArgs & SlackCommandMiddlewareArgs
export type MessageArgs = AllMiddlewareArgs & SlackEventMiddlewareArgs<"message">
export type MemberJoinedChannelArgs = AllMiddlewareArgs & SlackEventMiddlewareArgs<"member_joined_channel">
export type ShortcutArgs = AllMiddlewareArgs & SlackShortcutMiddlewareArgs<SlackShortcut>

export type Dependencies = { state: State; watchedChannelIds: string[]; intlService: IntlService }
export type WebClient = App["client"]
