import { formatUserMention } from "@jedzenie/utils"
import * as v from "valibot"
import { IntlService } from "../services/IntlService"
import { RestaurantsService } from "../services/RestaurantsService"
import { Time } from "../utils/getTimeFromString"
import { knownBlockToText } from "../utils/knownBlockToText"
import type { ContextBlock, KnownBlock, RichTextBlock } from "@slack/types"

export type DestinationBlock = RichTextBlock

type GetJedzenieTheadBlocksProps = {
    destination: DestinationBlock
    time: Time
    creatorId: string
    restaurantsService: RestaurantsService
    intlService: IntlService
}

export function getJedzenieThreadBlocks({
    destination,
    time: { hour, minutes },
    creatorId,
    restaurantsService,
    intlService,
}: GetJedzenieTheadBlocksProps) {
    const restaurant = restaurantsService.getBlockDetails(knownBlockToText(destination))

    return [
        destination,
        {
            type: "section",
            text: {
                type: "mrkdwn",
                text: `*${hour}:${minutes.toString().padStart(2, "0")}* ~ ${formatUserMention(creatorId)}`,
            },
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

export const threadActionsBlockId = "thread_actions"
export const threadOverflowActionsId = "thread_overflow_actions"
export enum ThreadOverflowActions {
    EditRestaurant,
    AddRestaurant,
}

export type JedzenieThreadBlocks = ReturnType<typeof getJedzenieThreadBlocks>

export const overflowActionSchema = v.union([
    v.object({
        act: v.literal(ThreadOverflowActions.AddRestaurant),
    }),
    v.object({
        id: v.string(),
        act: v.literal(ThreadOverflowActions.EditRestaurant),
    }),
])

type Action = v.InferOutput<typeof overflowActionSchema>

export function getJedzenieThreadText(blocks: JedzenieThreadBlocks) {
    return blocks.slice(0, 2).map(knownBlockToText).join(" ")
}

export function getJedzenieThreadBlocksAndText(props: GetJedzenieTheadBlocksProps) {
    const blocks = getJedzenieThreadBlocks(props)

    return { blocks, text: getJedzenieThreadText(blocks) }
}
