import { isObject } from "@jedzenie/utils"
import { WebClient } from "../handlers/types"

export async function tryScheduleMessage({
    client,
    message,
    post_at,
}: {
    client: WebClient
    message: Message
    post_at: number | string
}) {
    try {
        const response = await client.chat.scheduleMessage({
            ...message,
            post_at,
        })

        return response.scheduled_message_id
    } catch (e) {
        if (isTimeInPastError(e)) {
            console.error(e)
            return
        }

        await client.chat.postMessage(message)
    }
}

type Message = NonNullable<Parameters<WebClient["chat"]["postMessage"]>[0]>

function isTimeInPastError(e: unknown) {
    return isObject(e) && "data" in e && isObject(e.data) && "error" in e.data && e.data.error === "time_in_past"
}
