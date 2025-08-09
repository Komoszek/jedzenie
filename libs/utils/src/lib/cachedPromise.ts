import { Temporal } from "@js-temporal/polyfill"
import { firstValueFrom, from, Observable, shareReplay } from "rxjs"

export class CachedPromise<T> {
  private cachingTime: Temporal.DurationLike
  private fetcher: () => Promise<T>
  private cacheExpiration?: Temporal.Instant
  private $pipe?: Observable<T>

  constructor(fetcher: () => Promise<T>, cachingTime: Temporal.DurationLike) {
    this.fetcher = fetcher
    this.cachingTime = cachingTime
  }

  async get() {
    if (
      !this.$pipe ||
      !this.cacheExpiration ||
      Temporal.Instant.compare(this.cacheExpiration, Temporal.Now.instant()) === -1
    ) {
      this.$pipe = from(this.fetcher()).pipe(shareReplay(1))
      this.cacheExpiration = Temporal.Now.instant().add(this.cachingTime)
    }

    return await firstValueFrom(this.$pipe)
  }
}
