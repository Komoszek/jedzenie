import { jedzenieCommandHandler } from "./jedzenieCommandHandler";
import { jedzenieViewSubmissionHandler } from "./jedzenieViewSubmissionHandler";
import { showTawernaLunchMenuButtonHandler } from "./showTawernaLunchMenuButtonHandler";
import { tawernaCommandHandler } from "./tawernaCommandHandler";
import { CommandArgs, Dependencies, ViewArgs } from "./types";

export function handlers(dependencies: Dependencies) {
    return {
        tawernaCommandHandler,
        showTawernaLunchMenuButtonHandler,
        jedzenieCommandHandler: (args: CommandArgs) => jedzenieCommandHandler(args, dependencies),
        jedzenieViewSubmissionHandler: (args: ViewArgs) => jedzenieViewSubmissionHandler(args, dependencies),
    };
}
