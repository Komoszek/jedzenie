import { IntlService } from "../services/IntlService"
import { Restaurant } from "../services/RestaurantsService"
import type { KnownBlock, RichTextLink } from "@slack/types"

export function getRestaurantEditorDialogBlocks({
  restaurant,
  intlService,
}: {
  restaurant?: Partial<Restaurant>
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
      block_id: restaurantLinksBlockId,
      type: "input",
      element: {
        type: "rich_text_input",
        action_id: restaurantLinksId,
        initial_value: restaurant?.links && {
          type: "rich_text",
          elements: [
            {
              type: "rich_text_section",
              elements: restaurant.links.flatMap(link => [
                getLinkElement(link) ?? {
                  type: "text",
                  text: link,
                },
                { type: "text", text: "\n" },
              ]),
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
    {
      block_id: restaurantPatternsBlockId,
      type: "input",
      element: {
        type: "plain_text_input",
        action_id: restaurantPatternsId,
        initial_value: restaurant?.patterns?.join("\n"),
        multiline: true,
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
  ]
}

function getLinkElement(text: string): RichTextLink | undefined {
  const match = text.match(/^<(.*)\|(.*)>$/)

  if (!match) {
    return undefined
  }

  return {
    type: "link",
    text: match[2],
    url: match[1],
  }
}

export const restaurantNameBlockId = "restaurant-name-block"
export const restaurantNameId = "restaurant-name"

export const restaurantPatternsBlockId = "restaurant-patterns-block"
export const restaurantPatternsId = "restaurant-patterns"

export const restaurantLinksBlockId = "restaurant-links-block"
export const restaurantLinksId = "restaurant-links"
