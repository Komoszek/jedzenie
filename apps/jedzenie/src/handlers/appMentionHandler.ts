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
        blocks: [
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
        ],
    })
}
