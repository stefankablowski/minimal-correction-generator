import {
  Correction,
  Deletion,
  EditOperation,
  Insertion,
} from '../src/model/EditOperation';
import permute = require('../src/permute');
import {PermutationObject} from '../src/PermutationObject';

function generateAllPermutations(
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

function generateAllPermutationsTyped<T>(
  array: T,
  length: number,
  swapFunction: (
    index1: number,
    index2: number,
    oldArray: PermutationObject<T>
  ) => T
) {
  const generator = permute<T>(array, length, swapFunction);
  const result: (PermutationObject<T> | string)[] = [];
  let next: PermutationObject<T> | string | any[] | undefined = array;
  while (next !== undefined) {
    result.push(next);
    next = generator();
  }
  return result;
}

function swapFunction(index1: any, index2: any, oldArray: any[]) {
  const newArray = [...oldArray];
  const minIndex = Math.min(index1, index2);
  const maxIndex = Math.max(index1, index2);
  newArray.splice(minIndex, 2, oldArray[maxIndex], oldArray[minIndex]);
  return newArray;
}

function correctionSwapFunction(
  index1: number,
  index2: number,
  oldArray: PermutationObject<Correction>
) {
  const minIndex = index1 < index2 ? index1 : index2;
  return (oldArray as Correction).swap(minIndex);
}

describe('Permute', () => {
  test('Permute', () => {
    const permuteArray = ['a', 'b', 'c'];
    //const permutation = permute(permuteArray, swapFunction)();
    console.log(generateAllPermutations(permuteArray));

    const operations: EditOperation[] = [
      new Deletion('r', 2),
      new Deletion('e', 2),
      new Deletion('w', 2),
    ];
    const correction: Correction = new Correction(operations);

    const corrPermutations = generateAllPermutationsTyped(
      correction,
      correction.operations.length,
      correctionSwapFunction
    );

    Correction.printMinCorrections(corrPermutations as Correction[]);
  });

  test('Custom Swap Function', () => {
    const permuteArray = ['a', 'b', 'c'];
    expect(generateAllPermutations(permuteArray)).toStrictEqual(
      generateAllPermutations(permuteArray, swapFunction)
    );
  });
});
