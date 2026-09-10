import { NumberParser } from "@internationalized/number"

/** Reads an amount – `30`, `30,50`, `1 234,56 zł` – and returns it in grosze */
export function parseAmount(rawAmount: string) {
  const zloty = amountParser.parse(rawAmount.trim().replace(currencySuffixPattern, ""))

  if (Number.isNaN(zloty)) {
    return undefined
  }

  const amount = toGrosze(zloty)

  return amount > 0 ? amount : undefined
}

/** `toPrecision` drops the noise of a binary fraction – `30.555 * 100 = 3055.4999…` */
function toGrosze(zloty: number) {
  return Math.round(Number((zloty * 100).toPrecision(12)))
}

const amountParser = new NumberParser("pl", { style: "decimal" })
const currencySuffixPattern = /\s*(?:zł|zl|pln)$/iu
