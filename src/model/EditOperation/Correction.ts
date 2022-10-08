import {Word} from '../Word';
import {Deletion} from './Deletion';
import {EditOperation} from './EditOperation';
import {Replacement} from './Replacement';

export class Correction implements Comparable<Correction> {
  constructor(operations: EditOperation[] = []) {
    this.operations = operations;
    // word that this correction leads to, when applied to the input word
    this.resultingWord = [];
    this.consumedIndices = [];
  }
  equals(value: Correction): boolean {
    return this.operations.every((operation, index) =>
      operation.equals(value.operations[index])
    );
  }

  operations: EditOperation[] = [];
  apply(word: Word): Word {
    return this.operations.reduce<Word>((w: Word, op: EditOperation) => {
      return op.apply(w);
    }, word);
  }
  resultingWord: Word;
  consumedIndices: boolean[];
  // transition between deletions and replacements, index of 1st replacement
  transitionIndex = Correction.T_INDEX_DEFAULT;
  static T_INDEX_DEFAULT = -1;

  //TODO
  simplify(): Correction {
    throw Error('Simplify not implemented yet');
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
}
