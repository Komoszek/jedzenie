import { CommandArgs } from "@jedzenie/utils"
import { IntlService } from "../../services/IntlService"
import { MenuItem } from "../../types/MenuItem"
import { TawernaMenuService } from "./TawernaMenuService"
import { TawernaDependencies } from "./types"
import type { KnownBlock, SectionBlock } from "@slack/types"

export async function tawernaCommandHandler(
  { client, ack, command: { channel_id, user_id, text } }: CommandArgs,
  { tawernaMenuService, intlService }: TawernaDependencies,
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
      : await getTawernaLunchMenuMessage(intlService, tawernaMenuService)),
  })
}

export async function getTawernaLunchMenuMessage(intlService: IntlService, tawernaMenuService: TawernaMenuService) {
  return {
    username: intlService.intl.formatMessage({
      defaultMessage: "Tawerna Grecka - Lunch Menu",
      id: "tawernaCommandHandler.lunchMenu.username",
    }),
    blocks: await getTawernaLunchMenuMessageBlocks(intlService, tawernaMenuService),
  }
}

export async function getTawernaLunchMenuMessageBlocks(
  intlService: IntlService,
  tawernaMenuService: TawernaMenuService,
) {
  const { title, menu } = await tawernaMenuService.getLunchMenu()

  return [
    {
      type: "rich_text",
      elements: [
        {
          type: "rich_text_section",
          elements: [
            {
              type: "text",
              text: title,
            },
          ],
        },
      ],
    },
    ...(menu.length
      ? menu.map(mapMenuItemToSectionBlock)
      : ([
          {
            type: "image",
            title: {
              type: "plain_text",
              text: intlService.intl.formatMessage({
                defaultMessage: "Dzisiaj nie ma lunchu",
                id: "tawernaLunchMenu.empty_menu",
              }),
            },
            image_url: "https://i.imgur.com/gYeqYM5.gif",
            alt_text: intlService.intl.formatMessage({
              defaultMessage: "Kot płacze, bo nie ma co jeść w tawernia",
              id: "tawernaLunchMenu.empy_menu.image.alt",
            }),
          },
        ] as const)),
  ] satisfies KnownBlock[]
}

function mapMenuItemToSectionBlock({ title, extra, price, image }: MenuItem): SectionBlock {
  return {
    type: "section",
    text: {
      type: "mrkdwn",
      text: `${[`*${title}*`, ...(extra ? [extra] : [])].join(" ")}\n_${price}_`,
    },
    accessory: {
      type: "image",
      image_url: image,
      alt_text: title,
    },
  }
}
