import { IntlShape, createIntl, createIntlCache } from "@formatjs/intl"
import pl from "../i18n/pl.json"

export type PlTranslationsKeys = keyof typeof pl

declare global {
    interface FormatjsIntlMessage {
        ids: PlTranslationsKeys
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
