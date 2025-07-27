import { readFileSync } from "fs"
import { writeFile } from "fs/promises"
import * as v from "valibot"
import type { ActionsBlockElement } from "@slack/web-api"

export type RestaurantActionsMap = Record<string, ActionsBlockElement[] | undefined>
export class RestaurantsService {
    private restaurantsPath: string
    private restaurants: Restaurant[]
    private restaurantActionsMap: RestaurantActionsMap

    constructor(restaurantsPath: string, restaurantActionsMap: RestaurantActionsMap) {
        this.restaurantsPath = restaurantsPath
        this.restaurants = this.readState()
        this.restaurantActionsMap = restaurantActionsMap
    }

    private readState(): Restaurant[] {
        try {
            const state = readFileSync(this.restaurantsPath, "utf8")

            return v.parse(v.array(restaurantSchema), JSON.parse(state))
        } catch (e) {
            console.error(e)
            return []
        }
    }

    private async saveState() {
        await writeFile(this.restaurantsPath, JSON.stringify(this.restaurants))
    }

    getRestaurantIndex(restaurantId: string) {
        return this.restaurants.findIndex(({ id }) => id === restaurantId)
    }

    getRestaurant(restaurantId: string) {
        return this.restaurants.find(({ id }) => id === restaurantId)
    }

    async addRestaurant(restaurant: Restaurant) {
        const restaurantIndex = this.getRestaurantIndex(restaurant.id)

        if (restaurantIndex !== -1) {
            throw new Error(`Restaurant with id ${restaurant.id} already exists`)
        }

        this.restaurants.push(restaurant)
        await this.saveState()
    }

    async editRestaurant(restaurant: Restaurant) {
        const restaurantIndex = this.getRestaurantIndex(restaurant.id)

        if (restaurantIndex === -1) {
            throw new Error(`Restaurant with id ${restaurant.id} does not exist`)
        }

        this.restaurants[restaurantIndex] = restaurant
        await this.saveState()
    }

    matchRestaurant(text: string): Restaurant | undefined {
        const normalizedText = text.toLowerCase().trim().replace(/\s+/g, " ")

        return this.restaurants.find(({ patterns }) =>
            patterns.some(pattern => new RegExp(pattern).test(normalizedText)),
        )
    }

    getRestaurantActions(restaurantId: string): ActionsBlockElement[] {
        return this.restaurantActionsMap[restaurantId] ?? []
    }

    getBlockDetails(text: string) {
        const restaurant = this.matchRestaurant(text)

        if (!restaurant) {
            return undefined
        }

        const { links, id } = restaurant

        return { actions: this.getRestaurantActions(id), links, id }
    }

    getRestaurants(): Restaurant[] {
        return this.restaurants
    }
}

const restaurantSchema = v.object({
    id: v.string(),
    name: v.string(),
    patterns: v.array(v.string()),
    links: v.array(v.string()),
})

export type Restaurant = v.InferOutput<typeof restaurantSchema>
export type RestaurantWithActions = Restaurant & {
    actions: ActionsBlockElement[]
}
