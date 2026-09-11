import { formatUserMention, formatUserMentions } from "@jedzenie/utils"
import { IntlService } from "../services/IntlService"
import { BillError } from "./parseBillMessage"

export type BillFailure =
  | { type: "notUnderstood"; error: BillError }
  | { type: "unconnectedParticipants"; slackIds: string[] }
  | { type: "splitwiseRejected"; details?: string }

export function formatBillFailure(failure: BillFailure, intlService: IntlService) {
  const { intl } = intlService

  switch (failure.type) {
    case "notUnderstood":
      return intl.formatMessage(
        {
          defaultMessage: "Nie rozumiem tego rachunku – {reason}. Tak wygląda rachunek, który zrozumiem:{usage}",
          id: "bill.error.invalid",
        },
        { reason: formatBillErrorReason(failure.error, intlService), usage: billUsage },
      )
    case "unconnectedParticipants":
      return intl.formatMessage(
        {
          defaultMessage:
            "Nie dodam tego rachunku, bo te osoby nie mają połączonego konta ze Splitwisem :pepe_police:: {users}",
          id: "bill.error.unconnectedParticipants",
        },
        { users: formatUserMentions(failure.slackIds) },
      )
    case "splitwiseRejected":
      return failure.details
        ? intl.formatMessage(
            {
              defaultMessage: "Splitwise nie przyjął tego rachunku ({details}), trzeba go dodać ręcznie :pepe_police:",
              id: "bill.error.splitwiseRejectedWithDetails",
            },
            { details: failure.details },
          )
        : intl.formatMessage({
            defaultMessage: "Splitwise nie przyjął tego rachunku, trzeba go dodać ręcznie :pepe_police:",
            id: "bill.error.splitwiseRejected",
          })
  }
}

function formatBillErrorReason(error: BillError, { intl }: IntlService) {
  switch (error.type) {
    case "missingPayer":
      return intl.formatMessage({ defaultMessage: "nie wiem kto zapłacił", id: "bill.error.missingPayer" })
    case "duplicatedPayer":
      return intl.formatMessage({ defaultMessage: "płaci więcej niż jedna osoba", id: "bill.error.duplicatedPayer" })
    case "payerWithAmount":
      return intl.formatMessage({
        defaultMessage: "przy płacącym nie ma być kwoty, jego część wpisz na liście",
        id: "bill.error.payerWithAmount",
      })
    case "missingShares":
      return intl.formatMessage({ defaultMessage: "nie wiem kto ile ma oddać", id: "bill.error.missingShares" })
    case "duplicatedShare":
      return intl.formatMessage(
        { defaultMessage: "{user} występuje więcej niż raz", id: "bill.error.duplicatedShare" },
        { user: formatUserMention(error.slackId) },
      )
    case "invalidLine":
      return intl.formatMessage(
        { defaultMessage: "nie wiem co zrobić z linią „{line}”", id: "bill.error.invalidLine" },
        { line: error.line },
      )
  }
}

const billUsage = `
\`\`\`
rachunek Tawerna, płaci @kto
• @kto 45
• @ktoś_inny 30,50
• @ktoś_jeszcze 25 zł
\`\`\``
