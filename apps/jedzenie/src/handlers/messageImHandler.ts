import { defineMessages } from "@formatjs/intl"
import { MessageArgs, sample } from "@jedzenie/utils"
import { Dependencies } from "./types"

export async function messageImHandler(props: MessageArgs, { intlService, restaurantsService }: Dependencies) {
  const { event, say } = props
  if (event.channel_type !== "im") {
    return
  }

  for (const { handler } of restaurantsService.getRestaurantImHandlers()) {
    try {
      const result = await handler(props)

      if (result) {
        return
      }
    } catch (error) {
      console.error(error)
    }
  }

  await say({ thread_ts: event.ts, text: intlService.intl.formatMessage(getInvalidMessageResponse()) })
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
