import { ActionArgs } from "@jedzenie/utils"
import { getPaginationValue } from "../blocks/getPaginationBlocks"
import { getRestaurantsPage } from "../utils/getRestaurantsPage"
import { Dependencies } from "./types"

export async function restauracjePaginationHandler(
  { ack, client, body, payload }: ActionArgs,
  { intlService, restaurantsService }: Dependencies,
) {
  if (body.type !== "block_actions" || !body.view?.id) {
    return
  }

  const page = getPaginationValue(payload)

  if (page === undefined) {
    return
  }

  await ack()

  await client.views.update({
    view_id: body.view.id,
    view: getRestaurantsPage({ page, restaurantsService, intlService }),
  })
}
