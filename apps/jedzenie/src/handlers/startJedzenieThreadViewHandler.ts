import { ViewArgs } from "@jedzenie/utils"
import { ViewStateValue } from "@slack/bolt"
import dayjs from "dayjs"
import timezone from "dayjs/plugin/timezone"
import utc from "dayjs/plugin/utc"
import { ensureDefined } from "@leancodepl/utils"
import {
  departureBlockId,
  departureTimeId,
  destinationBlockId,
  destinationInputId,
} from "../blocks/getJedzenieDialogBlocks"
import { getTimeFromString } from "../utils/getTimeFromString"
import { startJedzenieThread } from "../utils/startJedzenieThread"
import { Dependencies } from "./types"

dayjs.extend(utc)
dayjs.extend(timezone)

export async function startJedzenieThreadViewHandler(
  { ack, view, client, body }: ViewArgs,
  { niechKtosBotId, restaurantsService, intlService }: Dependencies,
) {
  // eslint-disable-next-line @typescript-eslint/naming-convention
  const { timezone, selected_time } = view.state.values[departureBlockId][departureTimeId] as ViewStateValue & {
    timezone: string
  }

  if (!selected_time) {
    await ack({
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

  await ack()

  const channel = view.private_metadata

  await startJedzenieThread({
    creatorId: body.user.id,
    time: getTimeFromString(selected_time),
    destination: ensureDefined(view.state.values[destinationBlockId][destinationInputId].rich_text_value),
    channel,
    timezone,
    client,
    niechKtosBotId,
    restaurantsService,
    intlService,
  })
}
