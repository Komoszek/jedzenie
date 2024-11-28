import { IntlService } from "../services/IntlService"
import { RestaurantsService } from "../services/RestaurantsService"
import { Time } from "./getTimeFromString"
import { knownBlockToText } from "./knownBlockToText"
import type { ActionsBlock, Button, ContextBlock, RichTextBlock, SectionBlock } from "@slack/types"

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
    const { actions, links } = restaurantsService.getBlockDetails(knownBlockToText(destination))

    return [
        destination,
        {
            type: "section",
            text: { type: "mrkdwn", text: `*${time[0]}:${time[1].toString().padStart(2, "0")}* ~ <@${creatorId}>` },
        },
        ...((actions.length > 0
            ? [
                  {
                      block_id: threadActionsBlockId,
                      type: "actions",
                      elements: actions,
                  },
              ]
            : []) as [] | [ActionsBlock]),
        ...((links.length > 0
            ? [
                  {
                      type: "context",
                      elements: [
                          {
                              type: "mrkdwn",
                              text: links.join(" | "),
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
        value: JSON.stringify({ creatorId, scheduledMessageId }),
        action_id: editThreadButtonId,
    }
}

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
    const newBlocks = JSON.parse(JSON.stringify(blocks)) as JedzenieThreadBlocks

    const editThreadButton = getEditThreadButtonBlock({ creatorId, scheduledMessageId, intlService })
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

const threadActionsBlockId = "thread_actions"
export const editThreadButtonId = "edit_thread"

export type JedzenieThreadBlocks = ReturnType<typeof getJedzenieThreadBlocks>
