import permute = require('../src/permute');

function generateAllPermutations(
  array: any[],
  swapFunction:
    | ((index1: any, index2: any, oldArray: any[]) => any)
    | undefined = undefined
): any[] {
  let generator;
  if (swapFunction !== undefined) {
    generator = permute(array, swapFunction);
  } else {
    generator = permute(array);
  }
  const result: any[] = [];
  let next: string | any[] | undefined = array;
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

describe('Permute', () => {
  test('Permute', () => {
    const permuteArray = ['a', 'b', 'c'];
    //const permutation = permute(permuteArray, swapFunction)();
    console.log(generateAllPermutations(permuteArray));
  });

  test('Custom Swap Function', () => {
    const permuteArray = ['a', 'b', 'c'];
    expect(generateAllPermutations(permuteArray)).toStrictEqual(
      generateAllPermutations(permuteArray, swapFunction)
    );
  });
});
