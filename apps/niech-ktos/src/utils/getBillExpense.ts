import { ExpenseShare } from "../services/splitwise"
import { State } from "../services/state"
import { Bill } from "./parseBillMessage"

/**
 * Translates a bill into the shares of a Splitwise expense – the payer covers the whole cost, everyone else
 * owes only their own share. People without a Splitwise account connected are reported back instead, as
 * Splitwise wouldn't know who they are.
 */
export function getBillExpense({ payerSlackId, shares, total }: Bill, state: State) {
  const owedShares = shares.some(({ slackId }) => slackId === payerSlackId)
    ? shares
    : [...shares, { slackId: payerSlackId, amount: 0 }]

  const { splitwiseIdsMap: splitwiseIds, unconnectedSlackIds } = state.getSplitwiseUserIds(
    owedShares.map(({ slackId }) => slackId),
  )

  const expenseShares = owedShares.flatMap<ExpenseShare>(({ slackId, amount }) => {
    const splitwiseId = splitwiseIds.get(slackId)

    return splitwiseId === undefined
      ? []
      : [{ splitwiseId, paidShare: slackId === payerSlackId ? total : 0, owedShare: amount }]
  })

  return { cost: total, shares: expenseShares, unconnectedSlackIds }
}
