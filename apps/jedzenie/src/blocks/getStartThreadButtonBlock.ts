import { IntlService } from "../services/IntlService"
import type { Button } from "@slack/types"

export function getStartThreadButtonBlock({
  initialDestination,
  intlService,
}: {
  initialDestination: string
  intlService: IntlService
}): Button {
  return {
    type: "button",
    text: {
      type: "plain_text",
      text: intlService.intl.formatMessage({ defaultMessage: "Otwórz wątek", id: "jedzenieThreadBlocks.start" }),
      emoji: true,
    },
    value: initialDestination,
    action_id: startJedzenieThreadButtonId,
  }
}

export const startJedzenieThreadButtonId = "start_jedzenie_thread_button"
