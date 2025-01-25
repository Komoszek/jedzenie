import { inject } from "@jedzenie/utils"
import { appMentionHandler } from "./appMentionHandler"
import { memberJoinedWatchedChannelHandler } from "./memberJoinedWatchedChannelHandler"
import { messageImHandler } from "./messageImHandler"
import { nkCommandHandler } from "./nkCommandHandler"
import { silentNkShortcutHandler } from "./silentNkShortcutHandler"
import { Dependencies } from "./types"

export function handlers(dependencies: Dependencies) {
    return inject(
        {
            appMentionHandler,
            nkCommandHandler,
            messageImHandler,
            silentNkShortcutHandler,
            memberJoinedWatchedChannelHandler,
        },
        dependencies,
    )
}
