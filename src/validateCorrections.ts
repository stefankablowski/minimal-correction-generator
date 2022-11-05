/**
 * This file provides a function to check whether generated correction candidates (possibly minimal) are actually minimal. All permutations and all prefixes of these permutations are tested against the input word and grammar.
 */
import {Cache} from './Cache';
import {log} from './log';
import {Word} from './model';
import {Correction, EditOperation} from './model/EditOperation';
import {Grammar} from './model/Grammar';
import {generatePermutationTyped, PermutationObject} from './PermutationObject';
import {
  parseAndEncode,
  parseTreeContainsParses,
  translateGrammar,
} from './translateGrammar';

export function correctionSwapFunction(
  index1: number,
  index2: number,
  oldArray: PermutationObject<Correction>
) {
  const minIndex = index1 < index2 ? index1 : index2;
  return (oldArray as Correction).swap(minIndex);
}

/**
 * @returns only those of the given corrections that are actually minimal (a-minimal), i.e. dont have a permutation of which a true prefix exists (the permutation itself is excluded) whose application on the input word matches the language
 */
export function validateCorrections(
  corrections: Correction[],
  inputWord: Word,
  exprGrammar: any,
  lexicon: Map<string, string>,
  cache: Cache<EditOperation[], boolean>
): Correction[] {
  const sortedOutIndices: number[] = [];
  cFor: for (const c of corrections) {
    for (const permutation of generatePermutationTyped<Correction>(
      c,
      c.operations.length,
      correctionSwapFunction
    )) {
      // console.log(permutation.toString());
      const simplifiable = Correction.simplifiable(
        (permutation as Correction).operations
      );

      for (const prefix of (permutation as Correction).iterateTruePrefixes()) {
        const resultingWord = Correction.apply(
          prefix as EditOperation[],
          inputWord
        );
        const parseResult: boolean = parseOrLoadFromCache(
          prefix,
          cache,
          resultingWord,
          exprGrammar,
          lexicon
        );

        const correctionIsNotAminimal = parseResult || simplifiable;

        if (correctionIsNotAminimal) {
          sortedOutIndices.push(corrections.indexOf(c), 1);
          log.silly(
            `Omitting ${c.toString()},\nbecause prefix ${new Correction(
              prefix as EditOperation[]
            ).toString()} matches grammar or is simplifiable`
          );
          continue cFor;
        }
      }
    }
  }

  return corrections.filter((elem, index) => !sortedOutIndices.includes(index));
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
