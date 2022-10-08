import {Word} from '../Word';

export abstract class EditOperation implements Comparable<EditOperation> {
  constructor(deleteSymbol = '', insertSymbol = '', index: number) {
    this.deleteSymbol = deleteSymbol;
    this.insertSymbol = insertSymbol;
    this.index = index;
  }
  deleteSymbol: string;
  insertSymbol: string;
  index: number;
  abstract apply(word: Word): Word;

  equals(value: EditOperation): boolean {
    return (
      typeof this === typeof value &&
      this.deleteSymbol === value.deleteSymbol &&
      this.insertSymbol === value.insertSymbol &&
      this.index === value.index
    );
  }
}
