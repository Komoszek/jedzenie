import { appMentionHandler } from "./appMentionHandler"
import { messageImHandler } from "./messageImHandler"
import { nkCommandHandler } from "./nkCommandHandler"
import { silentNkShortcutHandler } from "./silentNkShortcutHandler"
import { AppMentionArgs, CommandArgs, Dependencies, MessageArgs, ShortcutArgs } from "./types"

export function handlers(dependencies: Dependencies) {
    return {
        appMentionHandler: (args: AppMentionArgs) => appMentionHandler(args, dependencies),
        nkCommandHandler: (args: CommandArgs) => nkCommandHandler(args, dependencies),
        messageImHandler: (args: MessageArgs) => messageImHandler(args, dependencies),
        silentNkShortcutHandler: (args: ShortcutArgs) => silentNkShortcutHandler(args, dependencies),
    }
}
