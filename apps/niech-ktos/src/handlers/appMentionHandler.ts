import { getFormattedRankingOfConversation } from "../utils/getFormattedRankingOfConversation"
import { AppMentionArgs, Dependencies } from "./types"

export async function appMentionHandler(
    { event: { channel, thread_ts }, client }: AppMentionArgs,
    { state }: Dependencies,
) {
    if (thread_ts === undefined) {
        return
    }

    const formattedRanking = await getFormattedRankingOfConversation({ channel, ts: thread_ts, client, state })

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
                          alt_text: "So lonely",
                      },
                  ],
              }),
    })
}
