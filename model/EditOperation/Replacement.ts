import {EditOperation} from './EditOperation';

export class Replacement implements EditOperation {
  deleteSymbol: string;
  insertSymbol: string;
  index: number;
  apply(word: String): String {
    return (
      word.slice(0, this.index - 1) +
      this.insertSymbol +
      word.slice(this.index, word.length)
    );
  }
}
