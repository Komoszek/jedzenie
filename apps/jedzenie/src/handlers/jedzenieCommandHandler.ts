import { getTimeFromString } from "../utils/getTimeFromString";
import { startJedzenieThread } from "./jedzenieViewSubmissionHandler";
import { CommandArgs, Dependencies, WebClient } from "./types";

export async function jedzenieCommandHandler(
    { ack, client, command, respond }: CommandArgs,
    { niechKtosBotId }: Dependencies,
) {
    await ack();

    const normalizedText = command.text.trim();

    if (!normalizedText) {
        await openJedzenieDialog({ client, trigger_id: command.trigger_id, channel_id: command.channel_id });
        return;
    }

    const match = normalizedText.match(/^(\d{1,2}|\d{1,2}:\d{2})\s+(.+)$/);

    if (!match) {
        await respond("Niepoprawne parametry. Przykład użycia: /jedzenie 12:00 :flag_gr:");
        return;
    }

    const [timeString, destination] = match.slice(1);

    await startJedzenieThread({
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

export const jedzenieViewId = "jedzenie-view";

export const destinationBlockId = "destination-block";
export const destinationInputId = "destination";

export const departureBlockId = "departure-block";
export const departureTimeId = "departure-time";

const jedzenieTimezone = "Poland";

function openJedzenieDialog({
    client,
    trigger_id,
    channel_id,
}: {
    client: WebClient;
    channel_id: string;
    trigger_id: string;
}) {
    return client.views.open({
        trigger_id,
        view: {
            private_metadata: channel_id,
            callback_id: jedzenieViewId,
            title: {
                type: "plain_text",
                text: "Rozpocznij wątek",
                emoji: true,
            },
            submit: {
                type: "plain_text",
                text: "Rozpocznij",
                emoji: true,
            },
            type: "modal",
            close: {
                type: "plain_text",
                text: "Anuluj",
                emoji: true,
            },
            blocks: [
                {
                    block_id: destinationBlockId,
                    type: "input",
                    element: {
                        type: "rich_text_input",
                        action_id: destinationInputId,
                    },
                    label: {
                        type: "plain_text",
                        text: "Opis",
                        emoji: true,
                    },
                },
                {
                    block_id: departureBlockId,
                    type: "input",
                    optional: false,
                    element: {
                        type: "timepicker",
                        placeholder: {
                            type: "plain_text",
                            text: "Wybierz godzinę odjazdu",
                            emoji: true,
                        },
                        action_id: departureTimeId,
                        timezone: jedzenieTimezone,
                        initial_time: "12:00",
                    },
                    label: {
                        type: "plain_text",
                        text: "Godzina odjazdu",
                        emoji: true,
                    },
                },
            ],
        },
    });
}
