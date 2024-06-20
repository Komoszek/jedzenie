import { ActionsBlock, Button, KnownBlock, RichTextBlock, SectionBlock } from "@slack/bolt";
import { Time } from "./getTimeFromString";
import { knownBlockToText } from "./knownBlockToText";

export type DestinationBlock = RichTextBlock | SectionBlock;

export function getJedzenieThreadBlocks({
    destination,
    time,
    creatorId,
}: {
    destination: DestinationBlock;
    time: Time;
    creatorId: string;
}) {
    return [
        destination,
        {
            type: "section",
            text: { type: "mrkdwn", text: `*${time[0]}:${time[1].toString().padStart(2, "0")}* ~ <@${creatorId}>` },
        },
        ...((isTawernaThread(destination)
            ? [
                  {
                      type: "actions",
                      elements: [
                          {
                              type: "button",
                              text: {
                                  type: "plain_text",
                                  text: "Pokaż menu lunchowe",
                                  emoji: true,
                              },
                              action_id: showTawernaLunchMenuButtonId,
                          },
                      ],
                  },
              ]
            : []) as [ActionsBlock] | []),
    ] as const;
}

export function getEditThreadButtonBlock({
    creatorId,
    scheduledMessageId,
}: {
    creatorId: string;
    scheduledMessageId: string;
}): Button {
    return {
        type: "button",
        text: {
            type: "plain_text",
            text: "Edytuj",
            emoji: true,
        },
        value: JSON.stringify({ creatorId, scheduledMessageId }),
        action_id: editThreadButtonId,
    };
}

export function attachEditThreadButton({
    blocks,
    creatorId,
    scheduledMessageId,
}: {
    blocks: JedzenieThreadBlocks;
    creatorId: string;
    scheduledMessageId: string;
}) {
    let newBlocks = JSON.parse(JSON.stringify(blocks)) as JedzenieThreadBlocks;

    const editThreadButton = getEditThreadButtonBlock({ creatorId, scheduledMessageId });

    if (newBlocks.length === 2) {
        newBlocks = [
            ...newBlocks,
            {
                type: "actions",
                elements: [editThreadButton],
            },
        ];
    } else {
        newBlocks[2].elements.unshift(editThreadButton);
    }

    return newBlocks;
}

function isTawernaThread(destination: KnownBlock) {
    const rawText = knownBlockToText(destination).toLowerCase();

    return [":flag-gr:", "tawerna", "twrn", "cyklady"].some(keyword => rawText.includes(keyword));
}

export const showTawernaLunchMenuButtonId = "show_tawerna_lunch_menu";
export const editThreadButtonId = "edit_thread";

export type JedzenieThreadBlocks = ReturnType<typeof getJedzenieThreadBlocks>;
