import { getRestaurantEditorDialogBlocks } from "../blocks/getRestaurantEditorDialogBlocks"
import { WebClient } from "../handlers/types"
import { IntlService } from "../services/IntlService"
import { RestaurantsService } from "../services/RestaurantsService"
import type { ModalView } from "@slack/types"

type OpenRestaurantEditorArgs = {
    client: WebClient
    triggerId: string
    intlService: IntlService
    restaurantsService: RestaurantsService
    viewOpenType: "open" | "push"
} & ({ destination: string; restaurantId?: undefined } | { destination?: undefined; restaurantId: string })

export async function openRestaurantEditor({
    client,
    triggerId,
    restaurantId,
    destination,
    intlService,
    restaurantsService,
    viewOpenType,
}: OpenRestaurantEditorArgs) {
    const view = {
        trigger_id: triggerId,
        view: {
            type: "modal",
            callback_id: restaurantEditorId,
            ...(restaurantId !== undefined
                ? {
                      private_metadata: restaurantId,
                      blocks: getRestaurantEditorDialogBlocks({
                          restaurant: restaurantsService.getRestaurant(restaurantId),
                          intlService,
                      }),
                      title: {
                          type: "plain_text",
                          text: intlService.intl.formatMessage({
                              defaultMessage: "Edytuj restaurację",
                              id: "restaurantEditor.edit.title",
                          }),
                      },
                      close: {
                          type: "plain_text",
                          text: intlService.intl.formatMessage({
                              defaultMessage: "Anuluj",
                              id: "restaurantEditor.edit.close",
                          }),
                      },
                      submit: {
                          type: "plain_text",
                          text: intlService.intl.formatMessage({
                              defaultMessage: "Zapisz",
                              id: "restaurantEditor.edit.submit",
                          }),
                      },
                  }
                : {
                      blocks: getRestaurantEditorDialogBlocks({
                          restaurant: {
                              name: destination,
                              patterns: [destination.toLowerCase()],
                          },
                          intlService,
                      }),
                      title: {
                          type: "plain_text",
                          text: intlService.intl.formatMessage({
                              defaultMessage: "Dodaj nową restaurację",
                              id: "restaurantEditor.add.title",
                          }),
                      },
                      close: {
                          type: "plain_text",
                          text: intlService.intl.formatMessage({
                              defaultMessage: "Anuluj",
                              id: "restaurantEditor.add.close",
                          }),
                      },
                      submit: {
                          type: "plain_text",
                          text: intlService.intl.formatMessage({
                              defaultMessage: "Dodaj",
                              id: "restaurantEditor.add.submit",
                          }),
                      },
                  }),
        } satisfies ModalView,
    }

    switch (viewOpenType) {
        case "open":
            return client.views.open(view)
        case "push":
            return client.views.push(view)
    }
}

export const restaurantEditorId = "restaurant_editor"
