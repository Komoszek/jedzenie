import dayjs, { Dayjs, ManipulateType } from "dayjs"
import { firstValueFrom, from, Observable, shareReplay } from "rxjs"

type CachingTime = { value: number; unit: ManipulateType }

export class CachedPromise<T> {
    private cachingTime: CachingTime
    private fetcher: () => Promise<T>
    private cacheExpiration?: Dayjs
    private $pipe?: Observable<T>

    constructor(fetcher: () => Promise<T>, cachingTime: CachingTime) {
        this.fetcher = fetcher
        this.cachingTime = cachingTime
    }

    async get() {
        if (!this.$pipe || !this.cacheExpiration || this.cacheExpiration.isBefore(dayjs())) {
            this.$pipe = from(this.fetcher()).pipe(shareReplay(1))
            this.cacheExpiration = dayjs().add(this.cachingTime.value, this.cachingTime.unit)
        }

        return await firstValueFrom(this.$pipe)
    }
}
