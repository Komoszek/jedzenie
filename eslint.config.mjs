import { configs as nxConfigs } from "@nx/eslint-plugin"
import * as leancode from "@leancodepl/eslint-config"

const config = [
    ...nxConfigs["flat/base"],
    ...nxConfigs["flat/typescript"],
    ...nxConfigs["flat/javascript"],
    {
        ignores: ["**/dist", "node_modules"],
    },
    {
        files: ["**/*.ts", "**/*.tsx", "**/*.js", "**/*.jsx"],
        rules: {
            "@nx/enforce-module-boundaries": [
                "error",
                {
                    enforceBuildableLibDependency: true,
                    allow: ["^.*/eslint(\\.base)?\\.config\\.[cm]?js$"],
                    depConstraints: [
                        {
                            sourceTag: "*",
                            onlyDependOnLibsWithTags: ["*"],
                        },
                    ],
                },
            ],
        },
    },
    ...leancode.base,
    ...leancode.imports.map(config => ({
        ...config,
        rules: Object.fromEntries(Object.entries(config.rules).filter(rule => !rule[0].startsWith("react"))),
    })),
]

export default config
