import {Word} from '../src/model';
import {Deletion, Insertion, Replacement} from '../src/model/EditOperation';

describe('Edit Operations', () => {
  test('Insertion', () => {
    const word: Word = 'ne';
    const delOperation = new Insertion('', 'w', 2);

    expect(delOperation.apply(word)).toBe('new');
  });
  test('Insertion - Insert at negative index', () => {
    const func = () => {
      const word: Word = 'ne';
      const insertionOperation = new Insertion('', 'w', -1);
      insertionOperation.apply(word);
    };
    expect(func).toThrow(RangeError);
    expect(func).toThrow('Index -1 is out of range');
  });
  test('Insertion - Insert at too large index', () => {
    const func = () => {
      const word: Word = 'ne';
      const insertionOperation = new Insertion('', 'w', 3);
      insertionOperation.apply(word);
    };
    expect(func).toThrow(RangeError);
    expect(func).toThrow('Index 3 is out of range');
  });
  test('Deletion', () => {
    const word: Word = 'new';
    const delOperation = new Deletion('w', '', 2);

    expect(delOperation.apply(word)).toBe('ne');
  });
  test('Deletion - Delete at negative index', () => {
    const func = () => {
      const word: Word = 'ne';
      const delOperation = new Deletion('', 'w', -1);
      delOperation.apply(word);
    };
    expect(func).toThrow(RangeError);
    expect(func).toThrow('Index -1 is out of range');
  });
  test('Deletion - Deletion character mismatch', () => {
    const func = () => {
      const word: Word = 'new';
      const delOperation = new Deletion('a', '', 2);
      delOperation.apply(word);
    };
    expect(func).toThrow(Error);
    expect(func).toThrow('Found w at index 2, but expected a');
  });
  test('Replacement', () => {
    const word: Word = 'new';
    const delOperation = new Replacement('w', 'a', 2);

    expect(delOperation.apply(word)).toBe('nea');
  });
  test('Replacement - Append after last index', () => {
    const func = () => {
      const word: Word = 'new';
      const delOperation = new Replacement('w', 'a', 3);
      delOperation.apply(word);
    };

    expect(func).toThrow(RangeError);
  });
  test('Replacement - Replace at negative index', () => {
    const func = () => {
      const word: Word = 'new';
      const delOperation = new Replacement('w', 'a', -1);
      delOperation.apply(word);
    };
    expect(func).toThrow(RangeError);
  });
  test('Replacement - Deletion character mismatch', () => {
    const func = () => {
      const word: Word = 'new';
      const delOperation = new Replacement('a', 'a', 2);
      delOperation.apply(word);
    };
    expect(func).toThrow(Error);
    expect(func).toThrow('Found w at index 2, but expected a');
  });
});
