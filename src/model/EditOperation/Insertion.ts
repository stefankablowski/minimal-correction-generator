import {EditOperation} from './EditOperation';
import {Word} from '../Word';

export class Insertion extends EditOperation {
  constructor(insertSymbol: string, index: number) {
    super('', insertSymbol, index);
  }

  apply(word: Word): Word {
    const indexOutOfRange = this.index > word.length || this.index < 0;
    if (indexOutOfRange)
      throw new RangeError(`Index ${this.index} is out of range`);
    return word
      .slice(0, this.index)
      .concat(this.insertSymbol)
      .concat(word.slice(this.index, word.length));
  }

  toString(): string {
    return EditOperation.print(this.insertSymbol, '⬆', this.index);
  }
}
