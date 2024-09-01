import { getSplitwiseGroup } from "./getSplitwiseGroup"

export type MatchSlackInfo = {
    slackId: string
    email: string
}

export type SplitwiseMatch = {
    slackId: string
    splitwiseId: number
}

export async function getUsersSplitwiseMatches(usersToMatch: MatchSlackInfo[]): Promise<SplitwiseMatch[]> {
    const {
        data: { group },
    } = await getSplitwiseGroup()

    const splitwiseIdsMap = new Map(group?.members?.map(({ email, id }) => [email, id]))

    return usersToMatch.reduce<SplitwiseMatch[]>((accumulator, { slackId, email }) => {
        const splitwiseId = splitwiseIdsMap.get(email)

        if (splitwiseId === undefined) {
            return accumulator
        }

        return [...accumulator, { slackId, splitwiseId }]
    }, [])
}
