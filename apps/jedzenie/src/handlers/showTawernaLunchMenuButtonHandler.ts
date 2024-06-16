import { ActionArgs, Dependencies } from "./types";
import { getTawernaLunchMenuMessageBlocks } from "./tawernaCommandHandler";
import { View } from "@slack/bolt";

export async function showTawernaLunchMenuButtonHandler(
    { ack, client, body }: ActionArgs,
    { tawernaMenuService }: Dependencies,
) {
    await ack();

    if (body.type !== "block_actions") {
        return;
    }

    const commonViewProps = {
        type: "modal",
        title: {
            type: "plain_text",
            text: "Tawerna - Lunch Menu",
        },
        close: {
            type: "plain_text",
            text: "Fajno",
        },
    } as const satisfies Partial<View>;

    const { view } = await client.views.open({
        trigger_id: body.trigger_id,
        view: {
            ...commonViewProps,
            blocks: [
                {
                    type: "image",
                    image_url: "https://i.imgur.com/JXZHwU5.gif",
                    alt_text: "Lołding",
                },
            ],
        },
    });

    client.views.update({
        view_id: view?.id,
        view: { ...commonViewProps, blocks: await getTawernaLunchMenuMessageBlocks(tawernaMenuService) },
    });
}
