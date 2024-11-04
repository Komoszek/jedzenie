import { TawernaMenuService } from "../services/TawernaMenuService"
import { MenuItem } from "../types/MenuItem"
import { CommandArgs, Dependencies } from "./types"
import type { SectionBlock } from "@slack/types"

export async function tawernaCommandHandler(
    { client, ack, command: { channel_id, user_id, text } }: CommandArgs,
    { tawernaMenuService, intlService }: Dependencies,
) {
    await ack()

    await client.chat.postEphemeral({
        channel: channel_id,
        user: user_id,
        ...(text.trim() === "menu"
            ? {
                  username: intlService.intl.formatMessage({
                      defaultMessage: "Tawerna Grecka - Menu",
                      id: "tawernaCommandHandler.menu.username",
                  }),
                  blocks: (await tawernaMenuService.getMenu()).map(mapMenuItemToSectionBlock),
              }
            : {
                  username: intlService.intl.formatMessage({
                      defaultMessage: "Tawerna Grecka - Lunch Menu",
                      id: "tawernaCommandHandler.lunchMenu.username",
                  }),
                  blocks: await getTawernaLunchMenuMessageBlocks(tawernaMenuService),
              }),
    })
}

export async function getTawernaLunchMenuMessageBlocks(tawernaMenuService: TawernaMenuService) {
    const { title, menu } = await tawernaMenuService.getLunchMenu()

    return [
        {
            type: "section",
            text: {
                type: "plain_text",
                text: title,
            },
        },
        ...menu.map(mapMenuItemToSectionBlock),
    ]
}

function mapMenuItemToSectionBlock({ title, extra, price, image }: MenuItem): SectionBlock {
    return {
        type: "section",
        text: {
            type: "mrkdwn",
            text: `${[`*${title}*`, extra].filter(Boolean).join(" ")}\n_${price}_`,
        },
        accessory: {
            type: "image",
            image_url: image,
            alt_text: title,
        },
    }
}
