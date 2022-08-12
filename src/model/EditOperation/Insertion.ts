import {EditOperation} from './EditOperation';

export class Insertion extends EditOperation {
  constructor(insertSymbol: string, index: number) {
    super('', insertSymbol, index);
  }

  apply(word: string): string {
    const indexOutOfRange = this.index > word.length || this.index < 0;
    if (indexOutOfRange)
      throw new RangeError(`Index ${this.index} is out of range`);
    return (
      word.slice(0, this.index) +
      this.insertSymbol +
      word.slice(this.index, word.length)
    );
  }
}
