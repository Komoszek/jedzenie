import { appMentionHandler } from "./appMentionHandler"
import { cancelJedzenieThreadViewHandler } from "./cancelJedzenieThreadViewHandler"
import { cancelThreadButtonHandler } from "./cancelThreadButtonHandler"
import { editJedzenieThreadViewHandler } from "./editJedzenieThreadViewHandler"
import { editThreadButtonHandler } from "./editThreadButtonHandler"
import { jedzenieCommandHandler } from "./jedzenieCommandHandler"
import { restauracjeCommandHandler } from "./restauracjeCommandHandler"
import { restaurantEditorViewHandler } from "./restaurantEditorViewHandler"
import { startJedzenieThreadViewHandler } from "./startJedzenieThreadViewHandler"
import { threadOverflowActionsHandler } from "./threadOverflowActionsHandler"
import type { ActionArgs, AppMentionArgs, CommandArgs, Dependencies, ViewArgs } from "./types"

export function handlers(dependencies: Dependencies) {
    return {
        editThreadButtonHandler: (args: ActionArgs) => editThreadButtonHandler(args, dependencies),
        cancelThreadButtonHandler: (args: ActionArgs) => cancelThreadButtonHandler(args, dependencies),
        jedzenieCommandHandler: (args: CommandArgs) => jedzenieCommandHandler(args, dependencies),
        startJedzenieThreadViewHandler: (args: ViewArgs) => startJedzenieThreadViewHandler(args, dependencies),
        editJedzenieThreadViewHandler: (args: ViewArgs) => editJedzenieThreadViewHandler(args, dependencies),
        appMentionHandler: (args: AppMentionArgs) => appMentionHandler(args, dependencies),
        restauracjeCommandHandler: (args: CommandArgs) => restauracjeCommandHandler(args, dependencies),
        threadOverflowActionsHandler: (args: ActionArgs) => threadOverflowActionsHandler(args, dependencies),
        cancelJedzenieThreadViewHandler,
        restaurantEditorViewHandler: (args: ViewArgs) => restaurantEditorViewHandler(args, dependencies),
    }
}
