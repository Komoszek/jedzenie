import { IntlService } from "../services/IntlService"
import { Restaurant } from "../services/RestaurantsService"
import type { KnownBlock } from "@slack/types"

export function getRestaurantEditorDialogBlocks({
    restaurant,
    intlService,
}: {
    restaurant?: Restaurant
    intlService: IntlService
}): KnownBlock[] {
    return [
        {
            block_id: restaurantNameBlockId,
            type: "input",
            element: {
                type: "plain_text_input",
                action_id: restaurantNameId,
                initial_value: restaurant?.name,
            },
            label: {
                type: "plain_text",
                text: intlService.intl.formatMessage({
                    defaultMessage: "Nazwa restauracji",
                    id: "restaurantEditor.name",
                }),
                emoji: false,
            },
        },
        {
            block_id: restaurantPatternsBlockId,
            type: "input",
            element: {
                type: "rich_text_input",
                action_id: restaurantPatternsId,
                initial_value: restaurant && {
                    type: "rich_text",
                    elements: [
                        {
                            type: "rich_text_section",
                            elements: restaurant.patterns.map(pattern => ({
                                type: "text",
                                text: `${pattern}\n`,
                            })),
                        },
                    ],
                },
            },
            label: {
                type: "plain_text",
                text: intlService.intl.formatMessage({
                    defaultMessage: "Wzorce do rozpoznania restauracji (regex)",
                    id: "restaurantEditor.patterns",
                }),
                emoji: false,
            },
        },
        {
            block_id: restaurantLinksBlockId,
            type: "input",
            element: {
                type: "rich_text_input",
                action_id: restaurantLinksId,
                initial_value: restaurant && {
                    type: "rich_text",
                    elements: [
                        {
                            type: "rich_text_section",
                            elements: restaurant.links.map(link => ({
                                type: "link",
                                text: link,
                                url: link,
                            })),
                        },
                    ],
                },
            },
            label: {
                type: "plain_text",
                text: intlService.intl.formatMessage({
                    defaultMessage: "Linki",
                    id: "restaurantEditor.links",
                }),
                emoji: false,
            },
        },
    ]
}

export const restaurantNameBlockId = "restaurant-name-block"
export const restaurantNameId = "restaurant-name"

export const restaurantPatternsBlockId = "restaurant-patterns-block"
export const restaurantPatternsId = "restaurant-patterns"

export const restaurantLinksBlockId = "restaurant-links-block"
export const restaurantLinksId = "restaurant-links"
