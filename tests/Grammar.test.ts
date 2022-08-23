import {
  translateGrammar,
  parseAndEncode,
  cfgtool,
  decodeString,
} from '../src/translateGrammar';

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
    // console.log(decodeString(generator(13), lexicon));

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
        ['hypothese', [['einfach'], ['komplex']]],
        ['einfach', [['unspezifisch'], ['spezifisch'], ['konditional']]],
        ['komplex', [['einfach', 'modal'], ['vergleich']]],

        [
          'unspezifisch',
          [
            [
              'der|die|das|den',
              'unspezvariable',
              'unspezabhaengigkeit',
              'der|die|das|den',
              'unspezvariable',
            ],
          ],
        ],
        [
          'spezifisch',
          [
            [
              'der|die|das|den',
              'unspezvariable',
              'spezabhaengigkeit',
              'spezAdjektiv',
              'bei',
              'unspezvariable',
            ],
            [
              'bei',
              'Adjektiv',
              'unspezvariable',
              'spezabhaengigkeit',
              'der|die|das|den',
              'unspezvariable',
            ],
            [
              'bei',
              'spezUV',
              'spezabhaengigkeit',
              'der|die|das|den',
              'unspezvariable',
              'spezAdjektiv',
            ],
            [
              'der|die|das|den',
              'unspezvariable',
              'spezabhaengigkeit',
              'spezAdjektiv',
              'bei',
              'spezUV',
            ],
          ],
        ],
        [
          'konditional',
          [
            [
              'wenn',
              'der|die|das|den',
              'unspezvariable',
              'AdjektivStar',
              'spezabhaengigkeit',
              ', dann',
              'spezabhaengigkeit',
              'der|die|das|den',
              'unspezvariable',
              'spezAdjektiv',
            ],
            [
              'je',
              'Adjektiv',
              'der|die|das|den',
              'unspezvariable',
              'spezabhaengigkeit',
              ', desto',
              'Adjektiv',
              'spezabhaengigkeit',
              'der|die|das|den',
              'unspezvariable',
            ],
          ],
        ],
        ['modal', [[', aber nur', 'Wertebereich']]],
        [
          'vergleich',
          [
            [
              'Adjektiv',
              'unspezvariable',
              'unspezabhaengigkeit',
              'der|die|das|den',
              'unspezvariable',
              'vergleichsOp',
              'Adjektiv',
              'unspezvariable',
            ],
            [
              'der|die|das|den',
              'unspezAV',
              'spezabhaengigkeit',
              'bei',
              'spezUV',
              'vergleichsOp',
              'bei',
              'spezUV',
            ],
          ],
        ],

        ['unspezvariable', [['unspezAV'], ['unspezUV']]],

        [
          'unspezAV',
          [
            ['Hefeaktivitaet'],
            ['Pizzateig'],
            ['Hefe'],
            ['Enzyme'],
            ['Enzymaktivitaet'],
          ],
        ],
        ['unspezUV', [['Temperatur'], ['Waerme'], ['Kaelte']]],
        ['spezUV', [['20 Grad'], ['0 Grad']]],
        ['unspezabhaengigkeit', [['beeinflusst']]],
        ['spezabhaengigkeit', [['steigt'], ['fällt'], ['arbeitet']]],
        ['Adjektiv', [['mehr'], ['weniger'], ['hoeher|e'], ['niedriger|e']]],
        ['spezAdjektiv ', [['langsamer'], ['schneller']]],

        ['AdjektivStar', [['spezAdjektiv'], ['Adjektiv']]],
        ['vergleichsOp', [['besser als']]],
        [
          'Wertebereich',
          [['von 20 Grad'], ['ab 20 Grad'], ['von 20 Grad bis 40 Grad']],
        ],
      ]),
      terminals: [
        'von 20 Grad',
        'ab 20 Grad',
        'von 20 Grad bis 40 Grad',
        'besser als',
        'langsamer',
        'schneller',
        'niedriger|e',
        'hoeher|e',
        'mehr',
        'weniger',
        'hoeher|e',
        'niedriger|e',
        'steigt',
        'fällt',
        'arbeitet',
        'beeinflusst',
        '0 Grad',
        '20 Grad',
        '0 Grad',
        'Hefeaktivitaet',
        'Pizzateig',
        'Hefe',
        'Enzyme',
        'Enzymaktivitaet',
        'bei',
        'der|die|das|den',
        'je',
        ', dann',
        ', desto',
        'Temperatur',
        'Waerme',
        'Kaelte',
        ', aber nur',
      ],
      rootRule: 'S',
    };
    const lexicon = new Map<string, string>();
    const exprGrammar = translateGrammar(grammar, lexicon);
    const generatorFactory = cfgtool.generator;
    const generator = generatorFactory(exprGrammar);
    for (let index = 0; index < 30; index++) {
      const generatedString = generator(index);
      // if (generatedString)
      // console.log(decodeString(generatedString, lexicon).join(' '));
    }

    // expect(
    //   parseAndEncode(lexicon, exprGrammar, ['BB', '+', 'AA']).length > 0
    // ).toBeTruthy();
  });
});
