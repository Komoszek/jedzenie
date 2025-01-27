import { z } from "zod"
import { getResaurantDetailsBlocks } from "../handlers/appMentionHandler"
import { IntlService } from "../services/IntlService"
import { RestaurantsService } from "../services/RestaurantsService"
import { clamp } from "./clamp"
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
            ...restaurants.flatMap(restaurant => [...getResaurantDetailsBlocks(restaurant, intlService)]),
            ...(totalPages > 1 ? getPagination({ page, totalPages, intlService }) : []),
        ],
    }
}

const pageSize = 30

export const restaurantPagePaginationId = "restaurant_page_pagination"

function getPaginationActionId(action: string) {
    return `${restaurantPagePaginationId}_${action}`
}

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

function getPagination({
    page,
    totalPages,
    intlService,
}: {
    page: number
    totalPages: number
    intlService: IntlService
}) {
    return [
        {
            type: "actions",
            elements: [
                ...(page > 0
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
                              value: String(page - 1),
                              action_id: getPaginationActionId("prev"),
                          },
                      ] as const)
                    : []),
                ...(page + 1 < totalPages
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
                              value: String(page + 1),
                              action_id: getPaginationActionId("next"),
                          },
                      ] as const)
                    : []),
                {
                    type: "static_select",
                    initial_option: getPageOption(page),
                    placeholder: {
                        type: "plain_text",
                        text: intlService.intl.formatMessage({
                            defaultMessage: "Wybierz stronę",
                            id: "restaurantsPage.selectPage.placeholder",
                        }),
                    },
                    action_id: getPaginationActionId("select"),
                    options: Array.from({ length: totalPages }).map((_, i) => getPageOption(i)),
                },
            ],
        },
    ]
}
