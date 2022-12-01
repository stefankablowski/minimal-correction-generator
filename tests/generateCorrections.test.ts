import {
  translateGrammar,
  parseAndEncode,
  cfgtool,
} from '../src/translateGrammar';
import {
  applyOperationsToWord,
  sortOperationsByType,
  generateAllMinimalCorrections,
  generateOperationsForWordGeneral,
  generateMinimalCorrectionsForWord,
} from '../src/generateCorrections';
import {Correction} from '../src/model/EditOperation/Correction';
import {EditOperation} from '../src/model/EditOperation/EditOperation';
import {Word} from '../src/model/Word';
import {EmptyOperation} from '../src/model/EditOperation';

describe('generateCorrections', () => {
  test('Correction Biogrammar', () => {
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

    // Die Wärme beeinflusst die Hefe
    const sentence1 = [
      'der|die|das|den',
      'Waerme',
      'beeinflusst',
      'der|die|das|den',
      'Hefe',
    ];

    // Höhere Wärme beeinflust die Hefeaktivität besser als weniger Wärme
    const sentence2 = [
      'hoeher|e',
      'Waerme',
      'beeinflusst',
      'der|die|das|den',
      'Hefeaktivitaet',
      'besser als',
      'weniger',
      'Waerme',
    ];
    expect(
      parseAndEncode(lexicon, exprGrammar, sentence1).length > 0
    ).toBeTruthy();
    expect(
      parseAndEncode(lexicon, exprGrammar, sentence2).length > 0
    ).toBeTruthy();

    exprGrammar;
    const generatorFactory = cfgtool.generator;
    const generator = generatorFactory(exprGrammar);
    for (let index = 0; index < 30; index++) {
      const generatedString = generator(index);
      if (generatedString) {
        // console.log(decodeString(generatedString, lexicon).join(','));
      }
    }

    const sentence3 = [
      'der|die|das|den',
      'Waerme',
      'beeinflusst',
      'der|die|das|den',
      'Hefeaktivitaet',
      ', aber nur',
      'von 20 Grad bis 40 Grad',
    ];
    const sentence3faulty = [
      'der|die|das|den',
      'Waerme',
      'beeinflusst',
      'der|die|das|den',
      'Hefeaktivitaet',
      'von 20 Grad bis 40 Grad',
    ];

    // generateMinimalCorrectionsForWord(sentence3faulty, grammar, 2);
    // generateMinimalCorrectionsForWord(sentence3faulty, grammar, 2);
    // generateMinimalCorrectionsForWord(sentence3faulty, grammar, 3);
  });
});
test('Apple-Banana-Grammar', () => {
  const grammar = {
    rules: new Map([
      ['S', [['E']]],
      ['E', [['E', '+', 'E'], ['Apple'], ['Banana']]],
    ]),
    terminals: ['Banana', 'Apple', '+'],
    rootRule: 'S',
  };

  const word = ['Banana', '+', 'Apple'];
  const operations: EditOperation[] = generateOperationsForWordGeneral(
    word,
    [false, false, false],
    grammar.terminals
  );

  expect(sortOperationsByType(operations)).toMatchObject([
    {
      deleteSymbol: 'Banana',
      insertSymbol: 'Apple',
      index: 0,
    },
    {deleteSymbol: 'Banana', insertSymbol: '+', index: 0},
    {deleteSymbol: '+', insertSymbol: 'Banana', index: 1},
    {deleteSymbol: '+', insertSymbol: 'Apple', index: 1},
    {
      deleteSymbol: 'Apple',
      insertSymbol: 'Banana',
      index: 2,
    },
    {deleteSymbol: 'Apple', insertSymbol: '+', index: 2},
    {deleteSymbol: 'Banana', insertSymbol: '', index: 0},
    {deleteSymbol: '+', insertSymbol: '', index: 1},
    {deleteSymbol: 'Apple', insertSymbol: '', index: 2},
  ]);

  //TODO Write Test
  const words: [EditOperation, Word][] = applyOperationsToWord(
    operations,
    word
  );

  const [minCorrOnlyEmpty]: [Correction[], Correction[]] =
    generateAllMinimalCorrections(word, grammar, true);
  const c1 = new Correction([new EmptyOperation()]);
  c1.resultingWord = word;
  c1.consumedIndices = [false, false, false];
  expect(minCorrOnlyEmpty).toStrictEqual([c1] as Correction[]);

  const word2 = ['Banana', '+', '+', 'Apple'];
  const word3 = ['Banana', 'Apple', 'Banana'];
  const word4 = ['+'];
  //Expect Insertions left and right
  // generateMinimalCorrectionsForWord(word4, grammar, 2);
});
