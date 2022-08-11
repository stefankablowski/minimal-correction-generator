import {EditOperation} from './EditOperation';

export class Deletion extends EditOperation {
  apply(word: string): string {
    return word.slice(0, this.index) + word.slice(this.index + 1, word.length);
  }
}
