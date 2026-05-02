export type KeysOfType<T, TKeyType> = {
  [K in keyof T]: T[K] extends TKeyType ? K : never;
}[keyof T];
