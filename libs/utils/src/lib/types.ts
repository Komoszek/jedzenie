import {
  AllMiddlewareArgs,
  App,
  SlackAction,
  SlackActionMiddlewareArgs,
  SlackCommandMiddlewareArgs,
  SlackEventMiddlewareArgs,
  SlackShortcut,
  SlackShortcutMiddlewareArgs,
  SlackViewAction,
  SlackViewMiddlewareArgs,
} from "@slack/bolt"

export type CommandArgs = AllMiddlewareArgs & SlackCommandMiddlewareArgs
export type ViewArgs = AllMiddlewareArgs & SlackViewMiddlewareArgs<SlackViewAction>
export type ActionArgs = AllMiddlewareArgs & SlackActionMiddlewareArgs<SlackAction>
export type AppMentionArgs = AllMiddlewareArgs & SlackEventMiddlewareArgs<"app_mention">
export type MessageArgs = AllMiddlewareArgs & SlackEventMiddlewareArgs<"message">
export type MemberJoinedChannelArgs = AllMiddlewareArgs & SlackEventMiddlewareArgs<"member_joined_channel">
export type ShortcutArgs = AllMiddlewareArgs & SlackShortcutMiddlewareArgs<SlackShortcut>

export type WebClient = App["client"]
