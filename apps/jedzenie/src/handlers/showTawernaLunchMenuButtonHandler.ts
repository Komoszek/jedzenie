import { ActionArgs } from "./types";
import { getTawernaLunchMenuEphemeralMessageArgs } from "./tawernaCommandHandler";
import { ensureDefined } from "@leancodepl/utils";

export async function showTawernaLunchMenuButtonHandler({ ack, client, body }: ActionArgs) {
    await ack();

    if (body.type !== "block_actions") {
        return;
    }

    await client.chat.postEphemeral({
        channel: ensureDefined(body.channel?.id),
        user: body.user.id,
        ...(await getTawernaLunchMenuEphemeralMessageArgs()),
    });
}
