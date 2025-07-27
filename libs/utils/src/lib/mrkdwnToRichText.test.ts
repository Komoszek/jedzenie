import { mrkdwnToRichText } from "./mrkdwnToRichText"
import type { RichTextBlock } from "@slack/types"

describe("mrkdwnToRichText", () => {
  it("should convert a simple bolded text", () => {
    const input = "Hello, *world*!"
    const expected: RichTextBlock = {
      type: "rich_text",
      elements: [
        {
          type: "rich_text_section",
          elements: [
            {
              type: "text",
              text: "Hello, ",
            },
            {
              type: "text",
              text: "world",
              style: {
                bold: true,
              },
            },
            {
              type: "text",
              text: "!",
            },
          ],
        },
      ],
    }

    expect(mrkdwnToRichText(input)).toEqual(expected)
  })

  it("should convert a simple mrkdwn strikethrough to a RichTextBlock", () => {
    const input = "Hello, ~world~!"
    const expected: RichTextBlock = {
      type: "rich_text",
      elements: [
        {
          type: "rich_text_section",
          elements: [
            {
              type: "text",
              text: "Hello, ",
            },
            {
              type: "text",
              text: "world",
              style: {
                strike: true,
              },
            },
            {
              type: "text",
              text: "!",
            },
          ],
        },
      ],
    }

    expect(mrkdwnToRichText(input)).toEqual(expected)
  })

  it("should convert a simple mrkdwn italics to a RichTextBlock", () => {
    const input = "Hello, _world_!"
    const expected: RichTextBlock = {
      type: "rich_text",
      elements: [
        {
          type: "rich_text_section",
          elements: [
            {
              type: "text",
              text: "Hello, ",
            },
            {
              type: "text",
              text: "world",
              style: {
                italic: true,
              },
            },
            {
              type: "text",
              text: "!",
            },
          ],
        },
      ],
    }

    expect(mrkdwnToRichText(input)).toEqual(expected)
  })

  it("should convert a simple mrkdwn code to a RichTextBlock", () => {
    const input = "Hello, `world`!"
    const expected: RichTextBlock = {
      type: "rich_text",
      elements: [
        {
          type: "rich_text_section",
          elements: [
            {
              type: "text",
              text: "Hello, ",
            },
            {
              type: "text",
              text: "world",
              style: {
                code: true,
              },
            },
            {
              type: "text",
              text: "!",
            },
          ],
        },
      ],
    }

    expect(mrkdwnToRichText(input)).toEqual(expected)
  })

  it("should convert a complex mrkdwn multiple to a RichTextBlock", () => {
    const input = "Hello, *wo ~_rld_~*!"
    const expected: RichTextBlock = {
      type: "rich_text",
      elements: [
        {
          type: "rich_text_section",
          elements: [
            {
              type: "text",
              text: "Hello, ",
            },
            {
              type: "text",
              text: "wo ",
              style: {
                bold: true,
              },
            },
            {
              type: "text",
              text: "rld",
              style: {
                bold: true,
                strike: true,
                italic: true,
              },
            },
            {
              type: "text",
              text: "!",
            },
          ],
        },
      ],
    }

    expect(mrkdwnToRichText(input)).toEqual(expected)
  })

  it("should handle an empty string", () => {
    const input = ""
    const expected: RichTextBlock = {
      type: "rich_text",
      elements: [],
    }

    expect(mrkdwnToRichText(input)).toEqual(expected)
  })

  it("should handle a string with special characters", () => {
    const input = "Hello, <@U12345>!"
    const expected: RichTextBlock = {
      type: "rich_text",
      elements: [
        {
          type: "rich_text_section",
          elements: [
            {
              type: "text",
              text: "Hello, ",
            },
            {
              type: "user",
              user_id: "U12345",
            },
            {
              type: "text",
              text: "!",
            },
          ],
        },
      ],
    }

    expect(mrkdwnToRichText(input)).toEqual(expected)
  })

  it("should handle a string with link", () => {
    const input = "Just plain <google|https://google.com>.<google|https://google.com>."
    const expected: RichTextBlock = {
      type: "rich_text",
      elements: [
        {
          type: "rich_text_section",
          elements: [
            {
              type: "text",
              text: "Just plain ",
            },
            {
              type: "link",
              text: "google",
              url: "https://google.com",
            },
            {
              type: "text",
              text: ".",
            },
            {
              type: "link",
              text: "google",
              url: "https://google.com",
            },
            {
              type: "text",
              text: ".",
            },
          ],
        },
      ],
    }

    expect(mrkdwnToRichText(input)).toEqual(expected)
  })

  it("should handle a string with an emoji", () => {
    const input = "Just plain :wave:."
    const expected: RichTextBlock = {
      type: "rich_text",
      elements: [
        {
          type: "rich_text_section",
          elements: [
            {
              type: "text",
              text: "Just plain ",
            },
            {
              type: "emoji",
              name: "wave",
            },
            {
              type: "text",
              text: ".",
            },
          ],
        },
      ],
    }

    expect(mrkdwnToRichText(input)).toEqual(expected)
  })
})
