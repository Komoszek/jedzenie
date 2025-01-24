import { z } from "zod"
import { getResaurantDetailsBlocks } from "../handlers/appMentionHandler"
import { IntlService } from "../services/IntlService"
import { RestaurantsService } from "../services/RestaurantsService"
import { clamp } from "./clamp"
import type { ActionsBlock, View } from "@slack/types"

export function getRestaurantsPage({
    page,
    restaurantsService,
    intlService,
}: {
    page: number
    restaurantsService: RestaurantsService
    intlService: IntlService
}): View {
    const allRestaurants = restaurantsService.getRestaurants().sort((a, b) => a.name.localeCompare(b.name))

    const totalPages = Math.ceil(allRestaurants.length / pageSize)
    const effectivePage = clamp(0, page, totalPages)
    const start = effectivePage * pageSize

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
            ...restaurants.flatMap(restaurant => [...getResaurantDetailsBlocks(restaurant, intlService)]),
            ...(totalPages > 1
                ? ([
                      {
                          type: "actions",
                          elements: [
                              ...(effectivePage > 0
                                  ? ([
                                        {
                                            type: "button",
                                            text: {
                                                type: "plain_text",
                                                text: intlService.intl.formatMessage({
                                                    defaultMessage: "Poprzednia strona",
                                                    id: "restaurantsPage.previousPage.label",
                                                }),
                                            },
                                            value: String(effectivePage - 1),
                                            action_id: `${restaurantPagePaginationId}_prev`,
                                        },
                                    ] as const)
                                  : []),
                              ...(effectivePage + 1 < totalPages
                                  ? ([
                                        {
                                            type: "button",
                                            text: {
                                                type: "plain_text",
                                                text: intlService.intl.formatMessage({
                                                    defaultMessage: "Następna strona",
                                                    id: "restaurantsPage.nextPage.label",
                                                }),
                                            },
                                            value: String(effectivePage + 1),
                                            action_id: `${restaurantPagePaginationId}_next`,
                                        },
                                    ] as const)
                                  : []),
                              {
                                  type: "static_select",
                                  initial_option: getPageOption(effectivePage),
                                  placeholder: {
                                      type: "plain_text",
                                      text: intlService.intl.formatMessage({
                                          defaultMessage: "Wybierz stronę",
                                          id: "restaurantsPage.selectPage.placeholder",
                                      }),
                                  },
                                  action_id: `${restaurantPagePaginationId}_select`,
                                  options: Array.from({ length: totalPages }).map((_, i) => getPageOption(i)),
                              },
                          ],
                      },
                  ] satisfies ActionsBlock[])
                : []),
        ],
    }
}

const pageSize = 45

export const restaurantPagePaginationId = "restaurant_page_pagination"

export const paginationSchema = z.coerce.number().int().nonnegative()

export type Pagination = z.infer<typeof paginationSchema>

function getPageOption(page: number) {
    return {
        text: {
            type: "plain_text",
            text: String(page + 1),
        },
        value: String(page),
    } as const
}
