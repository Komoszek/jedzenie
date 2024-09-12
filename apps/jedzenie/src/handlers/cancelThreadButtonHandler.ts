import { ActionArgs } from "./types"

export async function cancelThreadButtonHandler({ ack, client, body, payload }: ActionArgs) {
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
                    text: "Anuluj wątek",
                },
                close: {
                    type: "plain_text",
                    text: "Wróć do edycji",
                },
                private_metadata: payload.value,
                callback_id: cancelJedzenieThreadViewId,
                submit: {
                    type: "plain_text",
                    text: "Usuń to",
                },
            },
        })
    } catch (error) {
        console.error("Error while pushing cancel thread view", error)
    }
}

export const cancelJedzenieThreadViewId = "cancel_jedzenie_thread_view"
