import {Word} from '../Word';

export abstract class EditOperation {
  constructor(deleteSymbol: string, insertSymbol: string, index: number) {
    this.deleteSymbol = deleteSymbol;
    this.insertSymbol = insertSymbol;
    this.index = index;
  }
  deleteSymbol: string;
  insertSymbol: string;
  index: number;
  abstract apply(word: Word): Word;
}
