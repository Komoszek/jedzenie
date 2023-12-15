import { Balance } from "./types/Balance";

export function formatRankingPlace({ name, balance }: Balance, index: number) {
    const placeIcon = placeIcons[index];

    return `${placeIcon ?? `${index + 1}.`} _${name}_ – ${balance.toFixed(2)} PLN`;
}

const placeIcons = {
    0: ":first_place_medal:",
    1: ":second_place_medal:",
    2: ":third_place_medal:",
} as Record<number, string | undefined>;
