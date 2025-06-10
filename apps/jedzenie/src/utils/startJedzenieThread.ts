import { ensureDefined } from "@leancodepl/utils"
import { DestinationBlock, getJedzenieThreadBlocksAndText } from "../blocks/getJedzenieThreadBlock"
import { WebClient } from "../handlers/types"
import { IntlService } from "../services/IntlService"
import { RestaurantsService } from "../services/RestaurantsService"
import { attachEditThreadButton } from "./attachEditThreadButton"
import { Time } from "./getTimeFromString"
import { tryScheduleNiechktosMessage } from "./tryScheduleNiechktosMessage"
import type { KnownBlock } from "@slack/types"

export async function startJedzenieThread({
    creatorId,
    channel,
    time,
    timezone,
    destination,
    client,
    niechKtosBotId,
    restaurantsService,
    intlService,
}: {
    creatorId: string
    channel: string
    time: Time
    timezone: string
    destination: DestinationBlock
    client: WebClient
    niechKtosBotId: string
    restaurantsService: RestaurantsService
    intlService: IntlService
}) {
    const { blocks, text } = getJedzenieThreadBlocksAndText({
        destination,
        time,
        creatorId,
        restaurantsService,
        intlService,
    })

    const response = await client.chat.postMessage({
        channel,
        unfurl_links: false,
        unfurl_media: false,
        blocks: blocks as unknown as KnownBlock[],
        text,
    })

    if (!response.ok) {
        console.error(response.error)
        return
    }

    const scheduledMessageId = await tryScheduleNiechktosMessage({
        client,
        niechKtosBotId,
        channel,
        thread_ts: ensureDefined(response.ts),
        time,
        timezone,
    })

    if (!scheduledMessageId) {
        return
    }

    await client.chat.update({
        channel,
        ts: ensureDefined(response.ts),
        blocks: attachEditThreadButton({
            blocks,
            creatorId,
            scheduledMessageId,
            intlService,
        }) as unknown as KnownBlock[],
        text,
    })
}
