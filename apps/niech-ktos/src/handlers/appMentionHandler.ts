import { SlackEventMiddlewareArgs, AllMiddlewareArgs, SayFn } from "@slack/bolt";
import { Dependencies, WebClient } from "./types";
import { ensureDefined } from "@leancodepl/utils";
import { getSplitwiseGroup } from "../services/splitwise";
import { formatRankingPlace } from "../utils/formatRankingPlace";
import { formatUnconnectedParticipants } from "../utils/formatUnconnectedParticipants";
import { getGroupMemberBalance } from "../utils/getMemberBalancec";
import { Balance } from "../utils/types/Balance";
import { State } from "../services/state";

export type AppMentionArgs = SlackEventMiddlewareArgs<"app_mention"> & AllMiddlewareArgs;

export async function appMentionHandler({ event, client }: AppMentionArgs, { state }: Dependencies) {
    if (event.thread_ts === undefined) {
        return;
    }

    await sendRankingToConversation({ channel: event.channel, ts: event.thread_ts, client, state });
}

export async function sendRankingToConversation({
    channel,
    ts,
    client,
    state,
}: {
    channel: string;
    ts: string;
    client: WebClient;
    state: State;
}) {
    const { messages } = await client.conversations.replies({
        channel,
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
        const splitwiseParticipantId = state.getSplitwiseUserId(participantId);

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

    await client.chat.postMessage({
        channel,
        thread_ts: ts,
        text: [formattedRanking, formattedUnconnectedParticipants].filter(Boolean).join("\n\n"),
    });
}
