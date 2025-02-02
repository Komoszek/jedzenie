import { inject } from "@jedzenie/utils"
import { appMentionHandler } from "./appMentionHandler"
import { cancelJedzenieThreadViewHandler } from "./cancelJedzenieThreadViewHandler"
import { cancelThreadButtonHandler } from "./cancelThreadButtonHandler"
import { editJedzenieThreadViewHandler } from "./editJedzenieThreadViewHandler"
import { editRestaurantButtonHandler } from "./editRestaurantButtonHandler"
import { editThreadButtonHandler } from "./editThreadButtonHandler"
import { jedzenieCommandHandler } from "./jedzenieCommandHandler"
import { restauracjeCommandHandler } from "./restauracjeCommandHandler"
import { restauracjePaginationHandler } from "./restauracjePaginationHandler"
import { restaurantEditorViewHandler } from "./restaurantEditorViewHandler"
import { startJedzenieThreadViewHandler } from "./startJedzenieThreadViewHandler"
import { threadOverflowActionsHandler } from "./threadOverflowActionsHandler"
import type { Dependencies } from "./types"

export function handlers(dependencies: Dependencies) {
    return inject(
        {
            editThreadButtonHandler,
            cancelThreadButtonHandler,
            jedzenieCommandHandler,
            startJedzenieThreadViewHandler,
            editJedzenieThreadViewHandler,
            appMentionHandler,
            restauracjeCommandHandler,
            threadOverflowActionsHandler,
            restauracjePaginationHandler,
            cancelJedzenieThreadViewHandler,
            restaurantEditorViewHandler,
            editRestaurantButtonHandler,
        },
        dependencies,
    )
}
