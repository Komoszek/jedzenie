import { ActionArgs, mrkdwnToRichText } from "@jedzenie/utils"
import { openJedzenieDialog } from "./jedzenieCommandHandler"
import { Dependencies } from "./types"

export async function startJedzenieThreadButtonHandler(
  { ack, client, body, payload }: ActionArgs,
  { intlService }: Dependencies,
) {
  await ack()

  if (body.type !== "block_actions" || payload.type !== "button" || !body.channel) {
    return
  }

  await openJedzenieDialog({
    client,
    triggerId: body.trigger_id,
    channel: body.channel.id,
    initialDestination: payload.value ? mrkdwnToRichText(payload.value) : undefined,
    intlService,
  })
}
