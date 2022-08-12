import {Word} from '../src/model';
import {Deletion, Insertion, Replacement} from '../src/model/EditOperation';
import {Correction} from '../src/model/EditOperation/Correction';
import {EditOperation} from '../src/model/EditOperation/EditOperation';

describe('Corrections', () => {
  test('Insert multiple symbols', () => {
    const word: Word = 'ne';
    const operations: EditOperation[] = [
      new Insertion('r', 2),
      new Insertion('e', 2),
      new Insertion('w', 2),
    ];
    const correction: Correction = new Correction(operations);
    expect(correction.apply(word)).toBe('newer');
  });
  test('Insert and delete', () => {
    const word: Word = 'ne';
    const operations: EditOperation[] = [
      new Insertion('w', 2),
      new Deletion('w', 2),
    ];
    const correction: Correction = new Correction(operations);
    expect(correction.apply(word)).toBe('ne');
  });
  test('Insert and replace', () => {
    const word: Word = 'ne';
    const operations: EditOperation[] = [
      new Insertion('w', 2),
      new Replacement('w', 'a', 2),
    ];
    const correction: Correction = new Correction(operations);
    expect(correction.apply(word)).toBe('nea');
  });
  test('Delete whole word', () => {
    const word: Word = 'new';
    const operations: EditOperation[] = [
      new Deletion('n', 0),
      new Deletion('e', 0),
      new Deletion('w', 0),
    ];
    const correction: Correction = new Correction(operations);
    expect(correction.apply(word).length).toBe(0);
  });
});
