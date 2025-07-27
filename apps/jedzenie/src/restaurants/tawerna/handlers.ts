import { inject } from "@jedzenie/utils"
import { showTawernaLunchMenuButtonHandler } from "./showTawernaLunchMenuButtonHandler"
import { tawernaCommandHandler } from "./tawernaCommandHandler"
import type { TawernaDependencies } from "./types"

export function tawernaHandlers(dependencies: TawernaDependencies) {
  return inject({ tawernaCommandHandler, showTawernaLunchMenuButtonHandler }, dependencies)
}
