import {EditOperation} from './EditOperation';

export class Deletion extends EditOperation {
  constructor(deleteSymbol: string, index: number) {
    super(deleteSymbol, '', index);
  }
  apply(word: string): string {
    const indexOutOfRange = this.index > word.length - 1 || this.index < 0;
    if (indexOutOfRange)
      throw new RangeError(`Index ${this.index} is out of range`);
    const wrongCharacterAtIndex = word.charAt(this.index) !== this.deleteSymbol;
    if (wrongCharacterAtIndex)
      throw new Error(
        `Found ${word.charAt(this.index)} at index ${
          this.index
        }, but expected ${this.deleteSymbol}`
      );
    return word.slice(0, this.index) + word.slice(this.index + 1, word.length);
  }
}
