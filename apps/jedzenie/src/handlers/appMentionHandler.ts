import { IntlService } from "../services/IntlService"
import { Restaurant } from "../services/RestaurantsService"
import { AppMentionArgs, Dependencies } from "./types"
import type { KnownBlock } from "@slack/types"

export async function appMentionHandler(
    { event: { channel, thread_ts, ts, text }, client }: AppMentionArgs,
    { restaurantsService, intlService }: Dependencies,
) {
    const restaurant = restaurantsService.matchRestaurant(text)

    if (!restaurant) {
        return
    }

    await client.chat.postMessage({
        channel,
        thread_ts: thread_ts ?? ts,
        blocks: getResaurantDetailsBlocks(restaurant, intlService),
    })
}

export function getResaurantDetailsBlocks(restaurant: Restaurant, intlService: IntlService): KnownBlock[] {
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
                                  id: "resaurantDetails.noLinks",
                              }),
                },
            ],
        },
    ]
}
