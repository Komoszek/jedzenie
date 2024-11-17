import { IntlShape, createIntl, createIntlCache } from "@formatjs/intl"
import pl from "../i18n/pl.json"

export type PlTranslationsKeys = keyof typeof pl

declare global {
    interface FormatjsIntlMessage {
        ids: PlTranslationsKeys
    }
}

export class IntlService {
    private _intl: IntlShape

    constructor() {
        const cache = createIntlCache()

        this._intl = createIntl(
            {
                locale: "pl",
                messages: pl,
            },
            cache,
        )
    }

    get intl() {
        return this._intl
    }
}
