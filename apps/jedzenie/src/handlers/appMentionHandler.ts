import { getRestaurantDetailsBlocks } from "../blocks/getRestaurantDetailsBlocks"
import { AppMentionArgs, Dependencies } from "./types"

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
        blocks: getRestaurantDetailsBlocks({
            restaurant: { ...restaurant, actions: restaurantsService.getRestaurantActions(restaurant.id) },
            intlService,
        }),
    })
}
