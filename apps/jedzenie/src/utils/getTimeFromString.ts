import { clamp } from "./clamp";

// [hour, minutes]
export type Time = [number, number];

export function getTimeFromString(timeString: string): Time {
    let [hour = 0, minutes = 0] = timeString
        .split(":")
        .slice(0, 2)
        .map(v => parseInt(v));

    // change e.g. 911, 2136 hours into [9, 11] and [21, 36]
    if (hour > 99) {
        minutes = hour % 100;
        hour = Math.floor(hour / 100);
    }

    return [clamp(0, hour, 23), clamp(0, minutes, 59)];
}
