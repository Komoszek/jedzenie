import { getFormattedRankingOfConversation } from "./appMentionHandler"
import { getEmptyRankingResponse } from "./nkCommandHandler"
import { Dependencies, ShortcutArgs } from "./types"

export async function silentNkShortcutHandler({ ack, client, shortcut }: ShortcutArgs, { state }: Dependencies) {
    await ack()

    if (shortcut.type !== "message_action") {
        return
    }
    const {
        message_ts,
        channel: { id: channel },
    } = shortcut

    const formattedRanking = await getFormattedRankingOfConversation({
        channel,
        ts: message_ts,
        client,
        state,
        includeFirstMessage: true,
    })

    const { permalink } = await client.chat.getPermalink({ channel, message_ts })

    await client.views.open({
        trigger_id: shortcut.trigger_id,
        view: {
            type: "modal",
            blocks: [
                {
                    type: "section",
                    text: {
                        type: "mrkdwn",
                        text: [permalink, formattedRanking ?? getEmptyRankingResponse()].filter(Boolean).join("\n\n"),
                    },
                },
            ],
            title: {
                type: "plain_text",
                text: "Niech ktoś",
            },
            close: {
                type: "plain_text",
                text: "Fajno",
            },
        },
    })
}
