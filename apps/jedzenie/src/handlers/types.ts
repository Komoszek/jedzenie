import { IntlService } from "../services/IntlService"
import { RestaurantsService } from "../services/RestaurantsService"

export type Dependencies = {
  jedzenieBotId: string
  niechKtosBotId: string
  restaurantsService: RestaurantsService
  intlService: IntlService
}
