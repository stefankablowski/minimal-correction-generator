import {Word} from '../Word';
import {Deletion} from './Deletion';
import {EditOperation} from './EditOperation';
import {Replacement} from './Replacement';

export class Correction implements Comparable<Correction> {
  operations: EditOperation[] = [];
  resultingWord: Word;
  consumedIndices: boolean[];
  // transition between deletions and replacements, index of 1st replacement
  transitionIndex = Correction.T_INDEX_DEFAULT;
  static T_INDEX_DEFAULT = -1;

  constructor(operations: EditOperation[] = [], transitionIndex = -1) {
    this.operations = operations;
    // word that this correction leads to, when applied to the input word
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

  *iteratePairwise() {
    for (let index = 0; index < this.operations.length - 1; index++) {
      const currentOperation = this.operations[index];
      const nextOperation = this.operations[index + 1];
      yield {value: [currentOperation, nextOperation], index};
    }
  }

  extendByOperation(
    eop: EditOperation,
    resultingWord: Word,
    canonical = false
  ): Correction {
    const newCorrection = new Correction([...this.operations].concat(eop));
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
          newCorrection.consumedIndices.length - 1;
      }
    }
    return newCorrection;
  }

  public toString(): string {
    return this.operations.join();
  }
}
