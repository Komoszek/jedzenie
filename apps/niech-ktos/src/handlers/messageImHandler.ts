import { sample } from "../utils/sample";
import { sendRankingToConversation } from "./appMentionHandler";
import { Dependencies, MessageArgs } from "./types";

export async function messageImHandler({ event, say, client }: MessageArgs, { state }: Dependencies) {
    if (event.channel_type !== "im" || event.subtype !== undefined) {
        return;
    }

    const { ts: thread_ts, text } = event;

    const match = (text ?? "").trim().match(/^nk (\S+) (\S+)$/);

    if (!match) {
        await say({ thread_ts, text: getInvalidMessageResponse() });
        return;
    }

    const [nk_channel, nk_ts] = match.slice(1);

    await sendRankingToConversation({ channel: nk_channel, ts: nk_ts, client, state });
}

function getInvalidMessageResponse() {
    return sample(["Gargamel, co ty mi tu bajdurzysz?", "Coooo?", "Co mam robić? Hyhy", "Że co?"]);
}
