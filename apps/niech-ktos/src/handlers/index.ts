import { AppMentionArgs, appMentionHandler } from "./appMentionHandler";
import { nkCommandHandler } from "./nkCommandHandler";
import { CommandArgs, Dependencies } from "./types";

export function handlers(dependencies: Dependencies) {
    return {
        appMentionHandler: (args: AppMentionArgs) => appMentionHandler(args, dependencies),
        nkCommandHandler: (args: CommandArgs) => nkCommandHandler(args, dependencies),
    };
}
