import { MessageArgs } from "@jedzenie/utils"
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

  await client.chat.postMessage({
    channel,
    ...(await getTawernaLunchMenuMessage(intlService, tawernaMenuService)),
  })

  return true
}
