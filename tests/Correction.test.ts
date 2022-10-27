import {Word, createWord} from '../src/model';
import {Deletion, Insertion, Replacement} from '../src/model/EditOperation';
import {Correction} from '../src/model/EditOperation/Correction';
import {EditOperation} from '../src/model/EditOperation/EditOperation';

describe('Corrections', () => {
  test('Insert multiple symbols', () => {
    const word: Word = createWord('ne');
    const operations: EditOperation[] = [
      new Insertion('r', 2),
      new Insertion('e', 2),
      new Insertion('w', 2),
    ];
    const correction: Correction = new Correction(operations);
    expect(correction.apply(word)).toStrictEqual(createWord('newer'));
  });
  test('Insert and delete', () => {
    const word: Word = createWord('ne');
    const operations: EditOperation[] = [
      new Insertion('w', 2),
      new Deletion('w', 2),
    ];
    const correction: Correction = new Correction(operations);
    expect(correction.apply(word)).toStrictEqual(createWord('ne'));
  });
  test('Insert and replace', () => {
    const word: Word = createWord('ne');
    const operations: EditOperation[] = [
      new Insertion('w', 2),
      new Replacement('w', 'a', 2),
    ];
    const correction: Correction = new Correction(operations);
    expect(correction.apply(word)).toStrictEqual(createWord('nea'));
  });
  test('Delete whole word', () => {
    const word: Word = createWord('new');
    const operations: EditOperation[] = [
      new Deletion('n', 0),
      new Deletion('e', 0),
      new Deletion('w', 0),
    ];
    const correction: Correction = new Correction(operations);
    expect(correction.apply(word).length).toStrictEqual(0);
  });
  test('Correction', () => {
    const word: Word = createWord('new');
    const operations: EditOperation[] = [
      new Deletion('n', 0),
      new Deletion('e', 0),
      new Deletion('w', 0),
    ];
    const correction: Correction = new Correction(operations);
    const extended = correction.extendByOperation(
      new Insertion('n', 0),
      createWord('n')
    );
    operations.push(new Insertion('n', 0));
    correction.resultingWord = createWord('n');

    expect(extended).toStrictEqual(correction);
  });
  test('Comparable', () => {
    const c1 = new Correction([
      new Deletion('n', 0),
      new Deletion('e', 0),
      new Deletion('w', 0),
    ]);
    const c2 = new Correction([
      new Deletion('n', 0),
      new Deletion('e', 0),
      new Deletion('w', 0),
    ]);
    expect(c1.equals(c2)).toBe(true);
    const c3 = new Correction([
      new Insertion('n', 0),
      new Deletion('e', 0),
      new Deletion('w', 0),
    ]);
    expect(c1.equals(c3)).toBe(false);
  });
  test('Not Simplifiable', () => {
    const c1 = new Correction([
      new Deletion('n', 0),
      new Deletion('e', 0),
      new Deletion('w', 0),
    ]);
    const c2 = new Correction([
      new Deletion('n', 0),
      new Deletion('e', 0),
      new Deletion('w', 0),
    ]);

    expect(c1.simplify().equals(c2)).toBe(true);
    expect(Correction.simplifiable(c1.operations)).toBe(false);
  });
  test('Simplifiable to empty ()', () => {
    const c1 = new Correction([new Insertion('n', 0), new Deletion('n', 0)]);
    const c2 = c1.simplify();
    const c3 = new Correction([]);
    expect(c2).toEqual(c3);
    expect(c2.equals(c3)).toBe(true);
    expect(Correction.simplifiable(c1.operations)).toBe(true);
    expect(Correction.simplifiable(c3.operations)).toBe(false);
  });
});
