import { WebClient } from "@jedzenie/utils"
import { Logger } from "@slack/bolt"
import { ensureDefined } from "@leancodepl/utils"
import { DestinationBlock, getJedzenieThreadBlocksAndText } from "../blocks/getJedzenieThreadBlock"
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
  logger
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
  logger: Logger
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
    logger.error(response.error)
    return
  }

  const scheduledMessageId = await tryScheduleNiechktosMessage({
    client,
    niechKtosBotId,
    channel,
    thread_ts: ensureDefined(response.ts),
    time,
    timezone,
    logger,
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
