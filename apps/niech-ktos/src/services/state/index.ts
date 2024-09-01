import { readFileSync, writeFileSync } from "fs"
import { writeFile } from "fs/promises"
import { SplitwiseMatch } from "../splitwise"
import defaultState from "./defaultState.json"

type StateSchema = {
    splitwiseIdMap: Record<string, number | undefined>
}

export class State {
    private statePath: string
    private value: StateSchema

    constructor(statePath: string) {
        this.statePath = statePath
        this.value = this.readState()
    }

    private readState(): StateSchema {
        try {
            const state = readFileSync(this.statePath, "utf8")

            return JSON.parse(state)
        } catch (e) {
            writeFileSync(this.statePath, JSON.stringify(defaultState))

            console.error(e)
            return defaultState
        }
    }

    private async saveState() {
        await writeFile(this.statePath, JSON.stringify(this.value))
    }

    getSpltwiseIdToSlackIdMap() {
        return new Map(
            Object.entries(this.value.splitwiseIdMap).map(([slackId, splitwiseId]) => [splitwiseId, slackId]),
        )
    }

    getSplitwiseUserId(slackUserId: string) {
        return this.value.splitwiseIdMap[slackUserId]
    }

    async matchSplitwiseUserIds(matches: SplitwiseMatch[]) {
        matches.forEach(({ slackId, splitwiseId }) => {
            this.value.splitwiseIdMap[slackId] = splitwiseId
        })

        await this.saveState()
    }
}
