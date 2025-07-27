import { IntlService } from "../services/IntlService"
import { State } from "../services/state"

export type Dependencies = { state: State; watchedChannelIds: string[]; intlService: IntlService }
