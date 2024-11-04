import { cancelThreadButtonHandler } from "./cancelThreadButtonHandler"
import { editJedzenieThreadViewHandler } from "./editJedzenieThreadViewHandler"
import { editThreadButtonHandler } from "./editThreadButtonHandler"
import { jedzenieCommandHandler } from "./jedzenieCommandHandler"
import { showTawernaLunchMenuButtonHandler } from "./showTawernaLunchMenuButtonHandler"
import { startJedzenieThreadViewHandler } from "./startJedzenieThreadViewHandler"
import { tawernaCommandHandler } from "./tawernaCommandHandler"
import { ActionArgs, CommandArgs, Dependencies, ViewArgs } from "./types"

export function handlers(dependencies: Dependencies) {
    return {
        tawernaCommandHandler: (args: CommandArgs) => tawernaCommandHandler(args, dependencies),
        showTawernaLunchMenuButtonHandler: (args: ActionArgs) => showTawernaLunchMenuButtonHandler(args, dependencies),
        editThreadButtonHandler: (args: ActionArgs) => editThreadButtonHandler(args, dependencies),
        cancelThreadButtonHandler: (args: ActionArgs) => cancelThreadButtonHandler(args, dependencies),
        jedzenieCommandHandler: (args: CommandArgs) => jedzenieCommandHandler(args, dependencies),
        startJedzenieThreadViewHandler: (args: ViewArgs) => startJedzenieThreadViewHandler(args, dependencies),
        editJedzenieThreadViewHandler: (args: ViewArgs) => editJedzenieThreadViewHandler(args, dependencies),
    }
}
