import { clamp } from "./clamp";

// [hour, minutes]
export type Time = [number, number];

// TODO: use regex
export function getTimeFromString(timeString: string): Time {
    if (timeString.length > 5) {
        throw new Error("Invalid time string");
    }

    let hour = 0,
        minutes = 0;
    const timeParsts = timeString.split(":");

    if (timeParsts.length > 2 || timeParsts.length === 0) {
        throw new Error("Invalid time string");
    }

    if (timeParsts.length === 1) {
        const time = timeParsts[0];

        if (time.length <= 2) {
            hour = parseInt(time);
        } else {
            hour = parseInt(time.slice(0, -2));
            minutes = parseInt(time.slice(-2));
        }
    } else {
        [hour, minutes] = timeParsts.map(part => parseInt(part));
    }

    return [clamp(0, hour, 23), clamp(0, minutes, 59)];
}
