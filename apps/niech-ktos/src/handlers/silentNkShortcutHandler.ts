import { Dependencies, ShortcutArgs } from "./types";
import { getFormattedRankingOfConversation } from "./appMentionHandler";
import { getEmptyRankingResponse } from "./nkCommandHandler";

export async function silentNkShortcutHandler(
    { ack, client, respond, shortcut }: ShortcutArgs,
    { state }: Dependencies,
) {
    await ack();

    if (shortcut.type !== "message_action") {
        return;
    }
    const {
        message_ts,
        channel: { id: channel },
    } = shortcut;

    const formattedRanking = await getFormattedRankingOfConversation({
        channel,
        ts: message_ts,
        client,
        state,
        includeFirstMessage: true,
    });

    const { permalink } = await client.chat.getPermalink({ channel, message_ts });

    await respond([permalink, formattedRanking ?? getEmptyRankingResponse()].filter(Boolean).join("\n\n"));
}
