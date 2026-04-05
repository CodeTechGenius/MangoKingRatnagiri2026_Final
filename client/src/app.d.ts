// See https://kit.svelte.dev/docs/types#app
declare global {
  namespace App {
    interface PageData {}
    interface Error {
      message: string;
      code?: string;
    }
    interface Locals {}
    interface Platform {}
  }
}

export {};
