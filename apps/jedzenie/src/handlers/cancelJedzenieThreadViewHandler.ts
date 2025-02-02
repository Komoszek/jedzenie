import * as v from "valibot"
import { threadMetadataSchema } from "./editThreadButtonHandler"
import { ViewArgs } from "./types"

export async function cancelJedzenieThreadViewHandler({ ack, view, client }: ViewArgs) {
    const { scheduledMessageId, ts, channel } = v.parse(threadMetadataSchema, JSON.parse(view.private_metadata))

    try {
        await client.chat.deleteScheduledMessage({
            channel,
            scheduled_message_id: scheduledMessageId,
        })

        await client.chat.delete({
            channel,
            ts,
        })

        await ack({ response_action: "clear" })
    } catch {
        await ack({
            response_action: "errors",
            errors: {},
        })
    }
}
