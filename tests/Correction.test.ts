import {Word} from '../src/model';
import {Insertion} from '../src/model/EditOperation';
import {Correction} from '../src/model/EditOperation/Correction';
import {EditOperation} from '../src/model/EditOperation/EditOperation';

describe('Corrections', () => {
  test('Insert multiple symbols', () => {
    const word: Word = 'ne';
    const operations: EditOperation[] = [
      new Insertion('', 'r', 2),
      new Insertion('', 'e', 2),
      new Insertion('', 'w', 2),
    ];
    const correction: Correction = new Correction(operations);
    expect(correction.apply(word)).toBe('newer');
  });
});
