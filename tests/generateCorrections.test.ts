import {translateGrammar, parseAndEncode} from '../src/translateGrammar';
import {
  generateOperationsForWord,
  applyOperationsToWord,
  sortOperationsByType,
  checkWordProblemForWords,
  generateAllMinimalCorrections,
} from '../src/generateCorrections';
import {Correction} from '../src/model/EditOperation/Correction';
import {EditOperation} from '../src/model/EditOperation/EditOperation';
import {Word} from '../src/model/Word';
import {Deletion, Insertion, Replacement} from '../src/model/EditOperation';

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
  const lexicon = new Map<string, string>();
  const exprGrammar = translateGrammar(grammar, lexicon);

  const word = ['Banana', '+', 'Apple'];
  const operations: EditOperation[] = generateOperationsForWord(
    word,
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

  const words: [EditOperation, Word][] = applyOperationsToWord(
    operations,
    word
  );
  const [minimal, remaining] = checkWordProblemForWords(words, grammar);

  generateAllMinimalCorrections(word, grammar);
  console.log(minimal);
  console.log('---');
  console.log(remaining);
});
