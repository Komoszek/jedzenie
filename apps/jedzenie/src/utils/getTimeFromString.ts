import { clamp } from "./clamp";

// [hour, minutes]
export type Time = [number, number];

export function getTimeFromString(timeString: string): Time {
    const [hour = 0, minutes = 0] = timeString
        .split(":")
        .slice(0, 2)
        .map(v => parseInt(v));

    return [clamp(0, hour, 23), clamp(0, minutes, 59)];
}
