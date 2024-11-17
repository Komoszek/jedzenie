import { getResaurantDetailsBlocks } from "./appMentionHandler"
import { CommandArgs, Dependencies } from "./types"

export async function restauracjeCommandHandler(
    { ack, client, command }: CommandArgs,
    { restaurantsService, intlService }: Dependencies,
) {
    if (command.text) {
        const restaurant = restaurantsService.matchRestaurant(command.text)

        await ack(
            restaurant
                ? {
                      blocks: getResaurantDetailsBlocks(restaurant, intlService),
                  }
                : intlService.intl.formatMessage({
                      defaultMessage: "Nie znaleziono restauracji :sob:",
                      id: "restauracjeCommandHandler.error.resaturantNotFound",
                  }),
        )

        return
    }

    await ack()

    let restaurants = restaurantsService.getRestaurants().sort((a, b) => a.name.localeCompare(b.name))

    // TODO: add pagination to restaurants
    if (restaurants.length > restaurantsPerPage) {
        restaurants = restaurants.slice(0, restaurantsPerPage)
        console.error(`Too many restaurants to display, only first ${restaurantsPerPage} will be shown`)
    }

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

const restaurantsPerPage = 40
