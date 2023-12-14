import { readFileSync, writeFileSync } from "fs";
import { writeFile } from "fs/promises";
import defaultConfig from "./defaultConfig.json";

export type ConfigSchema = {
    splitwiseIdMap: Record<string, string | undefined>;
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

    async updateSplitwiseUserId(slackUserId: string, splitwiseUserId: string) {
        this.#value.splitwiseIdMap[slackUserId] = splitwiseUserId;
        await this.saveConfig();
    }
}
