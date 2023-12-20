import { ensureDefined } from "@leancodepl/utils";
import { MatchSlackInfo, getSplitwiseGroup, getUsersSplitwiseMatches } from "../services/splitwise";
import { CommandArgs, Dependencies } from "./types";
import { getGroupMemberBalance } from "../utils/getMemberBalancec";
import { Balance } from "../utils/types/Balance";
import { formatRankingPlace } from "../utils/formatRankingPlace";
import { sample } from "../utils/sample";

export async function nkCommandHandler(args: CommandArgs, dependencies: Dependencies) {
    const { command, ack } = args;

    await ack();

    const normalizedText = command.text.trim();

    if (normalizedText === "ranking") {
        return handleUsersRanking(args, dependencies);
    } else {
        return handleUsersMatch({ ...args, normalizedText }, dependencies);
    }
}

function getEmptyRankingResponse() {
    return sample(["Nie ma tu nic ciekawego", "Nic tu nie ma"]);
}

async function handleUsersRanking({ respond }: CommandArgs, { config }: Dependencies) {
    const splitwiseIdMap = config.getSpltwiseIdToSlackIdMap();

    if (splitwiseIdMap.size === 0) {
        return await respond(getEmptyRankingResponse());
    }

    const {
        data: { group },
    } = await getSplitwiseGroup();

    const formattedRanking = group?.members
        ?.filter(({ id }) => splitwiseIdMap.has(ensureDefined(id)))
        .map<Balance>(member => ({
            ...getGroupMemberBalance(member),
            slackId: splitwiseIdMap.get(ensureDefined(member.id)),
        }))
        .sort((a, b) => a.balance - b.balance)
        .map(formatRankingPlace)
        .join("\n");

    await respond(formattedRanking || getEmptyRankingResponse());
}

async function handleUsersMatch(
    { respond, normalizedText }: CommandArgs & { normalizedText: string },
    { app, config }: Dependencies,
) {
    let usersToMatch: MatchSlackInfo[] | undefined;

    if (normalizedText === "sync") {
        const { members } = await app.client.users.list();

        usersToMatch =
            members
                ?.filter(
                    ({ is_bot, profile, is_restricted, is_ultra_restricted }) =>
                        !is_bot && !is_restricted && !is_ultra_restricted && profile?.email,
                )
                .map<MatchSlackInfo>(({ id, profile }) => ({
                    slackId: ensureDefined(id),
                    email: ensureDefined(profile?.email),
                })) ?? [];

        if (usersToMatch.length === 0) {
            return;
        }
    } else {
        const [slackId, email] = [...normalizedText.matchAll(/<@([^|\s]+)|\S+>\s+<mailto:([^\s|]+)|/g)].map(
            (matchArray, i) => matchArray[i + 1],
        );

        if (!slackId || !email) {
            await respond("Niepoprawna komenda. Przykład użycia: /nk @user e-mail_ze_Splitwise'a");
            return;
        }

        usersToMatch = [{ slackId, email }];
    }

    const matches = await getUsersSplitwiseMatches(usersToMatch);

    if (matches.length === 0) {
        await respond(
            usersToMatch.length === 1
                ? "Nie znaleziono takiego e-maila na Splitwise'ie"
                : "Nie znaleziono żadnego z podanych użytkowników na Splitwise'ie",
        );

        return;
    }

    await config.matchManySplitwiseUserIds(matches);

    await respond("Zapisano zmiany");
}
