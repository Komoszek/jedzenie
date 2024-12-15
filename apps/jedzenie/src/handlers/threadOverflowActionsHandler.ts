import { ThreadOverflowActions, overflowActionSchema } from "../utils/getJedzenieThreadBlock"
import { getRestaurantEditorDialogBlocks } from "../utils/getRestaurantEditorDialogBlocks"
import { knownBlockToText } from "../utils/knownBlockToText"
import { ActionArgs, Dependencies } from "./types"

export async function threadOverflowActionsHandler(
    { ack, client, body, payload }: ActionArgs,
    { intlService, restaurantsService }: Dependencies,
) {
    if (body.type !== "block_actions" || payload.type !== "overflow" || !body.message) {
        return
    }

    const action = overflowActionSchema.parse(JSON.parse(payload.selected_option.value))
    await ack()

    const destination = knownBlockToText(body.message.blocks.at(0))

    await client.views.open({
        trigger_id: body.trigger_id,
        view: {
            type: "modal",
            callback_id: restaurantEditorId,
            ...(action.act === ThreadOverflowActions.AddRestaurant
                ? {
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
                              id: "cancelThreadView.add.submit",
                          }),
                      },
                  }
                : {
                      private_metadata: action.id,
                      blocks: getRestaurantEditorDialogBlocks({
                          restaurant: restaurantsService.matchRestaurant(destination),
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
                              id: "cancelThreadView.edit.submit",
                          }),
                      },
                  }),
        },
    })
}

export const restaurantEditorId = "restaurant_editor"
