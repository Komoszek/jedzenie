import { getFormattedRankingOfConversation } from "../utils/getFormattedRankingOfConversation"
import { getEmptyRankingResponse } from "./nkCommandHandler"
import { Dependencies, ShortcutArgs } from "./types"

export async function silentNkShortcutHandler(
    { ack, client, shortcut }: ShortcutArgs,
    { state, intlService }: Dependencies,
) {
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
        additionalParticipants: [shortcut.user.id],
        intlService,
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
                        text: [permalink, formattedRanking ?? intlService.intl.formatMessage(getEmptyRankingResponse())]
                            .filter(Boolean)
                            .join("\n\n"),
                    },
                },
            ],
            title: {
                type: "plain_text",
                text: intlService.intl.formatMessage({ defaultMessage: "Niech ktoś", id: "silentNkView.title" }),
            },
            close: {
                type: "plain_text",
                text: intlService.intl.formatMessage({ defaultMessage: "Fajno", id: "silentNkView.close" }),
            },
        },
    })
}
