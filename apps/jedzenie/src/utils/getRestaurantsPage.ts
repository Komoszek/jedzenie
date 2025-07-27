import { clamp } from "@jedzenie/utils"
import { getPaginationBlocks } from "../blocks/getPaginationBlocks"
import { getRestaurantDetailsBlocks } from "../blocks/getRestaurantDetailsBlocks"
import { IntlService } from "../services/IntlService"
import { RestaurantsService } from "../services/RestaurantsService"
import type { View } from "@slack/types"

export function getRestaurantsPage({
  page: requestedPage,
  restaurantsService,
  intlService,
}: {
  page: number
  restaurantsService: RestaurantsService
  intlService: IntlService
}): View {
  const allRestaurants = restaurantsService.getRestaurants().sort((a, b) => a.name.localeCompare(b.name))

  const totalPages = Math.ceil(allRestaurants.length / pageSize)
  const page = clamp(0, requestedPage, totalPages)
  const start = page * pageSize

  const restaurants = allRestaurants.slice(start, start + pageSize)

  return {
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
    blocks: [
      ...restaurants.flatMap(restaurant => [
        ...getRestaurantDetailsBlocks({
          showEdit: true,
          restaurant: { ...restaurant, actions: restaurantsService.getRestaurantActions(restaurant.id) },
          intlService,
        }),
      ]),
      ...(totalPages > 1
        ? getPaginationBlocks({ page, totalPages, intlService, getActionId: getPaginationActionId })
        : []),
    ],
  }
}

const pageSize = 30

export const restaurantPagePaginationId = "restaurant_page_pagination"

function getPaginationActionId(action: string) {
  return `${restaurantPagePaginationId}_${action}`
}
