import { App, AppOptions } from "@slack/bolt";
import path from "path";
import { Balance } from "./utils/types/Balance";
import { formatRankingPlace } from "./utils/formatRankingPlace";
import { ensureDefined } from "@leancodepl/utils";
import { Config } from "./services/config";
import { MatchSlackInfo, getSplitwiseGroup, getUsersSplitwiseMatches } from "./services/splitwise";
import { getGroupMemberBalance } from "./utils/getMemberBalancec";
import { formatUnconnectedParticipants } from "./utils/formatUnconnectedParticipants";

const options = {
    signingSecret: process.env.SLACK_SIGNING_SECRET,
    token: process.env.SLACK_BOT_TOKEN,
    socketMode: true,
    appToken: process.env.SLACK_APP_TOKEN,
    port: Number(process.env.PORT || 3000),
} satisfies AppOptions;

const config = new Config(path.resolve(process.cwd(), ensureDefined(process.env.CONFIG_PATH)));

const app = new App(options);

app.command("/nk", async ({ command, ack, respond }) => {
    await ack();

    let usersToMatch: MatchSlackInfo[] | undefined;

    const trimmedText = command.text.trim();

    if (trimmedText === "sync") {
        const { members } = await app.client.users.list();

        usersToMatch = members
            ?.filter(({ is_bot, profile }) => !is_bot && profile?.email)
            .map<MatchSlackInfo>(({ id, profile }) => ({
                slackId: ensureDefined(id),
                email: ensureDefined(profile?.email),
            }));

        if (!usersToMatch?.length) {
            return;
        }
    } else {
        const [slackId, email] = [...trimmedText.matchAll(/<@([^|\s]+)|\S+>\s+<mailto:([^\s|]+)|/g)].map(
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
});

app.event("app_mention", async ({ event, say }) => {
    if (event.thread_ts === undefined) {
        return;
    }

    const ts = event.thread_ts;

    const { messages } = await app.client.conversations.replies({
        token: options.token,
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

    const balances = group?.members
        ?.filter(({ id }) => splitwiseParticipantIdsSet.has(ensureDefined(id)))
        .map<Balance>(member => getGroupMemberBalance(member))
        .sort((a, b) => a.balance - b.balance);

    const formattedRanking = balances?.map(formatRankingPlace).join("\n");
    const formattedUnconnectedParticipants = formatUnconnectedParticipants(unconnectedParticipantIds);

    await say({
        thread_ts: ts,
        text: [formattedRanking, formattedUnconnectedParticipants].filter(Boolean).join("\n\n"),
    });
});

(async () => {
    await app.start();

    console.log("⚡️ Niech ktos is running!");
})();
