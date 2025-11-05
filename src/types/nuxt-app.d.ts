declare module '#app' {
  export type NuxtPluginProvide<T = Record<string, any>> = {
    provide?: T
    [key: string]: any
  }

  export function defineNuxtPlugin<T = Record<string, any>>(
    plugin: (...args: any[]) => NuxtPluginProvide<T>
  ): NuxtPluginProvide<T>
  export function useRuntimeConfig(): any
  export function useNuxtApp(): any
}

export {}
