import {Word} from './model';
import {Alphabet} from './model/Alphabet';
import {Deletion, Insertion, Replacement} from './model/EditOperation';
import {Correction} from './model/EditOperation/Correction';
import {EditOperation} from './model/EditOperation/EditOperation';

export function generateCorrectionsOfLength(
  word: Word,
  alphabet: Alphabet,
  length: number
): Correction {
  const operations: EditOperation[] = [];

  for (let index = 0; index < word.length; index++) {
    const currentToken = word[index];
    operations.push(new Deletion(currentToken, index));
    for (const symb of alphabet) {
      operations.push(new Insertion(symb, index));
      operations.push(new Replacement(currentToken, symb, index));
    }
  }
  return new Correction(operations);
}
