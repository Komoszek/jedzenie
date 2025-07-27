/**
 * Poor man's dependency injection
 */
export function inject<TInjected, TFunctions extends Record<string, (arg: any, injected: TInjected) => void>>(
  functions: TFunctions,
  injected: TInjected,
) {
  return Object.fromEntries(Object.entries(functions).map(([key, fn]) => [key, arg => fn(arg, injected)])) as {
    [TKey in keyof TFunctions]: (arg: Parameters<TFunctions[TKey]>[0]) => ReturnType<TFunctions[TKey]>
  }
}
