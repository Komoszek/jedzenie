import { inject } from "@jedzenie/utils"
import { imMessageHandler } from "./imMessageHandler"
import { showTawernaLunchMenuButtonHandler } from "./showTawernaLunchMenuButtonHandler"
import { tawernaCommandHandler } from "./tawernaCommandHandler"
import type { TawernaDependencies } from "./types"

export function tawernaHandlers(dependencies: TawernaDependencies) {
  return inject({ tawernaCommandHandler, showTawernaLunchMenuButtonHandler, imMessageHandler }, dependencies)
}
