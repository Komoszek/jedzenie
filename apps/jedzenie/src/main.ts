import { App, AppOptions } from "@slack/bolt";
import path from "path";
import { Config } from "./services/config";
import { splitwiseGroupId, splitwiseGroupsApi } from "./services/splitwise";
import { Balance } from "./utils/types/Balance";
import { formatRankingPlace } from "./utils/formatRankingPlace";

const options = {
    signingSecret: process.env.SLACK_SIGNING_SECRET,
    token: process.env.SLACK_BOT_TOKEN,
    socketMode: true,
    appToken: process.env.SLACK_APP_TOKEN,
    port: Number(process.env.PORT || 3000),
} satisfies AppOptions;

const config = new Config(path.resolve(process.cwd(), process.env.CONFIG_PATH));

const app = new App(options);

app.command("/niechktos", async ({ command, ack, respond }) => {
    await ack();

    const [slackUserId, splitwiseEmail] = [...command.text.matchAll(/\s*<@([^|\s]+)|\S+>\s+<mailto:([^\s|]+)|/g)].map(
        (v, i) => v[i + 1],
    );

    if (slackUserId === undefined || splitwiseEmail === undefined) {
        await respond("Niepoprawna komenda. Przykład użycia: /niechktos @user e-mail_ze_splitwise'a");
        return;
    }

    const { data } = await splitwiseGroupsApi.getGroupIdGet(splitwiseGroupId);

    const splitwiseMember = data.group.members.find(({ email }) => email === splitwiseEmail);

    if (!splitwiseMember) {
        await respond("Nie znaleziono takiego e-maila na splitwise'ie");
        return;
    }

    await config.updateSplitwiseUserId(slackUserId, splitwiseMember.id.toString());

    await respond("Zapisano zmiany");
});

app.event("app_mention", async ({ event, say }) => {
    const ts = event.thread_ts ?? event.ts;

    if (event.thread_ts === undefined) {
        return;
    }

    const conversation = await app.client.conversations.replies({
        token: options.token,
        channel: event.channel,
        ts,
    });

    const userIds = conversation.messages
        .slice(1)
        .filter(({ bot_id }) => !bot_id)
        .map(({ user }) => user);

    if (userIds.length === 0) {
        return;
    }

    const participants = new Set(userIds.map(id => config.getSplitwiseUserId(id)).filter(Boolean));

    const { data } = await splitwiseGroupsApi.getGroupIdGet(splitwiseGroupId);

    const balances = data.group.members
        .filter(({ id }) => participants.has(id.toString()))
        .map<Balance>(({ first_name, last_name, balance }) => {
            const amount = balance.find(({ currency_code }) => currency_code === "PLN")?.amount ?? 0;

            return {
                name: [first_name, last_name].filter(Boolean).join(" "),
                balance: Number(amount),
            };
        })
        .sort((a, b) => a.balance - b.balance);

    await say({
        thread_ts: ts,
        text: balances.map(formatRankingPlace).join("\n") || "Nikogo tutaj nie znam",
    });
});

(async () => {
    await app.start();

    console.log("⚡️ Niech ktos is running!");
})();
