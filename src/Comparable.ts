interface Comparable<T> {
  equals(value: T): boolean;
}

function isEqual<TVal, T extends Comparable<TVal>>(comparable: T, value: TVal) {
  return comparable.equals(value);
}
