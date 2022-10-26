export class Cache<K, V> {
  constructor() {}

  private dict: Map<K, V> = new Map<K, V>();
  set(key: K, value: V) {
    this.dict.set(key, value);
  }

  get(key: K) {
    return this.dict.get(key);
  }
}
