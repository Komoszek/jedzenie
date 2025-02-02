import { formatUserMention } from "@jedzenie/utils"
import * as v from "valibot"
import { ensureDefined } from "@leancodepl/utils"
import { editButtonValueSchema } from "../blocks/getEditThreadButtonBlock"
import { getJedzenieDialogBlocks } from "../blocks/getJedzenieDialogBlocks"
import { JedzenieThreadBlocks } from "../blocks/getJedzenieThreadBlock"
import { IntlService } from "../services/IntlService"
import { ActionArgs, Dependencies } from "./types"
import type { ActionsBlock, RichTextBlock, View } from "@slack/types"

export async function editThreadButtonHandler(
    { ack, client, body, payload }: ActionArgs,
    { intlService }: Dependencies,
) {
    await ack()

    if (body.type !== "block_actions" || payload.type !== "button" || !body.message) {
        return
    }

    const { creatorId, scheduledMessageId = "" } = payload.value
        ? v.parse(editButtonValueSchema, JSON.parse(payload.value))
        : {}

    if (body.user.id !== creatorId) {
        await client.views.open({
            trigger_id: body.trigger_id,
            view: getUserUnauthorizedView(body.user.id, intlService),
        })
        return
    }

    const blocks = body.message.blocks as JedzenieThreadBlocks

    const initialDestination: RichTextBlock =
        blocks[0].type === "rich_text" ? blocks[0] : getRichTextFromMrkdwn(blocks[0].text?.text ?? "")

    const initialTime = getTimeFromThreadBlocks(blocks)

    const updateMetadata = {
        channel: ensureDefined(body.channel).id,
        ts: body.message.ts,
        scheduledMessageId,
    }

    await client.views.open({
        trigger_id: body.trigger_id,
        view: {
            private_metadata: JSON.stringify(updateMetadata),
            type: "modal",
            blocks: [
                ...getJedzenieDialogBlocks({ initialTime, initialDestination, intlService }),
                getCancelButtonBlock(updateMetadata, intlService),
            ],
            title: {
                type: "plain_text",
                text: intlService.intl.formatMessage({
                    defaultMessage: "Edytuj wątek",
                    id: "editJedzenieThreadView.title",
                }),
            },
            close: {
                type: "plain_text",
                text: intlService.intl.formatMessage({ defaultMessage: "Anuluj", id: "editJedzenieThreadView.close" }),
            },
            callback_id: editJedzenieThreadViewId,
            submit: {
                type: "plain_text",
                text: intlService.intl.formatMessage({ defaultMessage: "Zapisz", id: "editJedzenieThreadView.submit" }),
            },
        },
    })
}

export const threadMetadataSchema = v.object({
    channel: v.string(),
    ts: v.string(),
    scheduledMessageId: v.string(),
})

type ThreadMetadata = v.InferOutput<typeof threadMetadataSchema>

export function getTimeFromThreadBlocks(blocks: JedzenieThreadBlocks) {
    return blocks[1].text.text.match(/^\*(\d+:\d+)\*/)?.[1].padStart(5, "0")
}

function getUserUnauthorizedView(userId: string, intlService: IntlService): View {
    return {
        type: "modal",
        blocks: [
            {
                type: "section",
                text: {
                    type: "mrkdwn",
                    text: intlService.intl.formatMessage(
                        {
                            defaultMessage:
                                "{user} is not in the sudoers file :pepe_police:.  This incident will be reported.",
                            id: "userUnathorizedView.body",
                        },
                        { user: formatUserMention(userId) },
                    ),
                },
            },
        ],
        title: {
            type: "plain_text",
            text: intlService.intl.formatMessage({
                defaultMessage: "Brak uprawnień",
                id: "userUnathorizedView.title",
            }),
        },
        close: {
            type: "plain_text",
            text: intlService.intl.formatMessage({
                defaultMessage: ":scream:",
                id: "userUnathorizedView.close",
            }),
            emoji: true,
        },
    }
}

export const editJedzenieThreadViewId = "edit-jedzenie-thread-view"

// TODO: It doesn't really work because it treats mrkdwn as plain_text but it is good enough for now
function getRichTextFromMrkdwn(mrkdwn: string): RichTextBlock {
    return {
        type: "rich_text",
        elements: [
            {
                type: "rich_text_section",
                elements: [{ type: "text", text: mrkdwn }],
            },
        ],
    }
}

function getCancelButtonBlock(threadMetadata: ThreadMetadata, intlService: IntlService): ActionsBlock {
    return {
        type: "actions",
        elements: [
            {
                type: "button",
                text: {
                    type: "plain_text",
                    text: intlService.intl.formatMessage({
                        defaultMessage: "Anuluj wątek",
                        id: "cancelThreadButton.label",
                    }),
                    emoji: true,
                },
                style: "danger",
                value: JSON.stringify(threadMetadata),
                action_id: cancelThreadButtonId,
            },
        ],
    }
}

export const cancelThreadButtonId = "cancel_thread"
