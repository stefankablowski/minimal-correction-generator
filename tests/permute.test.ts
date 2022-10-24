import permute = require('../src/permute');

function generateAllPermutations(array: any[]): any[] {
  const generator = permute(array, swapFunction);
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
});
