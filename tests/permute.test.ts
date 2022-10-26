import {
  Correction,
  Deletion,
  EditOperation,
  Insertion,
} from '../src/model/EditOperation';
import permute = require('../src/permute');
import {
  generateAllPermutations,
  generateAllPermutationsTyped,
  PermutationObject,
} from '../src/PermutationObject';
import {correctionSwapFunction} from '../src/validateCorrections';

function swapFunction(index1: any, index2: any, oldArray: any[]) {
  const newArray = [...oldArray];
  const minIndex = Math.min(index1, index2);
  const maxIndex = Math.max(index1, index2);
  newArray.splice(minIndex, 2, oldArray[maxIndex], oldArray[minIndex]);
  return newArray;
}

describe('Permute', () => {
  test('Permute', () => {
    const permuteArray = ['a', 'b', 'c'];
    //const permutation = permute(permuteArray, swapFunction)();
    // console.log(generateAllPermutations(permuteArray));

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

    // Correction.printMinCorrections(corrPermutations as Correction[]);
  });

  test('Custom Swap Function', () => {
    const permuteArray = ['a', 'b', 'c'];
    expect(generateAllPermutations(permuteArray)).toStrictEqual(
      generateAllPermutations(permuteArray, swapFunction)
    );
  });
});
