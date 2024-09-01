import { ensureDefined } from "@leancodepl/utils"
import { WebClient } from "../handlers/types"
import { splitwiseService } from "../services/splitwise"
import { State } from "../services/state"
import { formatRankingPlace } from "./formatRankingPlace"
import { formatUnconnectedParticipants } from "./formatUnconnectedParticipants"
import { getGroupMemberBalance } from "./getMemberBalancec"
import { Balance } from "./types/Balance"

export async function getFormattedRankingOfConversation({
    channel,
    ts,
    client,
    state,
    additionalParticipants = [],
}: {
    channel: string
    ts: string
    client: WebClient
    state: State
    additionalParticipants?: string[]
}) {
    const { messages = [] } = await client.conversations.replies({
        channel,
        ts,
    })

    const participantIdsSet = new Set([
        ...messages.filter(({ bot_id }) => !bot_id).map(({ user }) => ensureDefined(user)),
        ...additionalParticipants,
    ])

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
    } = await splitwiseService.getGroup()

    const formattedRanking = group?.members
        ?.filter(({ id }) => splitwiseParticipantIdsSet.has(ensureDefined(id)))
        .map<Balance>(member => getGroupMemberBalance(member))
        .sort((a, b) => a.balance - b.balance)
        .map(formatRankingPlace)
        .join("\n")

    const formattedUnconnectedParticipants = formatUnconnectedParticipants(unconnectedParticipantIds)

    return [formattedRanking, formattedUnconnectedParticipants].filter(Boolean).join("\n\n")
}
