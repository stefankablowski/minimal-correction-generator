import {EditOperation} from './EditOperation';
import {Word} from '../Word';

export class EmptyOperation extends EditOperation {
  constructor() {
    super('', '', 0);
  }

  apply(word: Word): Word {
    return word;
  }
}
