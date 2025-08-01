import { ViewArgs, WebClient } from "@jedzenie/utils"
import dayjs from "dayjs"
import timezone from "dayjs/plugin/timezone"
import utc from "dayjs/plugin/utc"
import * as v from "valibot"
import { ensureDefined } from "@leancodepl/utils"
import {
  departureBlockId,
  departureTimeId,
  destinationBlockId,
  destinationInputId,
} from "../blocks/getJedzenieDialogBlocks"
import { DestinationBlock, getJedzenieThreadBlocksAndText } from "../blocks/getJedzenieThreadBlock"
import { IntlService } from "../services/IntlService"
import { RestaurantsService } from "../services/RestaurantsService"
import { attachEditThreadButton } from "../utils/attachEditThreadButton"
import { getTimeFromString, Time } from "../utils/getTimeFromString"
import { tryScheduleNiechktosMessage } from "../utils/tryScheduleNiechktosMessage"
import { threadMetadataSchema } from "./editThreadButtonHandler"
import { Dependencies } from "./types"
import type { ViewStateValue } from "@slack/bolt"
import type { KnownBlock } from "@slack/types"

dayjs.extend(utc)
dayjs.extend(timezone)

export async function editJedzenieThreadViewHandler(
  { ack, view, client, body }: ViewArgs,
  { niechKtosBotId, restaurantsService, intlService }: Dependencies,
) {
  // eslint-disable-next-line @typescript-eslint/naming-convention
  const { timezone, selected_time } = view.state.values[departureBlockId][departureTimeId] as ViewStateValue & {
    timezone: string
  }

  if (!selected_time) {
    await ack({
      view: view.id,
      response_action: "errors",
      errors: {
        [departureBlockId]: intlService.intl.formatMessage({
          defaultMessage: "Godzina odjazdu jest wymagana",
          id: "jedzenieThreadHandler.error.departureTimeIsRequired",
        }),
      },
    })
    return
  }

  const { channel, ts, scheduledMessageId } = v.parse(threadMetadataSchema, JSON.parse(view.private_metadata))

  await editJedzenieThread({
    ts,
    creatorId: body.user.id,
    time: getTimeFromString(selected_time),
    destination: ensureDefined(view.state.values[destinationBlockId][destinationInputId].rich_text_value),
    channel,
    timezone,
    client,
    niechKtosBotId,
    scheduledMessageId,
    ack,
    restaurantsService,
    intlService,
  })
}

async function editJedzenieThread({
  ts,
  creatorId,
  channel,
  time,
  timezone,
  destination,
  client,
  niechKtosBotId,
  scheduledMessageId,
  ack,
  restaurantsService,
  intlService,
}: {
  ts: string
  creatorId: string
  channel: string
  time: Time
  timezone: string
  destination: DestinationBlock
  client: WebClient
  niechKtosBotId: string
  scheduledMessageId: string
  ack: ViewArgs["ack"]
  restaurantsService: RestaurantsService
  intlService: IntlService
}) {
  try {
    await client.chat.deleteScheduledMessage({
      channel,
      scheduled_message_id: scheduledMessageId,
    })
  } catch (e) {
    console.error(e)
    await ack({
      response_action: "errors",
      errors: {
        [departureBlockId]: intlService.intl.formatMessage({
          defaultMessage: "Sorki memorki, nie da się już zmienić godziny odjazdu.",
          id: "jedzenieHandler.error.departureTimeCanNoLongerBeChanged",
        }),
      },
    })
    return
  }

  await ack()

  const { blocks, text } = getJedzenieThreadBlocksAndText({
    destination,
    time,
    creatorId,
    restaurantsService,
    intlService,
  })

  const response = await client.chat.update({
    channel,
    ts,
    blocks: blocks as unknown as KnownBlock[],
    text,
  })

  if (!response.ok) {
    console.error(response.error)
    return
  }

  const newScheduledMessageId = await tryScheduleNiechktosMessage({
    client,
    niechKtosBotId,
    channel,
    thread_ts: ensureDefined(response.ts),
    time,
    timezone,
  })

  if (!newScheduledMessageId) {
    return
  }

  await client.chat.update({
    channel,
    ts: ensureDefined(response.ts),
    blocks: attachEditThreadButton({
      blocks,
      creatorId,
      scheduledMessageId: newScheduledMessageId,
      intlService,
    }) as unknown as KnownBlock[],
    text,
  })
}
