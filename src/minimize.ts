import {EditOperation, Correction} from './model/EditOperation';

export function minimize(corr: Correction): boolean {
  const {operations, transitionIndex} = corr;
  const deletions = corr.operations.slice(0, transitionIndex);
  // propagate each deletion to the right and compare with each replacement
  return (
    undefined !==
    deletions.find((del: EditOperation, delIndex: number) => {
      const {operations: propagated} = propagateFromTo(
        delIndex,
        transitionIndex - 1,
        corr
      );
      console.log(propagated);
      for (
        let replIndex = transitionIndex;
        replIndex < operations.length;
        replIndex++
      ) {
        const transitionPair: [EditOperation, EditOperation] = [
          propagated[transitionIndex - 1],
          operations[replIndex],
        ];
        const simplifiable =
          EditOperation.simplifyPair(...transitionPair).length === 1;
        if (simplifiable) return true;
      }
      return false;
    })
  );
}

/**
 * Propagates an operation at @param fromindex to @param toIndex
 * @returns A new operation on which propagation has been executed
 */
export function propagateFromTo(
  fromIndex: number,
  toIndex: number,
  corr: Correction
): Correction {
  if (fromIndex === toIndex) {
    return corr;
  }
  let swapped = corr;
  if (fromIndex < toIndex) {
    swapped = corr.swap(fromIndex);
    for (let i = fromIndex + 1; i < toIndex; i++) {
      swapped = swapped.swap(i);
    }
  } else if (fromIndex > toIndex) {
    swapped = corr.swap(fromIndex - 1);
    for (let i = fromIndex - 2; i >= toIndex; i--) {
      swapped = swapped.swap(i);
    }
  }
  return swapped;
}
