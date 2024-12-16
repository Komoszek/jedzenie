import { z } from "zod"
import { IntlService } from "../services/IntlService"
import { RestaurantsService } from "../services/RestaurantsService"
import { deepClone } from "./deepClone"
import { Time } from "./getTimeFromString"
import { knownBlockToText } from "./knownBlockToText"
import type { ActionsBlock, Button, ContextBlock, KnownBlock, RichTextBlock, SectionBlock } from "@slack/types"

export type DestinationBlock = RichTextBlock | SectionBlock

export function getJedzenieThreadBlocks({
    destination,
    time,
    creatorId,
    restaurantsService,
    intlService,
}: {
    destination: DestinationBlock
    time: Time
    creatorId: string
    restaurantsService: RestaurantsService
    intlService: IntlService
}) {
    const restaurant = restaurantsService.getBlockDetails(knownBlockToText(destination))

    return [
        destination,
        {
            type: "section",
            text: { type: "mrkdwn", text: `*${time[0]}:${time[1].toString().padStart(2, "0")}* ~ <@${creatorId}>` },
        },
        {
            block_id: threadActionsBlockId,
            type: "actions",
            elements: [
                ...(restaurant?.actions ?? []),
                {
                    type: "overflow",

                    options: [
                        restaurant
                            ? {
                                  text: {
                                      type: "plain_text",
                                      text: intlService.intl.formatMessage({
                                          defaultMessage: "Edytuj linki",
                                          id: "jedzenieThreadBlocks.editLinks",
                                      }),
                                  },
                                  value: JSON.stringify({
                                      id: restaurant.id,
                                      act: ThreadOverflowActions.EditRestaurant,
                                  } satisfies Action),
                              }
                            : {
                                  text: {
                                      type: "plain_text",
                                      text: intlService.intl.formatMessage({
                                          defaultMessage: "Dodaj restaurację",
                                          id: "jedzenieThreadBlocks.addRestaurant",
                                      }),
                                  },
                                  value: JSON.stringify({ act: ThreadOverflowActions.AddRestaurant } satisfies Action),
                              },
                    ],
                    action_id: threadOverflowActionsId,
                },
            ],
        },
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
    ] as const satisfies KnownBlock[]
}

export function getEditThreadButtonBlock({
    creatorId,
    scheduledMessageId,
    intlService,
}: {
    creatorId: string
    scheduledMessageId: string
    intlService: IntlService
}): Button {
    return {
        type: "button",
        text: {
            type: "plain_text",
            text: intlService.intl.formatMessage({ defaultMessage: "Edytuj", id: "jedzenieThreadBlocks.edit" }),
            emoji: true,
        },
        value: JSON.stringify({ creatorId, scheduledMessageId } satisfies EditButtonValue),
        action_id: editThreadButtonId,
    }
}

export const editButtonValueSchema = z.object({
    creatorId: z.string(),
    scheduledMessageId: z.string(),
})

export type EditButtonValue = z.infer<typeof editButtonValueSchema>

export function attachEditThreadButton({
    blocks,
    creatorId,
    scheduledMessageId,
    intlService,
}: {
    blocks: JedzenieThreadBlocks
    creatorId: string
    scheduledMessageId: string
    intlService: IntlService
}) {
    const newBlocks = deepClone(blocks)

    const editThreadButton = getEditThreadButtonBlock({ creatorId, scheduledMessageId, intlService })
    const actions = newBlocks.find(
        block => block.type === "actions" && block.block_id === threadActionsBlockId,
    ) as ActionsBlock

    actions.elements = [editThreadButton, ...actions.elements]

    return newBlocks
}

export const threadActionsBlockId = "thread_actions"
export const editThreadButtonId = "edit_thread"
export const threadOverflowActionsId = "thread_overflow_actions"
export enum ThreadOverflowActions {
    EditRestaurant,
    AddRestaurant,
}

export type JedzenieThreadBlocks = ReturnType<typeof getJedzenieThreadBlocks>

export const overflowActionSchema = z
    .object({
        act: z.literal(ThreadOverflowActions.AddRestaurant),
    })
    .or(
        z.object({
            id: z.string(),
            act: z.literal(ThreadOverflowActions.EditRestaurant),
        }),
    )

type Action = z.infer<typeof overflowActionSchema>
