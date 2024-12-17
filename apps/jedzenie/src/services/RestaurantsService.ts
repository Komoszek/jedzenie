import { readFileSync } from "fs"
import { writeFile } from "fs/promises"
import { z } from "zod"
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

            return z.array(restaurantSchema).parse(JSON.parse(state))
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

    getBlockDetails(text: string) {
        const restaurant = this.matchRestaurant(text)

        if (!restaurant) {
            return undefined
        }

        const { links, id } = restaurant

        return { actions: this.restaurantActionsMap[id] ?? [], links, id }
    }

    getRestaurant(restaurantId: string): Restaurant | undefined {
        return this.restaurants.find(({ id }) => id === restaurantId)
    }

    getRestaurants(): Restaurant[] {
        return this.restaurants
    }
}

const restaurantSchema = z.object({
    id: z.string(),
    name: z.string(),
    patterns: z.array(z.string()),
    links: z.array(z.string()),
})

export type Restaurant = z.infer<typeof restaurantSchema>
