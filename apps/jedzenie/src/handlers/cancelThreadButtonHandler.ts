import { ActionArgs } from "@jedzenie/utils"
import { Dependencies } from "./types"

export async function cancelThreadButtonHandler(
  { ack, client, body, payload, logger }: ActionArgs,
  { intlService }: Dependencies,
) {
  await ack()

  if (body.type !== "block_actions" || payload.type !== "button") {
    return
  }

  try {
    await client.views.push({
      trigger_id: body.trigger_id,
      view: {
        type: "modal",
        blocks: [],
        title: {
          type: "plain_text",
          text: intlService.intl.formatMessage({
            defaultMessage: "Anuluj wątek",
            id: "cancelThreadView.title",
          }),
        },
        close: {
          type: "plain_text",
          text: intlService.intl.formatMessage({
            defaultMessage: "Wróć do edycji",
            id: "cancelThreadView.close",
          }),
        },
        private_metadata: payload.value,
        callback_id: cancelJedzenieThreadViewId,
        submit: {
          type: "plain_text",
          text: intlService.intl.formatMessage({
            defaultMessage: "Usuń to",
            id: "cancelThreadView.submit",
          }),
        },
      },
    })
  } catch (error) {
    logger.error("Error while pushing cancel thread view", error)
  }
}

export const cancelJedzenieThreadViewId = "cancel_jedzenie_thread_view"
