import { ensureDefined } from "@leancodepl/utils"
import { getSplitwiseGroup } from "../services/splitwise"
import { State } from "../services/state"
import { formatRankingPlace } from "../utils/formatRankingPlace"
import { formatUnconnectedParticipants } from "../utils/formatUnconnectedParticipants"
import { getGroupMemberBalance } from "../utils/getMemberBalancec"
import { Balance } from "../utils/types/Balance"
import { AppMentionArgs, Dependencies, WebClient } from "./types"

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

export async function getFormattedRankingOfConversation({
    channel,
    ts,
    client,
    state,
    includeFirstMessage,
}: {
    channel: string
    ts: string
    client: WebClient
    state: State
    includeFirstMessage?: boolean
}) {
    const { messages } = await client.conversations.replies({
        channel,
        ts,
    })

    const participantIdsSet = new Set(
        messages
            ?.slice(includeFirstMessage ? 0 : 1)
            .filter(({ bot_id }) => !bot_id)
            .map(({ user }) => ensureDefined(user)),
    )

    if (participantIdsSet.size === 0) {
        return
    }

    const unconnectedParticipantIds: string[] = []

    const splitwiseParticipantIdsSet = new Set<number>()

    for (const participantId of participantIdsSet) {
        const splitwiseParticipantId = state.getSplitwiseUserId(participantId)

        if (splitwiseParticipantId) {
            splitwiseParticipantIdsSet.add(splitwiseParticipantId)
        } else {
            unconnectedParticipantIds.push(participantId)
        }
    }

    const {
        data: { group },
    } = await getSplitwiseGroup()

    const formattedRanking = group?.members
        ?.filter(({ id }) => splitwiseParticipantIdsSet.has(ensureDefined(id)))
        .map<Balance>(member => getGroupMemberBalance(member))
        .sort((a, b) => a.balance - b.balance)
        .map(formatRankingPlace)
        .join("\n")

    const formattedUnconnectedParticipants = formatUnconnectedParticipants(unconnectedParticipantIds)

    return [formattedRanking, formattedUnconnectedParticipants].filter(Boolean).join("\n\n")
}
