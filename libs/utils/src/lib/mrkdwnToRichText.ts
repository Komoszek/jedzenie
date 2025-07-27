import type { RichTextBlock, RichTextElement, RichTextStyleable } from "@slack/types"

export function mrkdwnToRichText(mrkdwn: string): RichTextBlock {
  if (!mrkdwn) {
    return {
      type: "rich_text",
      elements: [],
    }
  }

  const elements: RichTextElement[] = []
  let currentText = ""

  const stylesState: Record<RichTextStyleKeys, boolean> = {
    bold: false,
    italic: false,
    strike: false,
    code: false,
  }

  const flushText = () => {
    if (!currentText) {
      return
    }

    const textElement: RichTextElement = {
      type: "text",
      text: currentText,
    }

    for (const key in stylesState) {
      const styleKey = key as RichTextStyleKeys

      if (stylesState[styleKey]) {
        textElement.style ??= {}
        textElement.style[styleKey] = true
      }
    }

    elements.push(textElement)
    currentText = ""
  }

  let i = 0

  const matchStyle = (char: StyleChar) => {
    flushText()
    const style = charToStyle[char]
    stylesState[style] = !stylesState[style]
    i++
    return true
  }

  const matchLinkOrUserOrUserGroup = () => {
    const endIndex = mrkdwn.indexOf(">", i + 1)

    if (endIndex === -1) {
      return false
    }

    if (endIndex > i + 2) {
      // Check for user mention
      if (mrkdwn[i + 1] === "@") {
        flushText()

        elements.push({
          type: "user",
          user_id: mrkdwn.slice(i + 2, endIndex),
        })
        i = endIndex + 1
        return true
      }

      if (mrkdwn.startsWith(subteamPrefix, i + 1)) {
        const [usergroupId, ...rest] = mrkdwn.slice(subteamPrefix.length + i + 1).split("|")

        if (!usergroupId || rest.length !== 1) {
          return false
        }

        flushText()

        elements.push({
          type: "usergroup",
          usergroupId,
        })
        i = endIndex + 1
        return true
      }
    }

    // Check for link
    const linkContent = mrkdwn.slice(i + 1, endIndex)
    const [text, url] = linkContent.split("|")

    if (!text || !url) {
      return false
    }

    flushText()

    elements.push({
      type: "link",
      text,
      url,
    })
    i = endIndex + 1

    return true
  }

  const matchEmoji = () => {
    const endIndex = mrkdwn.indexOf(":", i + 1)

    if (endIndex <= i + 1) {
      return false
    }

    flushText()

    elements.push({
      type: "emoji",
      name: mrkdwn.slice(i + 1, endIndex),
    })

    i = endIndex + 1

    return true
  }

  const matchBroadcast = () => {
    const match = mrkdwn.slice(i + 1).match(/^(here|channel)(\s|$)/)

    if (!match) {
      return false
    }

    const range = match[1] as "channel" | "here"

    elements.push({
      type: "broadcast",
      range,
    })
    i = range.length + 1

    return true
  }

  while (i < mrkdwn.length) {
    const char = mrkdwn[i]

    if (char in charToStyle) {
      matchStyle(char as StyleChar)
      continue
    }

    switch (char) {
      case "<":
        if (matchLinkOrUserOrUserGroup()) continue
        break
      case ":":
        if (matchEmoji()) continue
        break
      case "@":
        if (matchBroadcast()) continue
        break
    }

    currentText += char
    i++
  }

  flushText()

  return {
    type: "rich_text",
    elements: [
      {
        type: "rich_text_section",
        elements,
      },
    ],
  }
}

type RichTextStyle = NonNullable<RichTextStyleable["style"]>
type RichTextStyleKeys = keyof RichTextStyle

const charToStyle = {
  "*": "bold",
  _: "italic",
  "~": "strike",
  "`": "code",
} as const satisfies Record<string, RichTextStyleKeys>

type StyleChar = keyof typeof charToStyle

const subteamPrefix = "!subteam^"
