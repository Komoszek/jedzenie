import { GroupMembersInner } from "@jedzenie/splitwise"
import { Balance } from "./types/Balance"

export function getGroupMemberBalance(
  { first_name, last_name, balance }: GroupMembersInner,
  currency = "PLN",
): Balance {
  const amount = balance?.find(({ currency_code }) => currency_code === currency)?.amount ?? 0

  return {
    name: [first_name, last_name].filter(Boolean).join(" "),
    balance: Number(amount),
  }
}
