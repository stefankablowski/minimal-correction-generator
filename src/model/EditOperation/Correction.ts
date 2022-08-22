import {Word} from '../Word';
import {EditOperation} from './EditOperation';

export class Correction {
  constructor(operations: EditOperation[] = []) {
    this.operations = operations;
    this.resultingWord = [];
  }
  operations: EditOperation[] = [];
  apply(word: Word): Word {
    return this.operations.reduce<Word>((w: Word, op: EditOperation) => {
      return op.apply(w);
    }, word);
  }
  resultingWord: Word;
  //TODO
  simplify(): Correction {
    throw Error('Simplify not implemented yet');
  }
  extend(eop: EditOperation, resultingWord: Word): Correction {
    const result = new Correction([...this.operations].concat(eop));
    result.resultingWord = resultingWord;
    return result;
  }
}
