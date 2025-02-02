import { IntlService } from "../services/IntlService"
import { Restaurant } from "../services/RestaurantsService"
import type { KnownBlock } from "@slack/types"

export function getRestaurantDetailsBlocks({
    showEdit,
    restaurant,
    intlService,
}: {
    showEdit?: boolean
    restaurant: Restaurant
    intlService: IntlService
}): KnownBlock[] {
    return [
        {
            type: "section",
            text: {
                type: "plain_text",
                text: restaurant.name,
            },
            ...(showEdit
                ? {
                      accessory: {
                          type: "button",
                          text: {
                              type: "plain_text",
                              text: intlService.intl.formatMessage({ defaultMessage: "Edytuj", id: "common.edit" }),
                          },
                          action_id: editRestaurantButtonId,
                          value: restaurant.id,
                      },
                  }
                : {}),
        },
        {
            type: "context",
            elements: [
                {
                    type: "mrkdwn",
                    text:
                        restaurant.links.length > 0
                            ? restaurant.links.join(" | ")
                            : intlService.intl.formatMessage({
                                  defaultMessage: "Brak linków",
                                  id: "restaurantDetails.noLinks",
                              }),
                },
            ],
        },
    ]
}

export const editRestaurantButtonId = "edit_restaurant"
