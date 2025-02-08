import { App } from "@slack/bolt"

type ApplyRestaurant = (app: App) => void

export function applyRestaurants(app: App, ...restaurants: ApplyRestaurant[]) {
    restaurants.forEach(restaurant => restaurant(app))
}
