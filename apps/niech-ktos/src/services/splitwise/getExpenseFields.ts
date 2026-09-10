import { ByShares } from "@jedzenie/splitwise"
import { ExpenseShare } from "./types"

export function getExpenseFields(cost: number, shares: ExpenseShare[]) {
  return {
    cost: formatAmount(cost),
    currency_code: currencyCode,
    ...getShareFields(shares),
  }
}

/** Changing this means changing {@link formatAmount} – a yen has no minor units, a dinar has three */
const currencyCode = "PLN"

/** Splitwise takes the amounts as decimal strings */
function formatAmount(grosze: number) {
  return (grosze / 100).toFixed(2)
}

/** {@link ByShares} spells out only the first two users, so the rest has to be typed by field name */
type ShareFields = {
  [Key in `users__${number}__user_id`]: Required<ByShares>["users__0__user_id"]
} & {
  [Key in `users__${number}__paid_share` | `users__${number}__owed_share`]: Required<ByShares>["users__0__paid_share"]
}

function getShareFields(shares: ExpenseShare[]) {
  const fields: ShareFields = {}

  shares.forEach(({ splitwiseId, paidShare, owedShare }, index) => {
    fields[`users__${index}__user_id`] = splitwiseId
    fields[`users__${index}__paid_share`] = formatAmount(paidShare)
    fields[`users__${index}__owed_share`] = formatAmount(owedShare)
  })

  return fields
}
