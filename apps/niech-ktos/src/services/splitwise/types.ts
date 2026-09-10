export type ExpenseFailure = {
  /** What to tell the user */
  details?: string
  /** The failure itself, for the log */
  cause: unknown
}

export type ExpenseShare = {
  splitwiseId: number
  /** Amount paid, in grosze */
  paidShare: number
  /** Amount owed, in grosze */
  owedShare: number
}

export type ExpenseInfo = {
  description: string
  /** Cost of the whole expense, in grosze */
  cost: number
  /** Also known as "notes" */
  details?: string
  shares: ExpenseShare[]
}

export type MatchSlackInfo = {
  slackId: string
  email: string
}

export type SplitwiseMatch = {
  slackId: string
  splitwiseId: number
}
