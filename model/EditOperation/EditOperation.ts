import {Word} from '../Word';

export interface EditOperation {
  deleteSymbol: string;
  insertSymbol: string;
  index: number;
  apply(word: Word): Word;
}
