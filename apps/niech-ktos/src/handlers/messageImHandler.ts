import { defineMessages } from "@formatjs/intl"
import { sample } from "@jedzenie/utils"
import { getFormattedRankingOfConversation } from "../utils/getFormattedRankingOfConversation"
import { getEmptyRankingResponse } from "./nkCommandHandler"
import { Dependencies, MessageArgs } from "./types"

export async function messageImHandler({ event, say, client }: MessageArgs, { state, intlService }: Dependencies) {
  if (event.channel_type !== "im" || event.subtype !== undefined) {
    return
  }

  const { ts: threadTs, text } = event

  const match = (text ?? "").trim().match(/^nk (\S+) (\S+)$/)

  if (!match) {
    await say({ thread_ts: threadTs, text: intlService.intl.formatMessage(getInvalidMessageResponse()) })
    return
  }

  const [nkChannel, nkTs] = match.slice(1)

  const formattedRanking = await getFormattedRankingOfConversation({
    channel: nkChannel,
    ts: nkTs,
    client,
    state,
    intlService,
  })

  await client.chat.postMessage({
    channel: nkChannel,
    thread_ts: nkTs,
    text: formattedRanking || intlService.intl.formatMessage(getEmptyRankingResponse()),
  })
}

function getInvalidMessageResponse() {
  return sample(Object.values(invalidMessageMessages))
}

const invalidMessageMessages = defineMessages({
  unknown_one: {
    defaultMessage: "Gargamel, co ty mi tu bajdurzysz?",
    id: "messageIm.error.unknown_one",
  },
  unknown_two: {
    defaultMessage: "Coooo?",
    id: "messageIm.error.unknown_two",
  },
  unknown_three: {
    defaultMessage: "Co mam robić? Hyhy",
    id: "messageIm.error.unknown_three",
  },
  unknown_four: {
    defaultMessage: "Że co?",
    id: "messageIm.error.unknown_four",
  },
})
