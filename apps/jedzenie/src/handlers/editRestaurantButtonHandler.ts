import { ensureDefined } from "@leancodepl/utils"
import { openRestaurantEditor } from "../utils/openRestaurantEditor"
import { ActionArgs, Dependencies } from "./types"

export async function editRestaurantButtonHandler(
    { ack, client, body, payload }: ActionArgs,
    { intlService, restaurantsService }: Dependencies,
) {
    await ack()

    if (body.type !== "block_actions" || payload.type !== "button") {
        return
    }

    const restaurantId = ensureDefined(payload.value)

    await openRestaurantEditor({
        triggerId: body.trigger_id,
        intlService,
        restaurantsService,
        client,
        restaurantId,
        viewOpenType: body.view ? "push" : "open",
    })
}
