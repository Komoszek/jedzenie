import { jedzenieCommandHandler } from "./jedzenieCommandHandler";
import { jedzenieViewSubmissionHandler } from "./jedzenieViewSubmissionHandler";
import { tawernaCommandHandler } from "./tawernaCommandHandler";
import { CommandArgs, Dependencies, ViewArgs } from "./types";

export function handlers(dependencies: Dependencies) {
    return {
        tawernaCommandHandler,
        jedzenieCommandHandler: (args: CommandArgs) => jedzenieCommandHandler(args, dependencies),
        jedzenieViewSubmissionHandler: (args: ViewArgs) => jedzenieViewSubmissionHandler(args, dependencies),
    };
}
