import {EditOperation} from './EditOperation';

export class Deletion implements EditOperation {
  deleteSymbol: string;
  insertSymbol: string;
  index: number;
  apply(word: String): String {
    return word.slice(0, this.index - 1) + word.slice(this.index, word.length);
  }
}
