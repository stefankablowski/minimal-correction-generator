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

describe('generateCorrections', () => {
  test('Reduced Grammar', () => {
    const grammar = {
      rules: new Map([
        ['hypothesis', [['simple'], ['complex']]],
        ['simple', [['unspecific']]],
        ['complex', [['simple', 'modal']]],

        ['unspecific', [['unspezUV', 'unspecificdependency', 'unspezAV']]],

        ['modal', [[', but only', 'ValueRange']]],

        [
          'unspezAV',
          [
            ['yeast activity'],
            ['pizza dough'],
            ['yeast'],
            ['enzyme'],
            ['enzyme activity'],
          ],
        ],
        ['unspezUV', [['Temperature'], ['Heat'], ['Cold']]],
        ['spezUV', [['20 degrees'], ['0 degrees']]],
        ['unspecificdependency', [['influences']]],
        [
          'ValueRange',
          [
            ['up to 20 degrees'],
            ['from 20 degrees'],
            ['between 20 degrees and 40 degrees'],
          ],
        ],
      ]),
      terminals: [
        'yeast activity',
        'pizza dough',
        'yeast',
        'enzyme',
        'enzyme activity',
        'Temperature',
        'Heat',
        'Cold',
        'up to 20 degrees',
        'from 20 degrees',
        'between 20 degrees and 40 degrees',
        'influences',
        '0 degrees',
        '20 degrees',
        ', but only',
      ],
      rootRule: 'hypothesis',
    };

    const lexicon = new Map<string, string>();
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
    const word = ['enzyme', 'influences', 'yeast'];
    /*
    const word = ['enzyme', 'yeast'];
    const word = ['enzyme'];
    const word = ['Temperature', 'enzyme'];
    const word = ['Temperature', 'influences', 'enzyme'];

    const word = ['enzyme', 'influences', 'yeast'];
    const word = ['enzyme', 'influences'];
    const word = ['Temperature', 'enzyme', 'influences'];
    const word = ['Temperature', 'influences', 'enzyme', 'influences'];
    const word = ['Temperature', 'influences', 'enzyme'];
 */
    //Expect Insertions left and right
    generateMinimalCorrectionsForWord(word, grammar, 2);
  });
});
