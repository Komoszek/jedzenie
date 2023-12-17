import { SlackEventMiddlewareArgs, AllMiddlewareArgs } from "@slack/bolt";
import { Dependencies } from "./types";
import { ensureDefined } from "@leancodepl/utils";
import { getSplitwiseGroup } from "../services/splitwise";
import { formatRankingPlace } from "../utils/formatRankingPlace";
import { formatUnconnectedParticipants } from "../utils/formatUnconnectedParticipants";
import { getGroupMemberBalance } from "../utils/getMemberBalancec";
import { Balance } from "../utils/types/Balance";

export type AppMentionArgs = SlackEventMiddlewareArgs<"app_mention"> & AllMiddlewareArgs;

export async function appMentionHandler({ event, say }: AppMentionArgs, { app, config }: Dependencies) {
    if (event.thread_ts === undefined) {
        return;
    }

    const ts = event.thread_ts;

    const { messages } = await app.client.conversations.replies({
        channel: event.channel,
        ts,
    });

    const participantIdsSet = new Set(
        messages
            ?.slice(1)
            .filter(({ bot_id }) => !bot_id)
            .map(({ user }) => ensureDefined(user)),
    );

    if (participantIdsSet.size === 0) {
        return;
    }

    const unconnectedParticipantIds: string[] = [];

    const splitwiseParticipantIdsSet = new Set<number>();

    for (const participantId of participantIdsSet) {
        const splitwiseParticipantId = config.getSplitwiseUserId(participantId);

        if (splitwiseParticipantId) {
            splitwiseParticipantIdsSet.add(splitwiseParticipantId);
        } else {
            unconnectedParticipantIds.push(participantId);
        }
    }

    const {
        data: { group },
    } = await getSplitwiseGroup();

    const formattedRanking = group?.members
        ?.filter(({ id }) => splitwiseParticipantIdsSet.has(ensureDefined(id)))
        .map<Balance>(member => getGroupMemberBalance(member))
        .sort((a, b) => a.balance - b.balance)
        .map(formatRankingPlace)
        .join("\n");

    const formattedUnconnectedParticipants = formatUnconnectedParticipants(unconnectedParticipantIds);

    await say({
        thread_ts: ts,
        text: [formattedRanking, formattedUnconnectedParticipants].filter(Boolean).join("\n\n"),
    });
}
