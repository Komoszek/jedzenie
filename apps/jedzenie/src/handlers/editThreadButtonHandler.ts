import { RichTextBlock, View } from "@slack/bolt"
import { ensureDefined } from "@leancodepl/utils"
import { getJedzenieDialogBlocks } from "../utils/getJedzenieDialogBlocks"
import { JedzenieThreadBlocks } from "../utils/getJedzenieThreadBlock"
import { ActionArgs } from "./types"

export async function editThreadButtonHandler({ ack, client, body, payload }: ActionArgs) {
    await ack()

    if (body.type !== "block_actions" || payload.type !== "button" || !body.message) {
        return
    }

    const { creatorId, scheduledMessageId } = JSON.parse(payload.value)

    if (body.user.id !== creatorId) {
        await client.views.open({
            trigger_id: body.trigger_id,
            view: getUserUnathorizedView(body.user.id),
        })
        return
    }

    const blocks = body.message.blocks as JedzenieThreadBlocks

    const initialDestination: RichTextBlock =
        blocks[0].type === "rich_text" ? blocks[0] : getRichTextFromMrkdwn(blocks[0].text?.text ?? "")

    const initialTime = blocks[1].text.text.match(/^\*(\d+:\d+)\*/)?.[1].padStart(5, "0")

    await client.views.open({
        trigger_id: body.trigger_id,
        view: {
            private_metadata: JSON.stringify({
                channel: ensureDefined(body.channel).id,
                ts: body.message.ts,
                scheduledMessageId,
            }),
            type: "modal",
            blocks: getJedzenieDialogBlocks({ initialTime, initialDestination }),
            title: {
                type: "plain_text",
                text: "Edytuj wątek",
            },
            close: {
                type: "plain_text",
                text: "Anuluj",
            },
            callback_id: editJedzenieThreadViewId,
            submit: {
                type: "plain_text",
                text: "Zapisz",
            },
        },
    })
}

function getUserUnathorizedView(userId: string): View {
    return {
        type: "modal",
        blocks: [
            {
                type: "section",
                text: {
                    type: "mrkdwn",
                    text: `<@${userId}> is not in the sudoers file :pepe_police:.  This incident will be reported.`,
                },
            },
        ],
        title: {
            type: "plain_text",
            text: "Brak uprawnień",
        },
        close: {
            type: "plain_text",
            text: ":scream:",
            emoji: true,
        },
    }
}

export const editJedzenieThreadViewId = "edit-jedzenie-thread-view"

// It doesn't really work because it treats mrkdwn as plain_text but it is good enough for now
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
