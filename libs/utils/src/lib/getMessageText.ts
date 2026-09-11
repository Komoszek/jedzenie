import { knownBlockToText } from "./knownBlockToText"
import type { AnyBlock } from "@slack/types"

/**
 * Text of a message as it was written – messages posted with blocks only (eg. a rich text message sent by
 * another bot) come with an empty `text`, so it has to be recovered from the blocks.
 */
export function getMessageText({ text, blocks }: { text?: string; blocks?: AnyBlock[] }) {
  return text || (blocks ?? []).map(block => knownBlockToText(block, "\n")).join("\n")
}
