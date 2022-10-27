/**
 * Separates the values of the given array into two arrays according to the given Predicate Function. Values where the predicate is true will be returned in the first array, and values where the predicate is false will be returned in the second array
 * @param array Any array of type T
 * @param isValid Predicate
 * @returns
 */
export function partition<T>(
  array: Array<T>,
  isValid: (elem: T) => boolean
): [Array<T>, Array<T>] {
  const pass: Array<T> = [];
  const fail: Array<T> = [];
  return array.reduce(
    ([pass, fail], elem) => {
      return isValid(elem) ? [[...pass, elem], fail] : [pass, [...fail, elem]];
    },
    [pass, fail]
  );
}

export function* iteratePairwise<T>(arr: Array<T>) {
  for (let index = 0; index < arr.length - 1; index++) {
    const currentOperation = arr[index];
    const nextOperation = arr[index + 1];
    yield {value: [currentOperation, nextOperation], index};
  }
}
