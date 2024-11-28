import { firstValueFrom, forkJoin, map, timer } from "rxjs"
import { ActionArgs } from "../../handlers/types"
import { getTawernaLunchMenuMessageBlocks } from "./tawernaCommandHandler"
import { TawernaDependencies } from "./types"
import type { View } from "@slack/types"

export async function showTawernaLunchMenuButtonHandler(
    { ack, client, body }: ActionArgs,
    { tawernaMenuService, intlService }: TawernaDependencies,
) {
    await ack()

    if (body.type !== "block_actions") {
        return
    }

    const commonViewProps = {
        type: "modal",
        title: {
            type: "plain_text",
            text: intlService.intl.formatMessage({
                defaultMessage: "Tawerna - Lunch Menu",
                id: "showTawernaLunchMenuHandler.view.title",
            }),
        },
        close: {
            type: "plain_text",
            text: intlService.intl.formatMessage({
                defaultMessage: "Fajno",
                id: "showTawernaLunchMenuHandler.view.close",
            }),
        },
    } as const satisfies Partial<View>

    const { view } = await client.views.open({
        trigger_id: body.trigger_id,
        view: {
            ...commonViewProps,
            blocks: [
                {
                    type: "image",
                    image_url: "https://i.imgur.com/JXZHwU5.gif",
                    alt_text: intlService.intl.formatMessage({
                        defaultMessage: "Lołding",
                        id: "showTawernaLunchMenuHandler.view.loader.alt",
                    }),
                },
            ],
        },
    })

    if (!view?.id) {
        return
    }

    client.views.update({
        view_id: view.id,
        view: {
            ...commonViewProps,
            blocks: await firstValueFrom(
                forkJoin({ blocks: getTawernaLunchMenuMessageBlocks(tawernaMenuService), timer: timer(200) }).pipe(
                    map(({ blocks }) => blocks),
                ),
            ),
        },
    })
}
