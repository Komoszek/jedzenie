import { isObject } from "@jedzenie/utils"
import { isAxiosError } from "axios"

/** For a request that threw, as opposed to one Splitwise rejected with `200 OK` */
export function getRequestFailureDetails(error: unknown) {
  if (!isAxiosError(error)) {
    return undefined
  }

  const status = error.response?.status

  return (
    [status === undefined ? undefined : `HTTP ${status}`, getErrorMessages(error.response?.data?.errors)]
      .filter(Boolean)
      .join(": ") || undefined
  )
}

export function getErrorMessages(errors: unknown) {
  if (!isObject(errors)) {
    return undefined
  }

  const messages = Object.values(errors)
    .flat()
    .filter(message => typeof message === "string")

  return messages.length > 0 ? messages.join(", ") : undefined
}
