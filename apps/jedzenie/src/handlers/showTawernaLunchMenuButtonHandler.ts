import { ActionArgs } from "./types";
import { getTawernaLunchMenuMessageBlocks } from "./tawernaCommandHandler";
import { View } from "@slack/bolt";

export async function showTawernaLunchMenuButtonHandler({ ack, client, body }: ActionArgs) {
    await ack();

    if (body.type !== "block_actions") {
        return;
    }

    const commonViewProps = {
        type: "modal",
        title: {
            type: "plain_text",
            text: "Tawerna - Lunch Menu",
            emoji: true,
        },
        close: {
            type: "plain_text",
            text: "Fajno",
            emoji: true,
        },
    } as const satisfies Partial<View>;

    const { view } = await client.views.open({
        trigger_id: body.trigger_id,
        view: {
            ...commonViewProps,
            blocks: [],
        },
    });

    client.views.update({
        view_id: view?.id,
        view: { ...commonViewProps, blocks: await getTawernaLunchMenuMessageBlocks() },
    });
}
