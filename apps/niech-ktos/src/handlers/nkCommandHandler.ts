import { defineMessages } from "@formatjs/intl"
import { sample } from "@jedzenie/utils"
import { ensureDefined } from "@leancodepl/utils"
import { MatchSlackInfo, splitwiseService } from "../services/splitwise"
import { formatRankingPlace } from "../utils/formatRankingPlace"
import { getGroupMemberBalance } from "../utils/getGroupMemberBalance"
import { Balance } from "../utils/types/Balance"
import { CommandArgs, Dependencies } from "./types"

export async function nkCommandHandler(args: CommandArgs, dependencies: Dependencies) {
    const { command, ack } = args

    await ack()

    const normalizedText = command.text.trim()

    if (normalizedText === "ranking") {
        return handleUsersRanking(args, dependencies)
    } else {
        return handleUsersMatch({ ...args, normalizedText }, dependencies)
    }
}

export function getEmptyRankingResponse() {
    return sample(Object.values(emptyRankingMessages))
}

const emptyRankingMessages = defineMessages({
    empty_one: {
        defaultMessage: "Nie ma tu nic ciekawego",
        id: "ranking.empty_one",
    },
    empty_two: {
        defaultMessage: "Nic tu nie ma",
        id: "ranking.empty_two",
    },
})

async function handleUsersRanking({ respond }: CommandArgs, { state, intlService }: Dependencies) {
    const splitwiseIdMap = state.getSpltwiseIdToSlackIdMap()

    if (splitwiseIdMap.size === 0) {
        return await respond(intlService.intl.formatMessage(getEmptyRankingResponse()))
    }

    const {
        data: { group },
    } = await splitwiseService.getGroup()

    const formattedRanking = group?.members
        ?.filter(({ id }) => splitwiseIdMap.has(ensureDefined(id)))
        .map<Balance>(member => ({
            ...getGroupMemberBalance(member),
            slackId: splitwiseIdMap.get(ensureDefined(member.id)),
        }))
        .sort((a, b) => a.balance - b.balance)
        .map((balance, index) => formatRankingPlace(balance, index + 1, intlService))
        .join("\n")

    await respond(formattedRanking || intlService.intl.formatMessage(getEmptyRankingResponse()))
}

async function handleUsersMatch(
    { respond, normalizedText, client }: { normalizedText: string } & CommandArgs,
    { state, intlService }: Dependencies,
) {
    let usersToMatch: MatchSlackInfo[] | undefined

    const isSync = normalizedText === "sync"

    if (isSync) {
        const { members } = await client.users.list({})

        usersToMatch =
            members
                ?.filter(
                    ({ is_bot, profile, is_restricted, is_ultra_restricted, deleted }) =>
                        !is_bot && !is_restricted && !is_ultra_restricted && !deleted && profile?.email,
                )
                .map<MatchSlackInfo>(({ id, profile }) => ({
                    slackId: ensureDefined(id),
                    email: ensureDefined(profile?.email),
                })) ?? []

        if (usersToMatch.length === 0) {
            return
        }
    } else {
        const [slackId, email] = [...normalizedText.matchAll(/<@([^|\s]+)|\S+>\s+<mailto:([^\s|]+)|/g)].map(
            (matchArray, i) => matchArray[i + 1],
        )

        if (!slackId || !email) {
            await respond(
                intlService.intl.formatMessage({
                    defaultMessage: "Niepoprawna komenda. Przykład użycia: /nk @user e-mail_ze_Splitwise'a",
                    id: "nkCommand.error.invalidParams",
                }),
            )
            return
        }

        usersToMatch = [{ slackId, email }]
    }

    const matches = await splitwiseService.getUsersSplitwiseMatches(usersToMatch)

    if (!isSync && matches.length === 0) {
        await respond(
            intlService.intl.formatMessage({
                defaultMessage: "Nie znaleziono takiego e-maila na Splitwise'ie",
                id: "usersMatch.error.one",
            }),
        )

        return
    }

    await state.matchSplitwiseUserIds(matches)

    await respond(intlService.intl.formatMessage({ defaultMessage: "Zapisano zmiany", id: "usersMatch.success" }))
}
