import { IntlService } from "../services/IntlService"
import { getJedzenieDialogBlocks, jedzenieTimezone } from "../utils/getJedzenieDialogBlocks"
import { getTimeFromString } from "../utils/getTimeFromString"
import { startJedzenieThread } from "../utils/startJedzenieThread"
import { CommandArgs, Dependencies, WebClient } from "./types"

export async function jedzenieCommandHandler(
    { ack, client, command, respond }: CommandArgs,
    { niechKtosBotId, restaurantsService, intlService }: Dependencies,
) {
    await ack()

    const normalizedText = command.text.trim()

    if (!normalizedText) {
        await openJedzenieDialog({
            client,
            triggerId: command.trigger_id,
            channel: command.channel_id,
            intlService,
        })
        return
    }

    const match = normalizedText.match(/^(\d{1,4}|\d{1,2}:\d{2})\s+(.+)$/)

    if (!match) {
        await respond(
            intlService.intl.formatMessage({
                defaultMessage: "Niepoprawne parametry. Przykład użycia: /jedzenie 12:00 :flag-gr:",
                id: "jedzenieCommandHandler.error.invalidParams",
            }),
        )
        return
    }

    const [timeString, destination] = match.slice(1)

    await startJedzenieThread({
        creatorId: command.user_id,
        time: getTimeFromString(timeString),
        client,
        channel: command.channel_id,
        destination: {
            type: "section",
            text: {
                type: "mrkdwn",
                text: destination,
            },
        },
        niechKtosBotId,
        timezone: jedzenieTimezone,
        restaurantsService,
    })
}

export const startJedzenieThreadViewId = "start-jedzenie-thread-view"

function openJedzenieDialog({
    client,
    triggerId,
    channel,
    intlService,
}: {
    client: WebClient
    channel: string
    triggerId: string
    intlService: IntlService
}) {
    return client.views.open({
        trigger_id: triggerId,
        view: {
            private_metadata: channel,
            callback_id: startJedzenieThreadViewId,
            title: {
                type: "plain_text",
                text: intlService.intl.formatMessage({
                    defaultMessage: "Rozpocznij wątek",
                    id: "startJedzenieThreadView.title",
                }),
            },
            submit: {
                type: "plain_text",
                text: intlService.intl.formatMessage({
                    defaultMessage: "Rozpocznij",
                    id: "startJedzenieThreadView.submit",
                }),
            },
            type: "modal",
            close: {
                type: "plain_text",
                text: intlService.intl.formatMessage({
                    defaultMessage: "Anuluj",
                    id: "startJedzenieThreadView.cancel",
                }),
            },
            blocks: getJedzenieDialogBlocks({ intlService }),
        },
    })
}
