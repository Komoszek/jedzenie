import { getTimeFromString } from "../utils/getTimeFromString";
import { CommandArgs, Dependencies, WebClient } from "./types";
import { getJedzenieDialogBlocks, jedzenieTimezone } from "../utils/getJedzenieDialogBlocks";
import { startJedzenieThread } from "../utils/startJedzenieThread";

export async function jedzenieCommandHandler(
    { ack, client, command, respond }: CommandArgs,
    { niechKtosBotId }: Dependencies,
) {
    await ack();

    const normalizedText = command.text.trim();

    if (!normalizedText) {
        await openJedzenieDialog({
            client,
            triggerId: command.trigger_id,
            channel: command.channel_id,
        });
        return;
    }

    const match = normalizedText.match(/^(\d{1,4}|\d{1,2}:\d{2})\s+(.+)$/);

    if (!match) {
        await respond("Niepoprawne parametry. Przykład użycia: /jedzenie 12:00 :flag-gr:");
        return;
    }

    const [timeString, destination] = match.slice(1);

    await startJedzenieThread({
        creatorId: command.user_id,
        time: getTimeFromString(timeString),
        client,
        channel: command.channel_id,
        destination: {
            type: "section",
            text: {
                type: "mrkdwn",
                text: destination,
            },
        },
        niechKtosBotId,
        timezone: jedzenieTimezone,
    });
}

export const startJedzenieThreadViewId = "start-jedzenie-thread-view";

function openJedzenieDialog({ client, triggerId, channel }: { client: WebClient; channel: string; triggerId: string }) {
    return client.views.open({
        trigger_id: triggerId,
        view: {
            private_metadata: channel,
            callback_id: startJedzenieThreadViewId,
            title: {
                type: "plain_text",
                text: "Rozpocznij wątek",
            },
            submit: {
                type: "plain_text",
                text: "Rozpocznij",
            },
            type: "modal",
            close: {
                type: "plain_text",
                text: "Anuluj",
            },
            blocks: getJedzenieDialogBlocks(),
        },
    });
}
