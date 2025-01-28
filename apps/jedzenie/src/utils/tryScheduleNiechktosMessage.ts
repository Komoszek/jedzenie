import { formatUserMention } from "@jedzenie/utils"
import { WebClient } from "../handlers/types"
import { getDepartureTime } from "./getDepartureTime"
import { Time } from "./getTimeFromString"
import { tryScheduleMessage } from "./tryScheduleMessage"

export function tryScheduleNiechktosMessage({
    client,
    niechKtosBotId,
    channel,
    thread_ts,
    time,
    timezone,
}: {
    client: WebClient
    niechKtosBotId: string
    channel: string
    time: Time
    timezone: string
    thread_ts: string
}) {
    return tryScheduleMessage({
        client,
        message: {
            text: formatUserMention(niechKtosBotId),
            channel,
            thread_ts,
        },
        post_at: getDepartureTime(time, timezone),
    })
}
