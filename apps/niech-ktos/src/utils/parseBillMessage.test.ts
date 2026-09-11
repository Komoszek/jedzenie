import { Bill, parseBillMessage } from "./parseBillMessage"

describe("parseBillMessage", () => {
  it("should parse a bill with the payer declared on a separate line", () => {
    const result = parseBillMessage(
      ["rachunek Tawerna", "płaci <@U1>", "<@U1> 45", "<@U2> 30,50", "<@U3> 25"].join("\n"),
    )

    expect(result).toEqual({
      type: "bill",
      bill: {
        description: "Tawerna",
        payerSlackId: "U1",
        shares: [
          { slackId: "U1", amount: 4500 },
          { slackId: "U2", amount: 3050 },
          { slackId: "U3", amount: 2500 },
        ],
        total: 10050,
      } satisfies Bill,
    })
  })

  it("should parse a bill addressed to the bot with the payer declared on the first line", () => {
    const result = parseBillMessage(["<@UBOT> rachunek za Tawernę, płaci <@U1>", "<@U2> 30", "<@U3> 25"].join("\n"))

    expect(result).toMatchObject({
      type: "bill",
      bill: {
        description: "Tawernę",
        payerSlackId: "U1",
        total: 5500,
      },
    })
  })

  it("should parse a bill written as a bullet list", () => {
    const result = parseBillMessage(
      ["rachunek Tawerna", "• płaci <@U1>", "• <@U1> 45", "- <@U2> 30", "1. <@U3> 25"].join("\n"),
    )

    expect(result).toMatchObject({
      type: "bill",
      bill: {
        payerSlackId: "U1",
        shares: [
          { slackId: "U1", amount: 4500 },
          { slackId: "U2", amount: 3000 },
          { slackId: "U3", amount: 2500 },
        ],
        total: 10000,
      },
    })
  })

  it("should parse a bill that came in as a rich text message", () => {
    // rich text bullets are structural, so this is what getMessageText recovers from such a message
    const result = parseBillMessage("rachunek Tawerna, płaci <@U1>\n<@U1> 45\n<@U2> 30")

    expect(result).toMatchObject({
      type: "bill",
      bill: { description: "Tawerna", payerSlackId: "U1", total: 7500 },
    })
  })

  it("should parse a bill without a description", () => {
    const result = parseBillMessage(["rachunek", "zapłaciła <@U1>", "<@U2> 30"].join("\n"))

    expect(result).toMatchObject({
      type: "bill",
      bill: { description: undefined, payerSlackId: "U1", total: 3000 },
    })
  })

  it.each([
    ["on the first line", ["rachunek Tawerna, płaci <@U1> 45", "<@U2> 30"]],
    ["on a line of its own", ["rachunek Tawerna", "płaci <@U1> 45 zł", "<@U2> 30"]],
  ])("should reject an amount next to the payer %s", (_, lines) => {
    expect(parseBillMessage(lines.join("\n"))).toEqual({ type: "invalid", error: { type: "payerWithAmount" } })
  })

  it.each([
    ["a dot as a decimal separator", "<@U2> 30.50", 3050],
    ["a single decimal place", "<@U2> 30,5", 3050],
    ["a currency suffix", "<@U2> 30 zł", 3000],
    ["a colon separator", "<@U2>: 30", 3000],
    ["a dash separator", "<@U2> - 30", 3000],
    ["a mention with a label", "<@U2|ania> 30", 3000],
    ["a trailing comma", "<@U2> 30,", 3000],
    ["a grouped thousand", "<@U2> 1 234,56", 123456],
    ["more decimal places than there are grosze", "<@U2> 30,555", 3056],
  ])("should accept a share with %s", (_, shareLine, amount) => {
    const result = parseBillMessage(["rachunek", "płaci <@U1>", shareLine].join("\n"))

    expect(result).toMatchObject({ type: "bill", bill: { shares: [{ slackId: "U2", amount }] } })
  })

  it("should ignore empty lines", () => {
    const result = parseBillMessage(["rachunek", "", "płaci <@U1>", "  ", "<@U2> 30"].join("\n"))

    expect(result).toMatchObject({ type: "bill", bill: { total: 3000 } })
  })

  it.each([
    ["a message that is not a bill", "<@UBOT> ranking"],
    ["a bill mentioned in the middle of a message", "dodano rachunek Tawerna"],
    ["an empty message", ""],
  ])("should not recognize %s as a bill", (_, text) => {
    expect(parseBillMessage(text)).toEqual({ type: "notBill" })
  })

  it("should reject a bill without a payer", () => {
    const result = parseBillMessage(["rachunek Tawerna", "<@U2> 30"].join("\n"))

    expect(result).toEqual({ type: "invalid", error: { type: "missingPayer" } })
  })

  it("should reject a bill without shares", () => {
    const result = parseBillMessage(["rachunek Tawerna", "płaci <@U1>"].join("\n"))

    expect(result).toEqual({ type: "invalid", error: { type: "missingShares" } })
  })

  it("should reject a bill with more than one payer", () => {
    const result = parseBillMessage(["rachunek Tawerna", "płaci <@U1>", "płaci <@U2>", "<@U2> 30"].join("\n"))

    expect(result).toEqual({ type: "invalid", error: { type: "duplicatedPayer" } })
  })

  it("should reject a bill with a person listed twice", () => {
    const result = parseBillMessage(["rachunek", "płaci <@U1>", "<@U2> 30", "<@U2> 20"].join("\n"))

    expect(result).toEqual({ type: "invalid", error: { type: "duplicatedShare", slackId: "U2" } })
  })

  it.each([
    ["a share without an amount", "<@U2>"],
    ["a share with an unreadable amount", "<@U2> dużo"],
    ["a share with a zero amount", "<@U2> 0"],
    ["a line without a person", "30 zł za dowóz"],
    ["a share with an amount split by something else", "<@U2> 30 zł 40"],
  ])("should reject %s", (_, line) => {
    const result = parseBillMessage(["rachunek", "płaci <@U1>", line].join("\n"))

    expect(result).toEqual({ type: "invalid", error: { type: "invalidLine", line } })
  })
})
