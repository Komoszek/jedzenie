import { App } from "@slack/bolt"
import { RestaurantsService } from "../services/RestaurantsService"

export type ApplyRestaurant = (props: { app: App; restaurantsService: RestaurantsService }) => void

export function applyRestaurants(
  props: { app: App; restaurantsService: RestaurantsService },
  restaurants: ApplyRestaurant[],
) {
  restaurants.forEach(restaurant => restaurant(props))
}
