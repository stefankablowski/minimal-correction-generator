import {Word} from '../Word';
import {Deletion} from './Deletion';
import {EditOperation} from './EditOperation';
import {Replacement} from './Replacement';

export class Correction {
  constructor(operations: EditOperation[] = []) {
    this.operations = operations;
    // word that this correction leads to, when applied to the input word
    this.resultingWord = [];
    this.consumedIndices = [];
  }
  operations: EditOperation[] = [];
  apply(word: Word): Word {
    return this.operations.reduce<Word>((w: Word, op: EditOperation) => {
      return op.apply(w);
    }, word);
  }
  resultingWord: Word;
  consumedIndices: boolean[];

  //TODO
  simplify(): Correction {
    throw Error('Simplify not implemented yet');
  }
  extendByOperation(eop: EditOperation, resultingWord: Word): Correction {
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
    }
    return newCorrection;
  }
}
