import { editThreadButtonHandler } from "./editThreadButtonHandler";
import { jedzenieCommandHandler } from "./jedzenieCommandHandler";
import { showTawernaLunchMenuButtonHandler } from "./showTawernaLunchMenuButtonHandler";
import { tawernaCommandHandler } from "./tawernaCommandHandler";
import { CommandArgs, Dependencies, ViewArgs } from "./types";
import { editJedzenieThreadViewHandler } from "./editJedzenieThreadViewHandler";
import { startJedzenieThreadViewHandler } from "./startJedzenieThreadViewHandler";

export function handlers(dependencies: Dependencies) {
    return {
        tawernaCommandHandler,
        showTawernaLunchMenuButtonHandler,
        editThreadButtonHandler,
        jedzenieCommandHandler: (args: CommandArgs) => jedzenieCommandHandler(args, dependencies),
        startJedzenieThreadViewHandler: (args: ViewArgs) => startJedzenieThreadViewHandler(args, dependencies),
        editJedzenieThreadViewHandler: (args: ViewArgs) => editJedzenieThreadViewHandler(args, dependencies),
    };
}
