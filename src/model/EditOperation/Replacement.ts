import {EditOperation} from './EditOperation';
import {Word} from '../Word';

export class Replacement extends EditOperation {
  apply(word: Word): Word {
    const indexOutOfRange = this.index > word.length - 1 || this.index < 0;
    if (indexOutOfRange)
      throw new RangeError(`Index ${this.index} is out of range`);
    const wrongCharacterAtIndex = word[this.index] !== this.deleteSymbol;
    if (wrongCharacterAtIndex)
      throw new Error(
        `Found ${word[this.index]} at index ${this.index}, but expected ${
          this.deleteSymbol
        }`
      );
    return word
      .slice(0, this.index)
      .concat(this.insertSymbol)
      .concat(word.slice(this.index + 1, word.length));
  }
}
