import {EditOperation, Correction} from './model/EditOperation';

export function minimizable(
  corr: Correction,
  foundMinimization?: Correction
): boolean {
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
      for (
        let replIndex = transitionIndex;
        replIndex < operations.length;
        replIndex++
      ) {
        const transitionPair: [EditOperation, EditOperation] = [
          propagated[transitionIndex - 1],
          operations[replIndex],
        ];
        const simplification = EditOperation.simplifyPair(...transitionPair);
        if (simplification.length === 1) {
          if (foundMinimization !== undefined) {
            propagated.splice(transitionIndex - 1, 1, ...simplification);
            propagated.splice(replIndex, 1);
            foundMinimization.operations = propagated;
          }
          return true;
        }
      }
      return false;
    })
  );
}

export function minimize(corr: Correction): Correction | undefined {
  const minimzedCorrection: Correction = new Correction();
  minimizable(corr, minimzedCorrection);
  return minimzedCorrection.operations.length !== 0
    ? minimzedCorrection
    : undefined;
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