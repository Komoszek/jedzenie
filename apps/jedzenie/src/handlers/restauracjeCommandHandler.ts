import { CommandArgs } from "@jedzenie/utils"
import { getRestaurantDetailsBlocks } from "../blocks/getRestaurantDetailsBlocks"
import { getRestaurantsPage } from "../utils/getRestaurantsPage"
import { Dependencies } from "./types"

export async function restauracjeCommandHandler(
  { ack, client, command }: CommandArgs,
  { restaurantsService, intlService }: Dependencies,
) {
  if (command.text) {
    const restaurant = restaurantsService.matchRestaurant(command.text)

    await ack(
      restaurant
        ? {
            blocks: getRestaurantDetailsBlocks({
              showEdit: true,
              restaurant: {
                ...restaurant,
                actions: restaurantsService.getRestaurantActions(restaurant.id),
              },
              intlService,
            }),
          }
        : intlService.intl.formatMessage({
            defaultMessage: "Nie znaleziono restauracji :sob:",
            id: "restauracjeCommandHandler.error.resaturantNotFound",
          }),
    )

    return
  }

  await ack()

  await client.views.open({
    trigger_id: command.trigger_id,
    view: getRestaurantsPage({ page: 0, restaurantsService, intlService }),
  })
}
