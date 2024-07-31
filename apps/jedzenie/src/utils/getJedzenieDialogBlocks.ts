import { KnownBlock, RichTextBlock } from "@slack/bolt";

export function getJedzenieDialogBlocks(
    { initialTime, initialDestination }: { initialTime?: string; initialDestination?: RichTextBlock } = {
        initialTime: "12:00",
    },
): KnownBlock[] {
    return [
        {
            block_id: destinationBlockId,
            type: "input",
            element: {
                type: "rich_text_input",
                action_id: destinationInputId,
                initial_value: initialDestination,
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
                initial_time: initialTime,
            },
            label: {
                type: "plain_text",
                text: "Godzina odjazdu",
                emoji: true,
            },
        },
    ];
}

export const destinationBlockId = "destination-block";
export const destinationInputId = "destination";

export const departureBlockId = "departure-block";
export const departureTimeId = "departure-time";

export const jedzenieTimezone = "Poland";
