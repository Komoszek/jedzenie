import { CommandArgs, mrkdwnToRichText, WebClient } from "@jedzenie/utils"
import { getJedzenieDialogBlocks, jedzenieTimezone } from "../blocks/getJedzenieDialogBlocks"
import { IntlService } from "../services/IntlService"
import { getTimeFromString } from "../utils/getTimeFromString"
import { startJedzenieThread } from "../utils/startJedzenieThread"
import { Dependencies } from "./types"
import type { RichTextBlock } from "@slack/types"

export async function jedzenieCommandHandler(
  { ack, client, command, respond, logger }: CommandArgs,
  { niechKtosBotId, restaurantsService, intlService }: Dependencies,
) {
  await ack()

  const normalizedText = command.text.trim()

  if (!normalizedText) {
    await openJedzenieDialog({
      client,
      triggerId: command.trigger_id,
      channel: command.channel_id,
      intlService,
    })
    return
  }

  const match = normalizedText.match(/^(\d{1,4}|\d{1,2}:\d{2})\s+(.+)$/)

  if (!match) {
    await respond(
      intlService.intl.formatMessage({
        defaultMessage: "Niepoprawne parametry. Przykład użycia: /jedzenie 12:00 :flag-gr:",
        id: "jedzenieCommandHandler.error.invalidParams",
      }),
    )
    return
  }

  const [timeString, destination] = match.slice(1)

  await startJedzenieThread({
    creatorId: command.user_id,
    time: getTimeFromString(timeString),
    client,
    channel: command.channel_id,
    destination: mrkdwnToRichText(destination),
    niechKtosBotId,
    timezone: jedzenieTimezone,
    restaurantsService,
    intlService,
    logger,
  })
}

export const startJedzenieThreadViewId = "start-jedzenie-thread-view"

export function openJedzenieDialog({
  client,
  triggerId,
  channel,
  initialDestination,
  intlService,
}: {
  client: WebClient
  channel: string
  triggerId: string
  initialDestination?: RichTextBlock
  intlService: IntlService
}) {
  return client.views.open({
    trigger_id: triggerId,
    view: {
      private_metadata: channel,
      callback_id: startJedzenieThreadViewId,
      title: {
        type: "plain_text",
        text: intlService.intl.formatMessage({
          defaultMessage: "Rozpocznij wątek",
          id: "startJedzenieThreadView.title",
        }),
      },
      submit: {
        type: "plain_text",
        text: intlService.intl.formatMessage({
          defaultMessage: "Rozpocznij",
          id: "startJedzenieThreadView.submit",
        }),
      },
      type: "modal",
      close: {
        type: "plain_text",
        text: intlService.intl.formatMessage({
          defaultMessage: "Anuluj",
          id: "startJedzenieThreadView.cancel",
        }),
      },
      blocks: getJedzenieDialogBlocks({ intlService, initialDestination }),
    },
  })
}
