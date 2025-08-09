import { createIntl, createIntlCache, IntlShape } from "@formatjs/intl"
import pl from "../i18n/pl.json"

export type TranslationsKeys = keyof typeof pl

declare global {
  interface FormatjsIntlMessage {
    ids: TranslationsKeys
  }
}

export class IntlService {
  readonly intl: IntlShape

  constructor() {
    const cache = createIntlCache()

    this.intl = createIntl(
      {
        locale: "pl",
        messages: pl,
      },
      cache,
    )
  }
}
