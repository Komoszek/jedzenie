import { parseAmount } from "./parseAmount"

/**
 * Parses a bill (Splitwise expense) sent to the bot as a Slack message, e.g.
 *
 * ```
 * @Niech ktoś rachunek Tawerna, płaci @komo
 * • @komo 45
 * • @ania 30,50
 * • @marek 25 zł
 * ```
 *
 * Rules:
 * - the first line starts with `rachunek` (an optional mention of the bot may precede it), everything that
 *   follows it on that line is the description of the expense,
 * - `płaci @kto` – either on the first line or on a line of its own – says who paid and nothing more, the
 *   amount the payer owes belongs on the list like everyone else's,
 * - every other line assigns an owed amount to exactly one person; the lines may be a bullet list,
 * - the cost of the expense is the sum of all the owed amounts – the payer covers all of it.
 *
 * All the amounts are returned in grosze so that the money math stays exact.
 */
export function parseBillMessage(text: string): ParseBillResult {
  const [commandLine = "", ...lines] = text.split("\n")

  const commandMatch = normalizeLine(commandLine).match(commandLinePattern)

  if (!commandMatch) {
    return { type: "notBill" }
  }

  const [, commandRest = ""] = commandMatch

  const payerInCommand = commandRest.match(payerInTextPattern)

  if (payerInCommand?.[2]) {
    return invalid({ type: "payerWithAmount" })
  }

  let payerSlackId = payerInCommand?.[1]

  const description = normalizeDescription(commandRest.replace(payerInTextPattern, " "))

  const shares = new Map<string, number>()

  for (const rawLine of lines) {
    const line = normalizeLine(rawLine)

    if (!line) {
      continue
    }

    const payerMatch = line.match(payerLinePattern)

    if (payerMatch) {
      const [, slackId, amount] = payerMatch

      if (amount) {
        return invalid({ type: "payerWithAmount" })
      }

      if (payerSlackId) {
        return invalid({ type: "duplicatedPayer" })
      }

      payerSlackId = slackId

      continue
    }

    const shareMatch = line.match(shareLinePattern)

    if (!shareMatch) {
      return invalid({ type: "invalidLine", line })
    }

    const [, slackId, rawAmount = ""] = shareMatch

    const amount = parseAmount(rawAmount)

    if (amount === undefined) {
      return invalid({ type: "invalidLine", line })
    }

    if (shares.has(slackId)) {
      return invalid({ type: "duplicatedShare", slackId })
    }

    shares.set(slackId, amount)
  }

  if (!payerSlackId) {
    return invalid({ type: "missingPayer" })
  }

  if (shares.size === 0) {
    return invalid({ type: "missingShares" })
  }

  return {
    type: "bill",
    bill: {
      description,
      payerSlackId,
      shares: [...shares].map(([slackId, amount]) => ({ slackId, amount })),
      total: [...shares.values()].reduce((total, amount) => total + amount, 0),
    },
  }
}

export type BillShare = {
  slackId: string
  /** Amount owed, in grosze */
  amount: number
}

export type Bill = {
  description?: string
  payerSlackId: string
  shares: BillShare[]
  /** Cost of the whole expense, in grosze */
  total: number
}

export type BillError =
  | { type: "missingPayer" }
  | { type: "duplicatedPayer" }
  | { type: "payerWithAmount" }
  | { type: "missingShares" }
  | { type: "duplicatedShare"; slackId: string }
  | { type: "invalidLine"; line: string }

export type ParseBillResult = { type: "notBill" } | { type: "invalid"; error: BillError } | { type: "bill"; bill: Bill }

/** Strips the whitespace, the bullet a line of a list comes with and the separator it may end with */
function normalizeLine(rawLine: string) {
  return rawLine.trim().replace(bulletPattern, "").replace(trailingSeparatorPattern, "").trim()
}

function normalizeDescription(rawDescription: string) {
  return (
    rawDescription
      .replace(descriptionNoisePattern, "")
      .replace(/\s+/g, " ")
      .replace(/^za\s+/i, "") || undefined
  )
}

function invalid(error: BillError): ParseBillResult {
  return { type: "invalid", error }
}

const mention = String.raw`<@([^>|\s]+)(?:\|[^>]*)?>`
const anyMention = String.raw`<@[^>\s]+>`
const payerKeyword = String.raw`(?:(?:za)?płac[\p{L}()]*|płatnik\p{L}*|paid)\s*:?\s*`
const amountSeparator = String.raw`\s*[-–:=]?\s*`
const looseAmount = String.raw`\d+(?:[.,]\d+)?\s*(?:zł|zl|pln)?`
// the amount is captured only to reject it – the payer's share belongs on the list like everyone else's
const payer = String.raw`${payerKeyword}${mention}${amountSeparator}(${looseAmount})?`

const commandLinePattern = new RegExp(String.raw`^(?:${anyMention}\s*)*rachunek\b[ \t]*(.*)$`, "iu")
const payerInTextPattern = new RegExp(String.raw`(?:^|[\s,;:–-])${payer}`, "iu")
const payerLinePattern = new RegExp(String.raw`^${payer}$`, "iu")
const shareLinePattern = new RegExp(String.raw`^${mention}${amountSeparator}(.*)$`, "u")
const bulletPattern = /^(?:[-–—•‣◦*]|\d+[.)])\s+/
const trailingSeparatorPattern = /[,;]$/
const descriptionNoisePattern = /^[\s,;:–-]+|[\s,;:–-]+$/g
