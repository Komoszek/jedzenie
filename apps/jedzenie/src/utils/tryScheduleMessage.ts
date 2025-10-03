import { isObject, WebClient } from "@jedzenie/utils"
import { Logger } from "@slack/bolt"

export async function tryScheduleMessage({
  client,
  message,
  post_at,
  logger
}: {
  client: WebClient
  message: Message
  post_at: number | string
  logger: Logger
}) {
  try {
    const response = await client.chat.scheduleMessage({
      ...message,
      post_at,
    })

    return response.scheduled_message_id
  } catch (e) {
    if (isTimeInPastError(e)) {
      logger.error(e)
      return
    }

    await client.chat.postMessage(message)
  }
}

type Message = NonNullable<Parameters<WebClient["chat"]["postMessage"]>[0]>

function isTimeInPastError(e: unknown) {
  return isObject(e) && "data" in e && isObject(e.data) && "error" in e.data && e.data.error === "time_in_past"
}
