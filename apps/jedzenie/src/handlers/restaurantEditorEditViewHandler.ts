import {
    restaurantLinksBlockId,
    restaurantLinksId,
    restaurantNameBlockId,
    restaurantNameId,
    restaurantPatternsBlockId,
    restaurantPatternsId,
} from "../utils/getRestaurantEditorDialogBlocks"
import { Dependencies, ViewArgs } from "./types"
import type { RichTextBlock, RichTextElement } from "@slack/types"

export async function restaurantEditorEditViewHandler(
    { ack, view, client }: ViewArgs,
    { restaurantsService }: Dependencies,
) {
    const name = view.state.values[restaurantNameBlockId]?.[restaurantNameId].value ?? ""
    const patterns = getPatterns(view.state.values[restaurantPatternsBlockId]?.[restaurantPatternsId].rich_text_value)
    const links = getLinks(view.state.values[restaurantLinksBlockId]?.[restaurantLinksId].rich_text_value)

    console.log(name, patterns, links)

    await ack()
}

function getTextSectionElements(block: RichTextBlock | undefined): RichTextElement[] {
    return (
        block?.elements.filter(element => element.type === "rich_text_section").flatMap(({ elements }) => elements) ??
        []
    )
}

function getPatterns(block: RichTextBlock | undefined): string[] {
    return getTextSectionElements(block).reduce<string[]>((acc, element) => {
        if (element.type !== "text") {
            return acc
        }

        const text = element.text.trim()

        return text ? [...acc, text] : acc
    }, [])
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
