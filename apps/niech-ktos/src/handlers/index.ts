import { AppMentionArgs, appMentionHandler } from "./appMentionHandler";
import { messageImHandler } from "./messageImHandler";
import { nkCommandHandler } from "./nkCommandHandler";
import { CommandArgs, Dependencies, MessageArgs } from "./types";

export function handlers(dependencies: Dependencies) {
    return {
        appMentionHandler: (args: AppMentionArgs) => appMentionHandler(args, dependencies),
        nkCommandHandler: (args: CommandArgs) => nkCommandHandler(args, dependencies),
        messageImHandler: (args: MessageArgs) => messageImHandler(args, dependencies),
    };
}
