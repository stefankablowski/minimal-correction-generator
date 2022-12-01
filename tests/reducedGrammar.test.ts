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

describe('generateCorrections', () => {
  test.skip('Reduced Grammar', () => {
    const grammar: Grammar = {
      rules: new Map([
        ['hypothesis', [['simple'], ['complex']]],
        [
          'simple',
          [['independentVariable', 'influences', 'dependentVariable']],
        ],
        ['complex', [['simple', 'modal']]],
        ['modal', [[', but only', 'valueRange']]],
        ['independentVariable', [['Temperature'], ['Heat'], ['Cold']]],
        [
          'dependentVariable',
          [
            ['yeast activity'],
            ['the pizza dough'],
            ['the yeast'],
            ['the enzyme'],
            ['enzyme activity'],
          ],
        ],
        [
          'valueRange',
          [
            ['up to 20 degrees'],
            ['from 20 degrees'],
            ['between 20 degrees and 40 degrees'],
          ],
        ],
      ]),
      terminals: [
        'yeast activity',
        'the pizza dough',
        'the yeast',
        'the enzyme',
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
    const word = ['the enzyme', 'influences', 'the yeast'];
    /*
    const word = ['the enzyme', 'the yeast'];
    const word = ['the enzyme'];
    const word = ['Temperature', 'the enzyme'];
    const word = ['Temperature', 'influences', 'the enzyme'];

    const word = ['the enzyme', 'influences', 'the yeast'];
    const word = ['the enzyme', 'influences'];
    const word = ['Temperature', 'the enzyme', 'influences'];
    const word = ['Temperature', 'influences', 'the enzyme', 'influences'];
    const word = ['Temperature', 'influences', 'the enzyme'];
 */
    //Expect Insertions left and right
    // generateMinimalCorrectionsForWord(word, grammar, 2);

    // console.log(Grammar.toTex(grammar));
  });
});
