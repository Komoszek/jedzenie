import { WebClient } from "@jedzenie/utils"
import { Logger } from "@slack/bolt"
import { IntlService } from "../services/IntlService"
import { splitwiseService } from "../services/splitwise"
import { State } from "../services/state"
import { BillFailure, formatBillFailure } from "./formatBillFailure"
import { getBillExpense } from "./getBillExpense"
import { parseBillMessage } from "./parseBillMessage"

/**
 * Adds a bill posted in Slack (most likely by another bot, in a thread) to Splitwise – see
 * {@link parseBillMessage} for the format. Returns whether the message was a bill at all, so that the caller
 * can fall back to whatever else it does with the messages it gets.
 */
export async function tryAddBill({
  text,
  channel,
  ts,
  threadTs,
  client,
  logger,
  state,
  intlService,
}: {
  text: string
  channel: string
  ts: string
  threadTs?: string
  client: WebClient
  logger: Logger
  state: State
  intlService: IntlService
}) {
  const result = parseBillMessage(text)

  if (result.type === "notBill") {
    return false
  }

  const complain = (failure: BillFailure) =>
    client.chat.postMessage({
      channel,
      thread_ts: threadTs ?? ts,
      text: formatBillFailure(failure, intlService),
    })

  if (result.type === "invalid") {
    await complain({ type: "notUnderstood", error: result.error })
    return true
  }

  const { bill } = result

  const { cost, shares, unconnectedSlackIds } = getBillExpense(bill, state)

  if (unconnectedSlackIds.length > 0) {
    await complain({ type: "unconnectedParticipants", slackIds: unconnectedSlackIds })
    return true
  }

  const description =
    bill.description ?? intlService.intl.formatMessage({ defaultMessage: "Rachunek", id: "bill.defaultDescription" })

  const failure = await splitwiseService.createExpense({
    description,
    cost,
    details: await getPermalink({ client, channel, ts }),
    shares,
  })

  if (failure) {
    logger.error("Failed to add an expense to Splitwise", failure.cause)

    await complain({ type: "splitwiseRejected", details: failure.details })
    return true
  }

  // the message itself already says what the bill is, so a reaction is enough of a confirmation
  try {
    await client.reactions.add({ channel, timestamp: ts, name: billAddedReaction })
  } catch (e) {
    logger.error("Failed to react to an added bill", e)
  }

  return true
}

const billAddedReaction = "white_check_mark"

async function getPermalink({ client, channel, ts }: { client: WebClient; channel: string; ts: string }) {
  try {
    const { permalink } = await client.chat.getPermalink({ channel, message_ts: ts })

    return permalink
  } catch {
    return undefined
  }
}
