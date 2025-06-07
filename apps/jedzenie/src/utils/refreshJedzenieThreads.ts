// import * as v from "valibot"
// import { ensureDefined } from "@leancodepl/utils"
// import { EditButtonValue, editButtonValueSchema, editThreadButtonId } from "../blocks/getEditThreadButtonBlock"
// import { getJedzenieThreadBlocks, JedzenieThreadBlocks, threadActionsBlockId } from "../blocks/getJedzenieThreadBlock"
// import { getTimeFromThreadBlocks } from "../handlers/editThreadButtonHandler"
// import { WebClient } from "../handlers/types"
// import { IntlService } from "../services/IntlService"
// import { RestaurantsService } from "../services/RestaurantsService"
// import { attachEditThreadButton } from "./attachEditThreadButton"
// import { getTimeFromString } from "./getTimeFromString"
// import { knownBlockToText } from "./knownBlockToText"
// import type { KnownBlock } from "@slack/types"

// export async function refreshJedzenieThread({
//     client,
//     jedzenieBotId,
//     restaurantsFilter,
//     restaurantsService,
//     intlService,
// }: {
//     client: WebClient
//     jedzenieBotId: string
//     restaurantsFilter?: string[]
//     restaurantsService: RestaurantsService
//     intlService: IntlService
// }) {

//     const editButton = message.blocks
//         ?.find(({ block_id }) => block_id === threadActionsBlockId)
//         ?.elements?.find(({ action_id }) => action_id === editThreadButtonId)

//     if (!editButton?.value) {
//         continue
//     }

//     let editButtonValue: EditButtonValue

//     try {
//         editButtonValue = v.parse(editButtonValueSchema, JSON.parse(editButton.value))
//     } catch (error) {
//         console.error(error)
//         continue
//     }

//     const oldBlocks = message.blocks as JedzenieThreadBlocks

//     const destination = oldBlocks[0]

//     if (restaurantsFilter) {
//         const restaurantId = restaurantsService.matchRestaurant(knownBlockToText(destination))?.id

//         if (restaurantId) {
//             if (!restaurantsFilter.includes(restaurantId)) {
//                 continue
//             }
//         } else if (!oldBlocks.at(3)) {
//             // no restaurant was previously matched with this thread
//             continue
//         }
//     }

//     const { creatorId, scheduledMessageId } = editButtonValue

//     await client.chat.update({
//         channel: message.channel,
//         ts: ensureDefined(message.ts),
//         blocks: attachEditThreadButton({
//             blocks: getJedzenieThreadBlocks({
//                 destination,
//                 time: getTimeFromString(ensureDefined(getTimeFromThreadBlocks(oldBlocks))),
//                 creatorId,
//                 restaurantsService,
//                 intlService,
//             }),
//             creatorId,
//             scheduledMessageId,
//             intlService,
//         }) as unknown as KnownBlock[],
//     })
// }

// type Message = { channel: string } & NonNullable<
//     Awaited<ReturnType<WebClient["conversations"]["history"]>>["messages"]
// >[number]
