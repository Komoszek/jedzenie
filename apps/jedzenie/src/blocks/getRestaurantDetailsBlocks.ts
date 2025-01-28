import { IntlService } from "../services/IntlService"
import { Restaurant } from "../services/RestaurantsService"
import type { KnownBlock } from "@slack/types"

export function getRestaurantDetailsBlocks(restaurant: Restaurant, intlService: IntlService): KnownBlock[] {
    return [
        {
            type: "section",
            text: {
                type: "plain_text",
                text: restaurant.name,
            },
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
