import {Cache} from './Cache';
import {Word} from './model';
import {Correction, EditOperation} from './model/EditOperation';
import {Grammar} from './model/Grammar';
import {generatePermutationTyped, PermutationObject} from './PermutationObject';
import {
  parseAndEncode,
  parseTreeContainsParses,
  translateGrammar,
} from './translateGrammar';
import {Logger} from 'tslog';

const log: Logger = new Logger({minLevel: 'info'});

export function correctionSwapFunction(
  index1: number,
  index2: number,
  oldArray: PermutationObject<Correction>
) {
  const minIndex = index1 < index2 ? index1 : index2;
  return (oldArray as Correction).swap(minIndex);
}

export function startValidation(
  corrections: Correction[],
  inputWord: Word,
  grammar: Grammar
) {
  const cache = new Cache<EditOperation[], boolean>();
  const lexicon = new Map<string, string>();
  const exprGrammar = translateGrammar(grammar, lexicon);
  return validateCorrections(
    cache,
    corrections,
    inputWord,
    exprGrammar,
    lexicon
  );
}

function validateCorrections(
  cache: Cache<EditOperation[], boolean>,
  corrections: Correction[],
  inputWord: Word,
  exprGrammar: any,
  lexicon: Map<string, string>
): Correction[] {
  const validated = [...corrections];
  cFor: for (const c of corrections) {
    for (const permutation of generatePermutationTyped<Correction>(
      c,
      c.operations.length,
      correctionSwapFunction
    )) {
      const simplifiable = Correction.simplifiable(
        permutation as EditOperation[]
      );

      for (const prefix of (permutation as Correction).iteratePrefixes()) {
        const resultingWord = Correction.apply(
          prefix as EditOperation[],
          inputWord
        );
        const parseResult: boolean = parseOrLoadFromCache(
          permutation as EditOperation[],
          cache,
          resultingWord,
          exprGrammar,
          lexicon
        );

        const correctionIsNotAminimal = parseResult || simplifiable;

        if (correctionIsNotAminimal) {
          validated.splice(corrections.indexOf(c), 1);
          log.debug(
            `Omitting ${c.toString()} because prefix ${new Correction(
              prefix as EditOperation[]
            ).toString()} matches grammar or is simplifiable`
          );
          continue cFor;
        }
      }
    }
  }

  return validated;
}

function parseOrLoadFromCache(
  permutation: EditOperation[],
  cache: Cache<EditOperation[], boolean>,
  word: Word,
  exprGrammar: any,
  lexicon: Map<string, string>
): boolean {
  const cached = cache.get(permutation);
  if (cached !== undefined) {
    return cached;
  } else {
    const parseTree = parseAndEncode(lexicon, exprGrammar, word);
    const wordMatchesGrammar = parseTreeContainsParses(parseTree);
    cache.set(permutation, wordMatchesGrammar);
    return wordMatchesGrammar;
  }
}
