import { formatUserMention, WebClient } from "@jedzenie/utils"
import { getDepartureTime } from "./getDepartureTime"
import { Time } from "./getTimeFromString"
import { tryScheduleMessage } from "./tryScheduleMessage"
import { Logger } from "@slack/bolt"

export function tryScheduleNiechktosMessage({
  client,
  niechKtosBotId,
  channel,
  thread_ts,
  time,
  timezone,
  logger,
}: {
  client: WebClient
  niechKtosBotId: string
  channel: string
  time: Time
  timezone: string
  thread_ts: string
  logger: Logger
}) {
  return tryScheduleMessage({
    client,
    message: {
      text: formatUserMention(niechKtosBotId),
      channel,
      thread_ts,
    },
    post_at: getDepartureTime(time, timezone),
    logger,
  })
}
