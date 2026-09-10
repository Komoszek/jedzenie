import { getMessageText } from "./getMessageText"
import type { KnownBlock } from "@slack/types"

describe("getMessageText", () => {
  it("should use the text of the message when there is one", () => {
    expect(getMessageText({ text: "rachunek Tawerna", blocks: [] })).toBe("rachunek Tawerna")
  })

  it("should keep every item of a rich text bullet list in a line of its own", () => {
    const blocks: KnownBlock[] = [
      {
        type: "rich_text",
        elements: [
          {
            type: "rich_text_section",
            elements: [
              { type: "text", text: "rachunek Tawerna, płaci " },
              { type: "user", user_id: "U1" },
            ],
          },
          {
            type: "rich_text_list",
            style: "bullet",
            elements: [
              {
                type: "rich_text_section",
                elements: [
                  { type: "user", user_id: "U1" },
                  { type: "text", text: " 45" },
                ],
              },
              {
                type: "rich_text_section",
                elements: [
                  { type: "user", user_id: "U2" },
                  { type: "text", text: " 30" },
                ],
              },
            ],
          },
        ],
      },
    ]

    expect(getMessageText({ blocks })).toBe("rachunek Tawerna, płaci <@U1>\n<@U1> 45\n<@U2> 30")
  })
})
