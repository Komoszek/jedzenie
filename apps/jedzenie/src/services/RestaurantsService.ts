import { readFileSync } from "fs"
import { z } from "zod"

export class RestaurantsService {
    private restaurants: Restaurant[]

    constructor(restaurantsPath: string) {
        this.restaurants = this.readState(restaurantsPath)
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
        return this.restaurants.find(({ patterns }) => patterns.some(pattern => new RegExp(pattern).test(text)))
    }
}

const restaurantSchema = z.object({
    id: z.string(),
    name: z.string(),
    patterns: z.array(z.string()),
    links: z.array(z.string()),
})

type Restaurant = z.infer<typeof restaurantSchema>
