import {EditOperation} from './EditOperation';

export class Insertion extends EditOperation {
  apply(word: string): string {
    return (
      word.slice(0, this.index) +
      this.insertSymbol +
      word.slice(this.index, word.length)
    );
  }
}
