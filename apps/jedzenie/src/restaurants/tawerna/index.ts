import { showTawernaLunchMenuButtonHandler } from "./showTawernaLunchMenuButtonHandler"
import { tawernaCommandHandler } from "./tawernaCommandHandler"
import type { ActionArgs, CommandArgs } from "../../handlers/types"
import type { TawernaDependencies } from "./types"

export function tawernaHandlers(dependencies: TawernaDependencies) {
    return {
        tawernaCommandHandler: (args: CommandArgs) => tawernaCommandHandler(args, dependencies),
        showTawernaLunchMenuButtonHandler: (args: ActionArgs) => showTawernaLunchMenuButtonHandler(args, dependencies),
    }
}
