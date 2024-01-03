import { readFileSync, writeFileSync } from "fs";
import { writeFile } from "fs/promises";
import defaultState from "./defaultState.json";

export type Departure = {
    id: string;
    channel: string;
    ts: string;
    departureTime: number;
};

type StateSchema = {
    departures: Record<string, Departure>;
};

export class State {
    statePath: string;
    niechKtosBotId: string;
    #value: StateSchema;

    constructor(statePath: string, niechKtosBotId: string) {
        this.statePath = statePath;
        this.niechKtosBotId = niechKtosBotId;
        this.#value = this.readStateSync();
    }

    readStateSync(): StateSchema {
        try {
            const state = readFileSync(this.statePath, "utf8");

            return JSON.parse(state);
        } catch (e) {
            writeFileSync(this.statePath, JSON.stringify(defaultState));

            console.error(e);
            return defaultState;
        }
    }

    async saveState() {
        await writeFile(this.statePath, JSON.stringify(this.#value));
    }

    getAllDepartures() {
        return Object.values(this.#value.departures);
    }

    getDeparture(departureId: string) {
        return { ...this.#value.departures[departureId] };
    }

    async saveDeparture(departure: Departure) {
        this.#value.departures[departure.id] = departure;
        await this.saveState();
    }

    async removeDeparture(departureId: string) {
        delete this.#value.departures[departureId];
        await this.saveState();
    }
}
