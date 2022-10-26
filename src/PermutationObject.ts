import permute = require('./permute');

export type PermutationObject<T> = any[] | T;

export function generateAllPermutations(
  array: any[],
  swapFunction:
    | ((index1: any, index2: any, oldArray: any[]) => any)
    | undefined = undefined
): any[] {
  let generator;
  if (swapFunction !== undefined) {
    generator = permute(array, array.length, swapFunction);
  } else {
    generator = permute(array, array.length);
  }
  const result: any[] = [];
  let next: string | any[] | undefined = array;
  while (next !== undefined) {
    result.push(next);
    next = generator();
  }
  return result;
}

export function generateAllPermutationsTyped<T>(
  array: T,
  length: number,
  swapFunction: (
    index1: number,
    index2: number,
    oldArray: PermutationObject<T>
  ) => T
) {
  const result: (PermutationObject<T> | string)[] = [
    ...generatePermutationTyped(array, length, swapFunction),
  ];
  return result;
}

/**
 * @function generatePermutationTyped generator function that yields all permutations of a container class with an array-like member that we want all permutations of.
 * @param array element of custom type that will be permuted n! times. Preferably a container class that contains some array member that we want all permutations of. The custom swap function operates on this type
 * @param length length of the array member
 * @param swapFunction custom function that is applied on the element of the custom type. The function receives two indices and the previous value of the element that we want to generate all permutations of. The function returns a new element, which represents a new permutation where the given indices are swapped.
 */

export function* generatePermutationTyped<T>(
  array: T,
  length: number,
  swapFunction: (
    index1: number,
    index2: number,
    oldArray: PermutationObject<T>
  ) => T
) {
  const generator = permute<T>(array, length, swapFunction);
  let next: PermutationObject<T> | string | any[] | undefined = array;
  while (next !== undefined) {
    yield next;
    next = generator();
  }
}
