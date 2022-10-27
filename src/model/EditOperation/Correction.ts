import {iteratePairwise} from '../../util';
import {Word} from '../Word';
import {Deletion} from './Deletion';
import {EditOperation} from './EditOperation';
import {Replacement} from './Replacement';

/**
 * @param consumedIndices bitmask tracking for which positions of the original word edit operations have been generated. true = edit operation has been generated on that index.
 * @param transitionIndex number that denotes the transition between deletions and replacements. I.e. the position where the 1st replacement occurs in operations
 * @param resultingWord word that this correction leads to, when applied this correction is applied to the input word of the algorithm
 * @param TR_INDEX_DEFAULT default value when the transitionIndex is not set
 */

export class Correction implements Comparable<Correction> {
  operations: EditOperation[] = [];
  resultingWord: Word;
  consumedIndices: boolean[];
  transitionIndex = Correction.TR_INDEX_DEFAULT;
  static TR_INDEX_DEFAULT = -1;

  constructor(operations: EditOperation[] = [], transitionIndex = -1) {
    this.operations = operations;
    this.resultingWord = [];
    this.consumedIndices = [];
    this.transitionIndex = transitionIndex;
  }

  equals(value: Correction): boolean {
    return this.operations.every((operation, index) =>
      operation.equals(value.operations[index])
    );
  }

  apply(word: Word): Word {
    return this.operations.reduce<Word>((w: Word, op: EditOperation) => {
      return op.apply(w);
    }, word);
  }

  //TODO
  simplify(): Correction {
    const newOperations: EditOperation[] = [...this.operations];
    for (const {
      value: [current, next],
      index,
    } of this.iteratePairwise()) {
      const simplifiedPair = EditOperation.simplifyPair(current, next);
      if (simplifiedPair.length === 1) {
        const [simplificationResult] = simplifiedPair;
        newOperations.splice(index, 2, simplificationResult);
      } else if (simplifiedPair.length === 0) {
        newOperations.splice(index, 2);
      }
    }
    return new Correction(newOperations);
  }

  /**
   * Returns a new correction with edit operations at index and index+1 swapped.
   */
  swap(index: number): Correction {
    const newOperations: EditOperation[] = [...this.operations];

    const swapping = EditOperation.swapPair(
      this.operations[index],
      this.operations[index + 1]
    );
    if (swapping !== undefined) {
      const [op1, op2] = swapping;
      newOperations.splice(index, 2, op1, op2);
    } else {
      const errmsg = `Not Swappable ${JSON.stringify(
        this.operations[index]
      )} ${JSON.stringify(this.operations[index + 1])}`;
      throw new Error(errmsg);
    }
    return new Correction(newOperations);
  }

  /**
   * @function iteratePairwise yields pairs of values of the operations array
   * @example (0,1) as the first pair, then (1,2) as the second pair etc.
   */
  *iteratePairwise() {
    for (let index = 0; index < this.operations.length - 1; index++) {
      const currentOperation = this.operations[index];
      const nextOperation = this.operations[index + 1];
      yield {value: [currentOperation, nextOperation], index};
    }
  }

  /**
   * @function iteratePrefixes returns all prefix of the operations, starting with the shortest prefix, ending  with a prefix ranging from the first to the forelast operation (excluding the last operation).
   */
  *iteratePrefixes() {
    for (let range = 1; range < this.operations.length; range++) {
      yield this.operations.slice(0, range);
    }
  }

  extendByOperation(
    eop: EditOperation,
    resultingWord: Word,
    canonical = false
  ): Correction {
    const newCorrection = new Correction(
      [...this.operations].concat(eop),
      this.transitionIndex
    );
    newCorrection.resultingWord = resultingWord;
    newCorrection.consumedIndices = this.consumedIndices;
    if (eop instanceof Deletion) {
      newCorrection.consumedIndices = this.consumedIndices
        .slice(0, eop.index)
        .concat(
          this.consumedIndices.slice(eop.index + 1, this.consumedIndices.length)
        );
    }
    if (eop instanceof Replacement) {
      newCorrection.consumedIndices = [...this.consumedIndices];
      newCorrection.consumedIndices[eop.index] = true;
      if (canonical) {
        newCorrection.transitionIndex =
          newCorrection.transitionIndex === Correction.TR_INDEX_DEFAULT
            ? this.operations.length
            : newCorrection.transitionIndex;
      }
    }
    return newCorrection;
  }

  public toString(): string {
    return this.operations.join();
  }

  isEmpty(): boolean {
    return !!this.operations.find(op => op.isEmpty());
  }

  static apply(operations: EditOperation[], word: Word): Word {
    return operations.reduce<Word>((w: Word, op: EditOperation) => {
      return op.apply(w);
    }, word);
  }

  static printMinCorrections(minCorrections: Correction[]) {
    const str = minCorrections.join('\n');
    console.log(str);
    // console.log(
    //   `${JSON.stringify(c.operations)}, resultingword: ${c.resultingWord}`
    // )
  }

  static simplifiable(operations: EditOperation[]) {
    const operationPairs = iteratePairwise<EditOperation>(operations);
    for (const {
      value: [current, next],
      index,
    } of operationPairs) {
      const simplifiedPair = EditOperation.simplifyPair(current, next);
      const simplificationFound: boolean = simplifiedPair.length !== 2;
      if (simplificationFound) return true;
    }
    return false;
  }
}
