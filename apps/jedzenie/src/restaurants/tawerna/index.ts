import { ApplyRestaurant } from ".."
import { tawernaHandlers } from "./handlers"
import { TawernaDependencies } from "./types"

const restaurantId = "tawerna"

export function tawerna(dependencies: TawernaDependencies): ApplyRestaurant {
  return ({ app, restaurantsService }) => {
    const { tawernaCommandHandler, showTawernaLunchMenuButtonHandler, imMessageHandler } = tawernaHandlers(dependencies)

    app.command("/tawerna", tawernaCommandHandler)
    app.action(showTawernaLunchMenuButtonId, showTawernaLunchMenuButtonHandler)

    restaurantsService.setRestaurantActions(restaurantId, [
      {
        type: "button",
        text: {
          type: "plain_text",
          text: dependencies.intlService.intl.formatMessage({
            defaultMessage: "Pokaż menu lunchowe",
            id: "restaurantActions.tawerna.showTawernaLunchMenu",
          }),
          emoji: true,
        },
        action_id: showTawernaLunchMenuButtonId,
      },
    ])

    restaurantsService.upsertRestaurantImHandler({ restaurantId, handler: imMessageHandler })
  }
}

export const showTawernaLunchMenuButtonId = "show_tawerna_lunch_menu"
