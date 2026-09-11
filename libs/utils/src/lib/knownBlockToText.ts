import type { AnyBlock, KnownBlock, RichTextElement } from "@slack/types"

export function knownBlockToText(block: AnyBlock, separator = " "): string {
  if (isBlockOfType(block, "rich_text")) {
    return block.elements
      .flatMap(element => {
        switch (element.type) {
          case "rich_text_section":
          case "rich_text_quote":
            return richTextElementsToText(element.elements)
          case "rich_text_list":
            return element.elements.map(({ elements }) => richTextElementsToText(elements))
          case "rich_text_preformatted":
            return element.elements.map(r => r.text)
        }
      })
      .join(separator)
  }

  if (isBlockOfType(block, "section")) {
    return block.fields?.map(v => v.text).join(" ") ?? block.text?.text ?? ""
  }

  return ""
}

function isBlockOfType<Type extends KnownBlock["type"]>(
  block: AnyBlock,
  type: Type,
): block is Extract<KnownBlock, { type: Type }> {
  return block.type === type
}

function richTextElementsToText(richTextElements: RichTextElement[]) {
  return richTextElements.reduce((accumulator, current) => {
    switch (current.type) {
      case "emoji":
        return accumulator + `:${current.name}:`
      case "text":
        return accumulator + current.text
      case "link":
        return accumulator + (current.text ?? current.url)
      case "broadcast":
        return accumulator + `@${current.range}`
      case "user":
        return accumulator + `<@${current.user_id}>`
      case "usergroup":
        return accumulator + `<!subteam^${current.usergroup_id}>`
      default:
        return accumulator
    }
  }, "")
}
