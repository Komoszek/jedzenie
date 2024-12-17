import { ThreadOverflowActions, overflowActionSchema } from "../utils/getJedzenieThreadBlock"
import { getRestaurantEditorDialogBlocks } from "../utils/getRestaurantEditorDialogBlocks"
import { knownBlockToText } from "../utils/knownBlockToText"
import { ActionArgs, Dependencies } from "./types"

export async function threadOverflowActionsHandler(
    { ack, client, body, payload }: ActionArgs,
    { intlService, restaurantsService }: Dependencies,
) {
    await ack()

    if (body.type !== "block_actions" || payload.type !== "overflow" || !body.message) {
        return
    }

    const action = overflowActionSchema.parse(JSON.parse(payload.selected_option.value))

    await client.views.open({
        trigger_id: body.trigger_id,
        view: {
            type: "modal",
            callback_id: restaurantEditorId,
            ...(action.act === ThreadOverflowActions.AddRestaurant
                ? {
                      blocks: getRestaurantEditorDialogBlocks({
                          restaurant: getRestaurantLike(knownBlockToText(body.message.blocks.at(0))),
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
                          restaurant: restaurantsService.getRestaurant(action.id),
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
                  }),
        },
    })
}

export const restaurantEditorId = "restaurant_editor"

function getRestaurantLike(destination: string) {
    return {
        name: destination,
        patterns: [destination.toLowerCase()],
    }
}
