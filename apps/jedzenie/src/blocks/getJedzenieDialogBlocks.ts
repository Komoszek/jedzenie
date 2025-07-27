import { IntlService } from "../services/IntlService"
import type { KnownBlock, RichTextBlock } from "@slack/types"

export function getJedzenieDialogBlocks({
  initialTime = "12:00",
  initialDestination,
  intlService,
}: {
  initialTime?: string
  initialDestination?: RichTextBlock
  intlService: IntlService
}): KnownBlock[] {
  return [
    {
      block_id: destinationBlockId,
      type: "input",
      element: {
        type: "rich_text_input",
        action_id: destinationInputId,
        initial_value: initialDestination,
      },
      label: {
        type: "plain_text",
        text: intlService.intl.formatMessage({ defaultMessage: "Opis", id: "jedzenieTheadView.destination" }),
        emoji: true,
      },
    },
    {
      block_id: departureBlockId,
      type: "input",
      optional: false,
      element: {
        type: "timepicker",
        placeholder: {
          type: "plain_text",
          text: intlService.intl.formatMessage({
            defaultMessage: "Wybierz godzinę odjazdu",
            id: "jedzenieTheadView.departureTime.placeholder",
          }),
          emoji: true,
        },
        action_id: departureTimeId,
        timezone: jedzenieTimezone,
        initial_time: initialTime,
      },
      label: {
        type: "plain_text",
        text: intlService.intl.formatMessage({
          defaultMessage: "Godzina odjazdu",
          id: "jedzenieTheadView.departureTime",
        }),
        emoji: true,
      },
    },
  ]
}

export const destinationBlockId = "destination-block"
export const destinationInputId = "destination"

export const departureBlockId = "departure-block"
export const departureTimeId = "departure-time"

export const jedzenieTimezone = "Poland"
