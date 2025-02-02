import * as v from "valibot"
import { ThreadOverflowActions, overflowActionSchema } from "../blocks/getJedzenieThreadBlock"
import { knownBlockToText } from "../utils/knownBlockToText"
import { openRestaurantEditor } from "../utils/openRestaurantEditor"
import { ActionArgs, Dependencies } from "./types"

export async function threadOverflowActionsHandler(
    { ack, client, body, payload }: ActionArgs,
    { intlService, restaurantsService }: Dependencies,
) {
    if (body.type !== "block_actions" || payload.type !== "overflow" || !body.message) {
        return
    }

    const action = v.parse(overflowActionSchema, JSON.parse(payload.selected_option.value))

    await ack()

    await openRestaurantEditor({
        triggerId: body.trigger_id,
        intlService,
        restaurantsService,
        client,
        viewOpenType: "open",
        ...(action.act === ThreadOverflowActions.EditRestaurant
            ? { restaurantId: action.id }
            : { destination: knownBlockToText(body.message.blocks.at(0)) }),
    })
}
