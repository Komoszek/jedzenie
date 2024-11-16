import { getResaurantDetailsBlocks } from "./appMentionHandler"
import { CommandArgs, Dependencies } from "./types"

export async function restauracjeCommandHandler(
    { ack, client, command }: CommandArgs,
    { restaurantsService, intlService }: Dependencies,
) {
    await ack()

    const restaurants = restaurantsService.getRestaurants().sort((a, b) => a.name.localeCompare(b.name))

    await client.views.open({
        trigger_id: command.trigger_id,
        view: {
            title: {
                type: "plain_text",
                text: intlService.intl.formatMessage({
                    defaultMessage: "Restauracje",
                    id: "restauracjeView.title",
                }),
                emoji: true,
            },
            type: "modal",
            close: {
                type: "plain_text",
                text: intlService.intl.formatMessage({
                    defaultMessage: ":yum:",
                    id: "restauracjeView.close",
                }),
                emoji: true,
            },
            blocks: restaurants.flatMap(restaurant => [...getResaurantDetailsBlocks(restaurant, intlService)]),
        },
    })
}
