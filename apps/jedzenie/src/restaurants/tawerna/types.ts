import { IntlService } from "../../services/IntlService"
import { TawernaMenuService } from "./TawernaMenuService"

export type TawernaDependencies = {
    tawernaMenuService: TawernaMenuService
    intlService: IntlService
}
