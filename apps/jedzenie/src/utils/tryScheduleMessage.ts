import { isObject, WebClient } from "@jedzenie/utils"
import { Logger } from "@slack/bolt"
import type { ChatPostMessageArguments, ChatScheduleMessageArguments } from "@slack/web-api"

export async function tryScheduleMessage({
  client,
  message,
  post_at,
  logger,
}: {
  client: WebClient
  message: ChatPostMessageArguments
  post_at: number | string
  logger: Logger
}) {
  try {
    const response = await client.chat.scheduleMessage({ ...message, post_at } as ChatScheduleMessageArguments)

    return response.scheduled_message_id
  } catch (e) {
    if (isTimeInPastError(e)) {
      logger.error(e)
      return
    }

    await client.chat.postMessage(message)
  }
}

function isTimeInPastError(e: unknown) {
  return isObject(e) && "data" in e && isObject(e.data) && "error" in e.data && e.data.error === "time_in_past"
}
