import { formatUserMention } from "@jedzenie/utils"
import { IntlService } from "../services/IntlService"
import { Balance } from "./types/Balance"

export function formatRankingPlace({ name, balance, slackId }: Balance, place: number, intlService: IntlService) {
  return intlService.intl.formatMessage(
    {
      defaultMessage:
        "{place, select, 1 {:first_place_medal:} 2 {:second_place_medal:} 3 {:third_place_medal:} other {{place}.}} {name} – {balance, number,:: currency/PLN}",
      id: "rankingPlace",
    },
    { place, name: slackId ? formatUserMention(slackId) : `_${name}_`, balance },
  )
}
