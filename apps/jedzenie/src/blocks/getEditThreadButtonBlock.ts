import * as v from "valibot"
import { IntlService } from "../services/IntlService"
import type { Button } from "@slack/types"

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
    value: JSON.stringify({ creatorId, scheduledMessageId } satisfies EditButtonValue),
    action_id: editThreadButtonId,
  }
}

export const editButtonValueSchema = v.object({
  creatorId: v.string(),
  scheduledMessageId: v.string(),
})

export type EditButtonValue = v.InferInput<typeof editButtonValueSchema>
export const editThreadButtonId = "edit_thread"
