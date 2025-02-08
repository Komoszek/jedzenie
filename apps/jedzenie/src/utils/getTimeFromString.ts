import { clamp } from "@jedzenie/utils"

export type Time = { hour: number; minutes: number }

// TODO: use regex?
export function getTimeFromString(timeString: string): Time {
    if (!timeString || timeString.length > 5) {
        throw new Error("Invalid time string")
    }

    let hour = 0,
        minutes = 0
    const timeParts = timeString.split(":")

    if (timeParts.length > 2 || timeParts.length === 0) {
        throw new Error("Invalid time string")
    }

    if (timeParts.length === 1) {
        const time = timeParts[0]

        if (time.length <= 2) {
            hour = parseInt(time)
        } else {
            hour = parseInt(time.slice(0, -2))
            minutes = parseInt(time.slice(-2))
        }
    } else {
        ;[hour, minutes] = timeParts.map(part => parseInt(part))
    }

    return { hour: clamp(0, hour, 23), minutes: clamp(0, minutes, 59) }
}
