import { readFileSync } from "fs"
import { z } from "zod"
import type { ActionsBlockElement } from "@slack/web-api"

export type RestaurantActionsMap = Record<string, ActionsBlockElement[] | undefined>
export class RestaurantsService {
    private restaurants: Restaurant[]
    private restaurantActionsMap: RestaurantActionsMap

    constructor(restaurantsPath: string, restaurantActionsMap: RestaurantActionsMap) {
        this.restaurants = this.readState(restaurantsPath)
        this.restaurantActionsMap = restaurantActionsMap
    }

    private readState(restaurantsPath: string): Restaurant[] {
        try {
            const state = readFileSync(restaurantsPath, "utf8")

            return z.array(restaurantSchema).parse(JSON.parse(state))
        } catch (e) {
            console.error(e)
            return []
        }
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
            return { actions: [], links: [] }
        }

        const { links, id } = restaurant

        return { actions: this.restaurantActionsMap[id] ?? [], links }
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
