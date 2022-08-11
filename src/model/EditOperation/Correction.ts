import {Word} from '../Word';
import {EditOperation} from './EditOperation';

export class Correction {
  constructor() {}

  operations: EditOperation[] = [];
  apply(word: Word): Word {
    return this.operations.reduce<Word>((w: Word, op: EditOperation) => {
      return op.apply(w);
    }, word);
  }
}
