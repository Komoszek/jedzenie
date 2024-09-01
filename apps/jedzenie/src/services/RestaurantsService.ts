import { readFileSync } from "fs"

export class RestaurantsService {
    private restaurants: Restaurant[]

    constructor(restaurantsPath: string) {
        this.restaurants = this.readState(restaurantsPath)
    }

    private readState(restaurantsPath: string): Restaurant[] {
        try {
            const state = readFileSync(restaurantsPath, "utf8")

            return JSON.parse(state)
        } catch (e) {
            console.error(e)
            return []
        }
    }

    recognizeRestaurant(text: string): Restaurant | undefined {
        return this.restaurants.find(({ patterns }) => patterns.some(pattern => new RegExp(pattern).test(text)))
    }
}

type Restaurant = {
    id: string
    patterns: string[]
    links: string[]
}
