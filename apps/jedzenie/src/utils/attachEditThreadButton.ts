import { deepClone } from "@jedzenie/utils"
import { getEditThreadButtonBlock } from "../blocks/getEditThreadButtonBlock"
import { JedzenieThreadBlocks, threadActionsBlockId } from "../blocks/getJedzenieThreadBlock"
import { IntlService } from "../services/IntlService"
import type { ActionsBlock } from "@slack/types"

export function attachEditThreadButton({
  blocks,
  creatorId,
  scheduledMessageId,
  intlService,
}: {
  blocks: JedzenieThreadBlocks
  creatorId: string
  scheduledMessageId: string
  intlService: IntlService
}) {
  const newBlocks = deepClone(blocks)

  const editThreadButton = getEditThreadButtonBlock({ creatorId, scheduledMessageId, intlService })
  const actions = newBlocks.find(
    block => block.type === "actions" && block.block_id === threadActionsBlockId,
  ) as ActionsBlock

  actions.elements = [editThreadButton, ...actions.elements]

  return newBlocks
}
