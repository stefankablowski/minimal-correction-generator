import {Word} from '../Word';

export abstract class EditOperation {
  constructor(deleteSymbol = '', insertSymbol = '', index: number) {
    this.deleteSymbol = deleteSymbol;
    this.insertSymbol = insertSymbol;
    this.index = index;
    if (this.deleteSymbol.length > 1 || this.insertSymbol.length > 1) {
      throw new Error('Expected symbol of length 1');
    }
  }
  deleteSymbol: string;
  insertSymbol: string;
  index: number;
  abstract apply(word: Word): Word;
}
