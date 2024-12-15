import {
    restaurantLinksBlockId,
    restaurantLinksId,
    restaurantNameBlockId,
    restaurantNameId,
    restaurantPatternsBlockId,
    restaurantPatternsId,
} from "../utils/getRestaurantEditorDialogBlocks"
import { refreshJedzenieThreads } from "../utils/refreshJedzenieThreads"
import { Dependencies, ViewArgs } from "./types"
import type { RichTextBlock, RichTextElement } from "@slack/web-api"

export async function restaurantEditorViewHandler(
    { ack, view, client }: ViewArgs,
    { restaurantsService, jedzenieBotId, intlService }: Dependencies,
) {
    const name = (view.state.values[restaurantNameBlockId]?.[restaurantNameId].value ?? "").trim()
    const patterns = getPatterns(view.state.values[restaurantPatternsBlockId]?.[restaurantPatternsId].value ?? "")
    const links = getLinks(view.state.values[restaurantLinksBlockId]?.[restaurantLinksId].rich_text_value)

    let restaurantId = view.private_metadata

    if (restaurantId) {
        await restaurantsService.editRestaurant({ id: restaurantId, name, patterns, links })
    } else {
        restaurantId = convertNameToId(name)

        try {
            await restaurantsService.addRestaurant({
                id: restaurantId,
                name,
                patterns,
                links,
            })
        } catch (error) {
            console.error(error)
            await ack({
                response_action: "errors",
                errors: {
                    [restaurantNameBlockId]: intlService.intl.formatMessage({
                        defaultMessage: "Wybierz inną nazwę restauracji",
                        id: "restaurantEditor.error.restaurantAlreadyExists",
                    }),
                },
            })

            return
        }
    }

    await refreshJedzenieThreads({
        client,
        jedzenieBotId,
        restaurantsFilter: [restaurantId],
        restaurantsService,
        intlService,
    })

    await ack()
}

function convertNameToId(name: string): string {
    return name.toLowerCase().replace(/\s+/g, "_")
}

function getTextSectionElements(block: RichTextBlock | undefined): RichTextElement[] {
    return (
        block?.elements.filter(element => element.type === "rich_text_section").flatMap(({ elements }) => elements) ??
        []
    )
}

function getPatterns(value: string): string[] {
    return value.split("\n").map(pattern => pattern.trim())
}

function getLinks(block: RichTextBlock | undefined): string[] {
    return getTextSectionElements(block).reduce<string[]>((acc, element) => {
        if (element.type === "link") {
            return [...acc, `<${element.url}|${element.text?.trim()}>`]
        }

        if (element.type === "text") {
            const text = element.text.trim()

            return text ? [...acc, text] : acc
        }

        return acc
    }, [])
}
