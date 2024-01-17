import { ActionArgs } from "./types";
import { getTawernaLunchMenuMessageBlocks } from "./tawernaCommandHandler";

export async function showTawernaLunchMenuButtonHandler({ ack, client, body }: ActionArgs) {
    await ack();

    if (body.type !== "block_actions") {
        return;
    }

    await client.views.open({
        trigger_id: body.trigger_id,
        view: {
            type: "modal",
            blocks: await getTawernaLunchMenuMessageBlocks(),
            title: {
                type: "plain_text",
                text: "Tawerna - Lunch Menu",
                emoji: true,
            },
            close: {
                type: "plain_text",
                text: "Ok",
                emoji: true,
            },
        },
    });
}
