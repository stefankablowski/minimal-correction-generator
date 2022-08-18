import {
  translateGrammar,
  parseAndEncode,
  cfgtool,
  decodeString,
} from '../src/translate';

describe('Context-Free Grammar', () => {
  test('1(+1)*', () => {
    const grammar = {
      rules: new Map([
        ['S', [['E']]],
        ['E', [['E', '+', 'E'], ['1']]],
      ]),
      terminals: ['1', '+'],
      rootRule: 'S',
    };
    const lexicon = new Map<string, string>();
    const exprGrammar = translateGrammar(grammar, lexicon);

    expect(
      parseAndEncode(lexicon, exprGrammar, [...'1+1+1+1+1+1+1']).length > 0
    ).toBeTruthy();
    expect(
      parseAndEncode(lexicon, exprGrammar, [...'1+']).length > 0
    ).toBeFalsy();
  });
  test('(Banana|Apple)(+Banana|Apple)*', () => {
    const grammar = {
      rules: new Map([
        ['S', [['E']]],
        ['E', [['E', '+', 'E'], ['Apple'], ['Banana']]],
      ]),
      terminals: ['Banana', 'Apple', '+'],
      rootRule: 'S',
    };
    const lexicon = new Map<string, string>();
    const exprGrammar = translateGrammar(grammar, lexicon);

    const generatorFactory = cfgtool.generator;
    const generator = generatorFactory(exprGrammar);
    console.log(decodeString(generator(13), lexicon));

    expect(
      parseAndEncode(lexicon, exprGrammar, [
        'Banana',
        '+',
        'Apple',
        '+',
        'Banana',
      ]).length > 0
    ).toBeTruthy();
    expect(
      parseAndEncode(lexicon, exprGrammar, ['Banana+Pear']).length > 0
    ).toBeFalsy();
  });
  test('Bio Grammar', () => {
    const grammar = {
      rules: new Map([
        ['S', [['EE']]],
        ['EE', [['EE', '+', 'EE'], ['AA'], ['BB']]],
      ]),
      terminals: ['BB', 'AA', '+'],
      rootRule: 'S',
    };
    const lexicon = new Map<string, string>();
    const exprGrammar = translateGrammar(grammar, lexicon);

    const generatorFactory = cfgtool.generator;
    const generator = generatorFactory(exprGrammar);
    // console.log(generator(21));

    expect(
      parseAndEncode(lexicon, exprGrammar, ['BB', '+', 'AA']).length > 0
    ).toBeTruthy();
  });
});
