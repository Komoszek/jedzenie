import invariant from "tiny-invariant"

export function ensureDefined<T>(value: T | undefined, message?: string): T {
    invariant(value !== undefined, message)

    return value
}
