import dayjs from "dayjs"
import { Time } from "./getTimeFromString"

export function getDepartureTime({ hour, minutes }: Time, timezone: string): number {
    const now = dayjs().tz(timezone)

    let departureTime = now.clone().set("hours", hour).set("minutes", minutes).startOf("minute")

    if (departureTime.isBefore(now)) {
        departureTime = departureTime.add(1, "days")
    }

    return departureTime.unix()
}
