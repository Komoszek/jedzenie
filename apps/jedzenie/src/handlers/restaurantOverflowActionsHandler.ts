import { getRestaurantEditorDialogBlocks } from "../utils/getRestaurantEditorDialogBlocks"
import { overflowActionSchema } from "./appMentionHandler"
import { restaurantEditorId } from "./threadOverflowActionsHandler"
import { ActionArgs, Dependencies } from "./types"

export async function restaurantOverflowActionsHandler(
    { ack, client, body, payload }: ActionArgs,
    { intlService, restaurantsService }: Dependencies,
) {
    await ack()

    if (body.type !== "block_actions" || payload.type !== "overflow") {
        return
    }

    const action = overflowActionSchema.parse(JSON.parse(payload.selected_option.value))

    await client.views.push({
        trigger_id: body.trigger_id,
        view: {
            type: "modal",
            callback_id: restaurantEditorId,
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
        },
    })
}
