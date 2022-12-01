import {Token} from './Token';

export type Word = Token[];
export function createWord(String: string): Word {
  return String.split('');
}

export function texWord(word: Word) {
  return word.join(' ');
}
