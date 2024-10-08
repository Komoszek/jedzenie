import { ActionsBlock, Button, ContextBlock, RichTextBlock, SectionBlock } from "@slack/bolt"
import { RestaurantsService } from "../services/RestaurantsService"
import { Time } from "./getTimeFromString"
import { knownBlockToText } from "./knownBlockToText"

export type DestinationBlock = RichTextBlock | SectionBlock

export function getJedzenieThreadBlocks({
    destination,
    time,
    creatorId,
    restaurantsService,
}: {
    destination: DestinationBlock
    time: Time
    creatorId: string
    restaurantsService: RestaurantsService
}) {
    const destinationText = knownBlockToText(destination).trim().toLowerCase().replace(/\s+/g, " ")
    const restaurant = restaurantsService.recognizeRestaurant(destinationText)

    return [
        destination,
        {
            type: "section",
            text: { type: "mrkdwn", text: `*${time[0]}:${time[1].toString().padStart(2, "0")}* ~ <@${creatorId}>` },
        },
        ...((restaurant?.id === tawernaId
            ? [
                  {
                      block_id: threadActionsBlockId,
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
            : []) as [] | [ActionsBlock]),
        ...((restaurant && restaurant.links.length > 0
            ? [
                  {
                      type: "context",
                      elements: [
                          {
                              type: "mrkdwn",
                              text: restaurant.links.join(" | "),
                          },
                      ],
                  },
              ]
            : []) as [] | [ContextBlock]),
    ] as const
}

export function getEditThreadButtonBlock({
    creatorId,
    scheduledMessageId,
}: {
    creatorId: string
    scheduledMessageId: string
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
    }
}

export function attachEditThreadButton({
    blocks,
    creatorId,
    scheduledMessageId,
}: {
    blocks: JedzenieThreadBlocks
    creatorId: string
    scheduledMessageId: string
}) {
    const newBlocks = JSON.parse(JSON.stringify(blocks)) as JedzenieThreadBlocks

    const editThreadButton = getEditThreadButtonBlock({ creatorId, scheduledMessageId })
    const actions = newBlocks.find(
        block => block.type === "actions" && block.block_id === threadActionsBlockId,
    ) as ActionsBlock

    if (actions) {
        actions.elements = [editThreadButton, ...actions.elements]

        return newBlocks
    }

    return [
        ...newBlocks.slice(0, 2),
        {
            block_id: threadActionsBlockId,
            type: "actions",
            elements: [editThreadButton],
        },
        ...newBlocks.slice(2),
    ]
}

const tawernaId = "tawerna"

const threadActionsBlockId = "thread_actions"
export const showTawernaLunchMenuButtonId = "show_tawerna_lunch_menu"
export const editThreadButtonId = "edit_thread"

export type JedzenieThreadBlocks = ReturnType<typeof getJedzenieThreadBlocks>
