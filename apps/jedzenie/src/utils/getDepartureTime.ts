import { Temporal } from "@js-temporal/polyfill"
import { Time } from "./getTimeFromString"

export function getDepartureTime({ hour, minutes }: Time, timezone: string): number {
  const now = Temporal.Now.zonedDateTimeISO(timezone)

  let departureTime = now.with({ hour: hour, minute: minutes }).round({ smallestUnit: "minute", roundingMode: "floor" })

  if (Temporal.ZonedDateTime.compare(departureTime, now) == -1) {
    departureTime = departureTime.add({ days: 1 })
  }

  return Math.floor(departureTime.toInstant().epochMilliseconds / 1000)
}
