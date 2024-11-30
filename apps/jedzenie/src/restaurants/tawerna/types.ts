import { IntlService } from "../../services/IntlService"
import { TawernaMenuService } from "../../services/TawernaMenuService"

export type TawernaDependencies = {
    tawernaMenuService: TawernaMenuService
    intlService: IntlService
}
