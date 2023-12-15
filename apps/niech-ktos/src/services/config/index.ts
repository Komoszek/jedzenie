import { readFileSync, writeFileSync } from "fs";
import { writeFile } from "fs/promises";
import defaultConfig from "./defaultConfig.json";
import { SplitwiseMatch } from "../splitwise";

export type ConfigSchema = {
    splitwiseIdMap: Record<string, number | undefined>;
};

export class Config {
    configPath: string;
    #value: ConfigSchema;

    constructor(configPath: string) {
        this.configPath = configPath;
        this.#value = this.readConfigSync();
    }

    readConfigSync(): ConfigSchema {
        try {
            const config = readFileSync(this.configPath, "utf8");

            return JSON.parse(config);
        } catch (e) {
            writeFileSync(this.configPath, JSON.stringify(defaultConfig));

            console.error(e);
            return defaultConfig;
        }
    }

    async saveConfig() {
        await writeFile(this.configPath, JSON.stringify(this.#value));
    }

    getSplitwiseUserId(slackUserId: string) {
        return this.#value.splitwiseIdMap[slackUserId];
    }

    async matchManySplitwiseUserIds(matches: SplitwiseMatch[]) {
        matches.forEach(({ slackId, splitwiseId }) => {
            this.#value.splitwiseIdMap[slackId] = splitwiseId;
        });

        await this.saveConfig();
    }
}
