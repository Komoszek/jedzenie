import { getRestaurantsPage, paginationSchema } from "../utils/getRestaurantsPage"
import { ActionArgs, Dependencies } from "./types"

export async function restauracjePaginationHandler(
    { ack, client, body, payload }: ActionArgs,
    { intlService, restaurantsService }: Dependencies,
) {
    if (body.type !== "block_actions" || !body.view?.id) {
        return
    }

    let value: string | undefined

    switch (payload.type) {
        case "button":
            value = payload.value
            break
        case "static_select":
            value = payload.selected_option.value
            break
        default:
            return
    }

    const page = paginationSchema.parse(value)

    await ack()

    await client.views.update({
        view_id: body.view.id,
        view: getRestaurantsPage({ page, restaurantsService, intlService }),
    })
}
