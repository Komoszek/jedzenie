import { defineMessages } from "@formatjs/intl"
import { MessageArgs, sample } from "@jedzenie/utils"
import { Dependencies } from "./types"

export async function messageImHandler({ event, say }: MessageArgs, { intlService, restaurantsService }: Dependencies) {
  if (event.channel_type !== "im" || event.subtype !== undefined) {
    return
  }

  const { ts: threadTs, text = "" } = event

  const message = text.trim()

  for (const { handler } of restaurantsService.getRestaurantImHandlers()) {
    const result = await handler(message)

    if (result) {
      return
    }
  }

  await say({ thread_ts: threadTs, text: intlService.intl.formatMessage(getInvalidMessageResponse()) })
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
