import { jedzenieCommandHandler } from "./jedzenieCommandHandler";
import { jedzenieViewSubmissionHandler } from "./jedzenieViewSubmissionHandler";
import { tawernaCommandHandler } from "./tawernaCommandHandler";
import { Dependencies, ViewArgs } from "./types";

export function handlers(dependencies: Dependencies) {
    return {
        tawernaCommandHandler,
        jedzenieCommandHandler,
        jedzenieViewSubmissionHandler: (args: ViewArgs) => jedzenieViewSubmissionHandler(args, dependencies),
    };
}
