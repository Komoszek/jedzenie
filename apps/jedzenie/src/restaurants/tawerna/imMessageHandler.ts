import { MessageArgs } from "@jedzenie/utils"
import assert from "assert"
import { getTawernaLunchMenuMessage } from "./tawernaCommandHandler"
import { TawernaDependencies } from "./types"

export async function imMessageHandler(
  { payload, client }: MessageArgs,
  { intlService, tawernaMenuService }: TawernaDependencies,
) {
  assert("text" in payload)

  const message = payload.text?.trim() ?? ""

  const match = message.match(/^tawerna (\S+)$/)

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
