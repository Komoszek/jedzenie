import { App } from "@slack/bolt"
import { tawernaHandlers } from "./handlers"
import { TawernaDependencies } from "./types"

export function tawerna(dependencies: TawernaDependencies) {
    return (app: App) => {
        const { tawernaCommandHandler, showTawernaLunchMenuButtonHandler } = tawernaHandlers(dependencies)

        app.command("/tawerna", tawernaCommandHandler)
        app.action(showTawernaLunchMenuButtonId, showTawernaLunchMenuButtonHandler)
    }
}

export const showTawernaLunchMenuButtonId = "show_tawerna_lunch_menu"
