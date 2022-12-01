import {
  translateGrammar,
  parseAndEncode,
  cfgtool,
  decodeString,
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
import {Grammar} from '../src/model/Grammar';

const grammar: Grammar = {
  rules: new Map([
    ['hypothesis', [['simple'], ['complex']]],
    ['simple', [['independentVariable', 'influences', 'dependentVariable']]],
    ['complex', [['simple', 'modal']]],
    ['modal', [[', but only', 'valueRange']]],
    ['independentVariable', [['Light'], ['Intensity'], ['Wavelength']]],
    [
      'dependentVariable',
      [
        ['plant growth'],
        ['stem length'],
        ['photosynthesis rate'],
        ['leaf color'],
      ],
    ],
    [
      'valueRange',
      [['up to 500nm'], ['from 500nm'], ['between 500 nm and 600 nm']],
    ],
  ]),
  terminals: [
    'plant growth',
    'stem length',
    'photosynthesis rate',
    'leaf color',
    'Light',
    'Intensity',
    'Wavelength',
    'up to 500nm',
    'from 500nm',
    'between 500 nm and 600 nm',
    'influences',
    ', but only',
  ],
  rootRule: 'hypothesis',
};

const lexicon = new Map<string, string>();

describe('Plant Grammar', () => {
  test.skip('Enumerate Language of Grammar', () => {
    const exprGrammar = translateGrammar(grammar, lexicon);
    const generatorFactory = cfgtool.generator;
    const generator = generatorFactory(exprGrammar);
    for (let index = 0; index < 30; index++) {
      const generatedString = generator(index);
      if (generatedString) {
        console.log(
          decodeString(generatedString, lexicon)
            .map(el => `"${el}"`)
            .join(',')
        );
      }
    }
  });

  test('tex grammar', () => {
    console.log(Grammar.toTex(grammar));
  });

  test('Leaf color influences synthesis rate', () => {
    const word = ['leaf color', 'influences', 'photosynthesis rate'];
    /*
    const word = ['leaf color', 'photosynthesis rate'];
    const word = ['leaf color'];
    const word = ['Light', 'leaf color'];
    const word = ['Light', 'influences', 'leaf color'];

    const word = ['leaf color', 'influences', 'photosynthesis rate'];
    const word = ['leaf color', 'influences'];
    const word = ['Light', 'leaf color', 'influences'];
    const word = ['Light', 'influences', 'leaf color', 'influences'];
    const word = ['Light', 'influences', 'leaf color'];
 */
    //Expect Insertions left and right
    // generateMinimalCorrectionsForWord(word, grammar, 2);
  });

  test('Light influences', () => {
    const word = ['Light', 'influences'];

    generateMinimalCorrectionsForWord(word, grammar, 3); //1000 ms
    // generateMinimalCorrectionsForWord(word, grammar, 1); //50 ms
  });

  test('Light influences plant growth , but only', () => {
    const word = ['Light', 'influences', 'plant growth', ', but only'];

    generateMinimalCorrectionsForWord(word, grammar, 2);
  });

  test('Light influences Wavelength , but only', () => {
    const word = ['Light', 'influences', 'Wavelength', ', but only'];

    generateMinimalCorrectionsForWord(word, grammar, 3);
  });

  test('Light Wavelength influences plant growth', () => {
    const word = ['Light', 'Wavelength', 'influences', 'plant growth'];

    generateMinimalCorrectionsForWord(word, grammar, 2);
  });
});
