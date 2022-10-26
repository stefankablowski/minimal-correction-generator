import {EditOperation, Correction} from './model/EditOperation';

/**
 * Checks whether a correction is minimizable and, if a correction is given, modifies the correction to the minimized version. A correction is minimizable if the propagation of a deletion and a replacement to the center (transitionIndex) can be simplified to a single deletion.
 */
export function minimizable(
  corr: Correction,
  foundMinimization?: Correction
): boolean {
  if (corr.isEmpty()) {
    return false;
  }
  const {operations, transitionIndex} = corr;
  const deletions = corr.operations.slice(0, transitionIndex);
  // propagate each deletion to the right and compare with each replacement
  return (
    undefined !==
    deletions.find((del: EditOperation, delIndex: number) => {
      const delDestinationIndex = transitionIndex - 1;
      if (delDestinationIndex < 0) {
        return false;
      }
      const {operations: propagated} = propagateFromTo(
        delIndex,
        delDestinationIndex,
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

  return minimizable(corr, minimzedCorrection) ? minimzedCorrection : undefined;
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
