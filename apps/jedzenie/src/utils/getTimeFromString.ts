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
        const hourString = timeParsts[0];

        if (hourString.length === 3) {
            throw new Error("Invalid time string");
        }

        hour = parseInt(hourString.slice(0, 2));

        if (hourString.length === 4) {
            minutes = parseInt(hourString.slice(-2));
        }
    } else {
        hour = parseInt(timeParsts[0]);
        minutes = parseInt(timeParsts[1]);
    }

    return [clamp(0, hour, 23), clamp(0, minutes, 59)];
}
