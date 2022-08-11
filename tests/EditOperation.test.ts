import {Word} from '../src/model';
import {Deletion, Insertion, Replacement} from '../src/model/EditOperation';

describe('Edit Operations', () => {
  test('Deletion', () => {
    const word: Word = 'new neighbour';
    const delOperation = new Deletion('w', '', 2);

    expect(delOperation.apply(word)).toBe('ne neighbour');
  });
  test('Insertion', () => {
    const word: Word = 'ne neighbour';
    const delOperation = new Insertion('', 'w', 2);

    expect(delOperation.apply(word)).toBe('new neighbour');
  });
  test('Replacement', () => {
    const word: Word = 'new neighbour';
    const delOperation = new Replacement('w', 'a', 2);

    expect(delOperation.apply(word)).toBe('nea neighbour');
  });
});
