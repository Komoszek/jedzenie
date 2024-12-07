import { ThreadOverflowActions } from "../utils/getJedzenieThreadBlock"
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

    switch (payload.selected_option.value) {
        case ThreadOverflowActions.EditRestaurant:
            await client.views.open({
                trigger_id: body.trigger_id,
                view: {
                    type: "modal",
                    callback_id: restaurantEditorEditId,
                    blocks: getRestaurantEditorDialogBlocks({
                        restaurant: restaurantsService.matchRestaurant(knownBlockToText(body.message.blocks.at(0))),
                        intlService,
                    }),
                    title: {
                        type: "plain_text",
                        text: intlService.intl.formatMessage({
                            defaultMessage: "Edytuj linki",
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
                },
            })
            return
        case ThreadOverflowActions.AddRestaurant:
            await client.views.open({
                trigger_id: body.trigger_id,
                view: {
                    type: "modal",
                    callback_id: restaurantEditorAddId,
                    blocks: getRestaurantEditorDialogBlocks({
                        restaurant: restaurantsService.matchRestaurant(knownBlockToText(body.message.blocks.at(0))),
                        intlService,
                    }),
                    title: {
                        type: "plain_text",
                        text: intlService.intl.formatMessage({
                            defaultMessage: "Edytuj linki",
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
                },
            })
            return
        default:
            console.error("unknown value passed")
    }
}

export const restaurantEditorEditId = "restaurant_editor_edit"
export const restaurantEditorAddId = "restaurant_editor_add"
