import type { KnownBlock, RichTextElement } from "@slack/types"

export function knownBlockToText(block: KnownBlock): string {
  switch (block.type) {
    case "rich_text":
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
        .join(" ")
    case "section":
      return block.fields?.map(v => v.text).join(" ") ?? block.text?.text ?? ""
    default:
      return ""
  }
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
