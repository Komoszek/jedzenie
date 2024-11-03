import { IntlConfig, IntlShape, createIntl, createIntlCache } from "@formatjs/intl"

export class IntlService {
    private _intl: IntlShape

    constructor(config: IntlConfig) {
        const cache = createIntlCache()

        this._intl = createIntl(config, cache)
    }

    get intl() {
        return this._intl
    }
}
