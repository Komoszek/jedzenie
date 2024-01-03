import { CommandArgs } from "./types";

export async function jedzenieCommandHandler({ ack, client, command }: CommandArgs) {
    await ack();

    await client.views.open({
        trigger_id: command.trigger_id,
        view: {
            private_metadata: command.channel_id,
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
                        timezone: "Poland",
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

export const jedzenieViewId = "jedzenie-view";

export const destinationBlockId = "destination-block";
export const destinationInputId = "destination";

export const departureBlockId = "departure-block";
export const departureTimeId = "departure-time";
