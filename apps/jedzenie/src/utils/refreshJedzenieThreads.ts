import dayjs from "dayjs"
import * as v from "valibot"
import { ensureDefined } from "@leancodepl/utils"
import { EditButtonValue, editButtonValueSchema, editThreadButtonId } from "../blocks/getEditThreadButtonBlock"
import {
    getJedzenieThreadBlocksAndText,
    JedzenieThreadBlocks,
    threadActionsBlockId,
} from "../blocks/getJedzenieThreadBlock"
import { getTimeFromThreadBlocks } from "../handlers/editThreadButtonHandler"
import { WebClient } from "../handlers/types"
import { IntlService } from "../services/IntlService"
import { RestaurantsService } from "../services/RestaurantsService"
import { attachEditThreadButton } from "./attachEditThreadButton"
import { getTimeFromString } from "./getTimeFromString"
import { knownBlockToText } from "./knownBlockToText"
import type { KnownBlock } from "@slack/types"

export async function refreshJedzenieThreads({
    client,
    jedzenieBotId,
    restaurantsFilter,
    restaurantsService,
    intlService,
}: {
    client: WebClient
    jedzenieBotId: string
    restaurantsFilter?: string[]
    restaurantsService: RestaurantsService
    intlService: IntlService
}) {
    let messages: Message[] = []
    const oldestMessage = dayjs().subtract(12, "hour").unix().toString()

    const result = await client.users.conversations({})

    if (!result.ok) {
        console.error("Couldn't retrive channels the bot belongs to")
        return
    }

    const channels = result.channels?.reduce<string[]>((acc, { id }) => (id ? [...acc, id] : acc), []) ?? []

    if (channels.length === 0) {
        return
    }

    for (const channel of channels) {
        let cursor: string | undefined

        for (;;) {
            try {
                const result = await client.conversations.history({
                    channel,
                    cursor,
                    oldest: oldestMessage,
                    limit: 300,
                })

                if (!result.ok) {
                    break
                }

                if (result.messages) {
                    messages = [
                        ...result.messages
                            .filter(({ bot_id }) => bot_id === jedzenieBotId)
                            .map<Message>(message => ({ ...message, channel })),
                        ...messages,
                    ]
                }

                if (!result.has_more) {
                    break
                }

                cursor = result.response_metadata?.next_cursor
            } catch (error) {
                console.error(error)
                break
            }
        }
    }

    for (const message of messages) {
        const editButton = message.blocks
            ?.find(({ block_id }) => block_id === threadActionsBlockId)
            ?.elements?.find(({ action_id }) => action_id === editThreadButtonId)

        if (!editButton?.value) {
            continue
        }

        let editButtonValue: EditButtonValue

        try {
            editButtonValue = v.parse(editButtonValueSchema, JSON.parse(editButton.value))
        } catch (error) {
            console.error(error)
            continue
        }

        const oldBlocks = message.blocks as JedzenieThreadBlocks

        const destination = oldBlocks[0]

        if (restaurantsFilter) {
            const restaurantId = restaurantsService.matchRestaurant(knownBlockToText(destination))?.id

            if (restaurantId) {
                if (!restaurantsFilter.includes(restaurantId)) {
                    continue
                }
            } else if (!oldBlocks.at(3)) {
                // no restaurant was previously matched with this thread
                continue
            }
        }

        const { creatorId, scheduledMessageId } = editButtonValue

        const { blocks, text } = getJedzenieThreadBlocksAndText({
            destination,
            time: getTimeFromString(ensureDefined(getTimeFromThreadBlocks(oldBlocks))),
            creatorId,
            restaurantsService,
            intlService,
        })

        await client.chat.update({
            channel: message.channel,
            ts: ensureDefined(message.ts),
            blocks: attachEditThreadButton({
                blocks,
                creatorId,
                scheduledMessageId,
                intlService,
            }) as unknown as KnownBlock[],
            text,
        })
    }
}

type Message = NonNullable<
    Awaited<ReturnType<WebClient["conversations"]["history"]>>["messages"]
>[number] & { channel: string }
