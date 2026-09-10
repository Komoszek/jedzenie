import { AppMentionArgs, getMessageText } from "@jedzenie/utils"
import { getFormattedRankingOfConversation } from "../utils/getFormattedRankingOfConversation"
import { tryAddBill } from "../utils/tryAddBill"
import { Dependencies } from "./types"

export async function appMentionHandler(
  { event, client, logger }: AppMentionArgs,
  { state, intlService }: Dependencies,
) {
  const { channel, ts, thread_ts } = event

  const wasBill = await tryAddBill({
    text: getMessageText(event),
    channel,
    ts,
    threadTs: thread_ts,
    client,
    logger,
    state,
    intlService,
  })

  if (wasBill || thread_ts === undefined) {
    return
  }

  const formattedRanking = await getFormattedRankingOfConversation({
    channel,
    ts: thread_ts,
    client,
    state,
    intlService,
  })

  await client.chat.postMessage({
    channel,
    thread_ts,
    ...(formattedRanking
      ? { text: formattedRanking }
      : {
          blocks: [
            {
              type: "image",
              image_url: "https://media3.giphy.com/media/VfyC5j7sR4cso/giphy.gif",
              alt_text: intlService.intl.formatMessage({
                defaultMessage: "So lonely",
                id: "emptyThread.image.atl",
              }),
            },
          ],
        }),
  })
}
