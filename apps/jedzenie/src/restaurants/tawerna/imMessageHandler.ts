import { MessageArgs } from "@jedzenie/utils"
import { getStartThreadButtonBlock } from "../../blocks/getStartThreadButtonBlock"
import { getTawernaLunchMenuMessage } from "./tawernaCommandHandler"
import { TawernaDependencies } from "./types"

export async function imMessageHandler(
  { payload, client }: MessageArgs,
  { intlService, tawernaMenuService }: TawernaDependencies,
) {
  if (!("text" in payload)) {
    return false
  }

  const match = payload.text?.trim().match(/^tawerna (\S+)$/)

  if (!match) {
    return false
  }

  const [channel] = match.slice(1)

  const messageProps = await getTawernaLunchMenuMessage(intlService, tawernaMenuService)

  await client.chat.postMessage({
    channel,
    ...messageProps,
    blocks: [
      ...messageProps.blocks,
      {
        type: "actions",
        elements: [getStartThreadButtonBlock({ initialDestination: "Tawerna", intlService })],
      },
    ],
  })

  return true
}
