import { SectionBlock } from "@slack/bolt";
import { CommandArgs, Dependencies, WebClient } from "./types";
import { TawernaMenuService } from "../services/TawernaMenuService";
import { MenuItem } from "../types/MenuItem";

export async function tawernaCommandHandler(
    { client, ack, command: { channel_id, user_id, text } }: CommandArgs,
    { tawernaMenuService }: Dependencies,
) {
    await ack();

    let args: Parameters<WebClient["chat"]["postEphemeral"]>[0] = {
        channel: channel_id,
        user: user_id,
    };

    if (text.trim() === "menu") {
        const menu = await tawernaMenuService.getMenu();

        args.username = "Tawerna Grecka - Menu";
        args.blocks = menu.map(mapMenuItemToSectionBlock);
    } else {
        args = {
            ...args,
            blocks: await getTawernaLunchMenuMessageBlocks(tawernaMenuService),
            username: "Tawerna Grecka - Lunch Menu",
        };
    }

    await client.chat.postEphemeral(args);
}

export async function getTawernaLunchMenuMessageBlocks(tawernaMenuService: TawernaMenuService) {
    const { title, menu } = await tawernaMenuService.getLunchMenu();

    return [
        {
            type: "section",
            text: {
                type: "plain_text",
                text: title,
            },
        },
        ...menu.map(mapMenuItemToSectionBlock),
    ];
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
    };
}
