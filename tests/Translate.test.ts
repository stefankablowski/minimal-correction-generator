import {decodeString} from '../src/translateGrammar';

describe('Context-Free Grammar', () => {
  test('reverse', () => {
    const lexicon: Map<string, string> = new Map([
      ['Apple', 'A'],
      ['Banana', 'B'],
      ['Citrus', 'C'],
    ]);
    const decodedString = decodeString('ABC', lexicon);
    expect(decodedString).toStrictEqual(['Apple', 'Banana', 'Citrus']);
  });
});
