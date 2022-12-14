/**
 * This file handles the optimized generation of corrections in a (canonical) normal form where indices are non-descending and deletions precede all insertions.
 */
import {Word} from './model';
import {Alphabet} from './model/Alphabet';
import {Deletion, Insertion, Replacement} from './model/EditOperation';
import {Correction} from './model/EditOperation/Correction';
import {EditOperation} from './model/EditOperation/EditOperation';
import {EmptyOperation} from './model/EditOperation/EmptyOperation';
import {Grammar} from './model/Grammar';
import {
  parseAndEncode,
  parseTreeContainsParses,
  translateGrammar,
} from './translateGrammar';
import {minimizable} from './minimize';
import {partition} from './util';
import {validateCorrections} from './validateCorrections';
import {Cache} from './Cache';
import {texWord} from './model/Word';
import {log} from './log';

export function generateMinimalCorrectionsForWord(
  word: Word,
  grammar: {
    rules: Map<string, string[][]>;
    terminals: string[];
    rootRule: string;
  },
  iterations: number
) {
  log.debug(`\n ${texWord(word)}`);
  const lexicon = new Map<string, string>();
  const exprGrammar = translateGrammar(grammar, lexicon);
  const cache = new Cache<EditOperation[], boolean>();

  const minAndRemainingCorrections: [Correction[], Correction[]] =
    generateAllMinimalCorrections(word, grammar, true, iterations);
  let [minCorrections] = minAndRemainingCorrections;
  const [, remainingCorrections] = minAndRemainingCorrections;
  Correction.printCorrections(minCorrections, 'Candidates (p-minimal)');
  // Correction.texCorrections(minCorrections, 'Candidates (p-minimal)');

  minCorrections = validateCorrections(
    minCorrections,
    word,
    exprGrammar,
    lexicon,
    cache
  );
  Correction.printCorrections(minCorrections, 'Validated (a-minimal)');
  // Correction.texCorrections(minCorrections, 'Validated (a-minimal)');

  const fullCorrections = generateFullCorrections(
    remainingCorrections,
    grammar.terminals,
    word,
    lexicon,
    cache,
    exprGrammar,
    iterations
  );
  Correction.printCorrections(fullCorrections, 'Including Insertions');
  // Correction.texCorrections(fullCorrections, 'Including Insertions');
}

export function generateMinimalCorrectionsForOneWord(
  correctionLeadingToWord: Correction,
  exprGrammar: any,
  lexicon: Map<string, string>,
  terminals: string[],
  checkEmptyEditOperation: boolean,
  canonical: boolean
): [Correction[], Correction[]] {
  const {resultingWord: word} = correctionLeadingToWord;

  const operations: EditOperation[] = generateOperationsForWord(
    word,
    correctionLeadingToWord,
    terminals,
    canonical
  );

  if (checkEmptyEditOperation) {
    operations.push(new EmptyOperation());
  }

  const wordsWithOperation: [EditOperation, Word][] = applyOperationsToWord(
    operations,
    word
  );

  const [localMinCorr, remainingCorrections] = checkWordProblemForWords(
    wordsWithOperation,
    exprGrammar,
    lexicon
  );

  const resultMin = localMinCorr.map(([eop, word]) =>
    correctionLeadingToWord.extendByOperation(eop, word, canonical)
  );
  let resultRemain = remainingCorrections.map(([eop, word]) =>
    correctionLeadingToWord.extendByOperation(eop, word, canonical)
  );

  /* Prevent generation of corrections with an EmptyOperation as Prefix */
  if (checkEmptyEditOperation) {
    const filtered = resultMin.filter(c => c.isEmpty());
    if (filtered.length > 0) {
      return [[], filtered];
    } else {
      resultRemain = resultRemain.filter(c => !c.isEmpty());
    }
  }

  return [resultRemain, resultMin];
}

export function generateAllMinimalCorrections(
  word: Word,
  grammar: Grammar,
  canonical = false,
  iterations = 1
): [Correction[], Correction[]] {
  const lexicon = new Map<string, string>();
  const exprGrammar = translateGrammar(grammar, lexicon);
  let minimalCorrections: Correction[] = [];
  const correctionLeadingToWord = new Correction();
  correctionLeadingToWord.resultingWord = word;
  correctionLeadingToWord.consumedIndices = Array.from(
    {length: word.length},
    () => false
  );
  const allRemainingPrefixes: Correction[] = [];
  let remainingCorrections: Correction[] = [correctionLeadingToWord];
  let remainingCorrectionsForNextIteration: Correction[] = [];
  /* Cutoff */
  let checkEmptyEditOperation = true;

  while (remainingCorrections.length > 0 && iterations > 0) {
    for (const corr of remainingCorrections) {
      const [currentRemainCorrections, currentMinCorrections] =
        generateMinimalCorrectionsForOneWord(
          corr,
          exprGrammar,
          lexicon,
          grammar.terminals,
          checkEmptyEditOperation,
          canonical
        );
      checkEmptyEditOperation = false;
      remainingCorrectionsForNextIteration = [
        ...remainingCorrectionsForNextIteration,
        ...currentRemainCorrections,
      ];
      minimalCorrections = [...currentMinCorrections, ...minimalCorrections];
    }
    allRemainingPrefixes.push(...remainingCorrectionsForNextIteration);
    remainingCorrections = remainingCorrectionsForNextIteration;
    remainingCorrectionsForNextIteration = [];
    iterations--;
  }

  const [minimizableCorrections, nonMinimizableCorrections] = partition(
    minimalCorrections,
    corr => {
      return minimizable(corr);
    }
  );
  // Correction.printCorrections(minimizableCorrections, 'Minimizable are');
  // Correction.texCorrections(minimizableCorrections, 'Minimizable are');

  return [nonMinimizableCorrections, allRemainingPrefixes];
}

export function checkWordProblemForWords(
  wordsWithOperation: [EditOperation, Word][],
  exprGrammar: any,
  lexicon: Map<string, string>
): [minimal: [EditOperation, Word][], remaining: [EditOperation, Word][]] {
  const minimal: [EditOperation, Word][] = [];
  const remaining: [EditOperation, Word][] = [];

  wordsWithOperation.forEach(([op, word]) => {
    const parseTree = parseAndEncode(lexicon, exprGrammar, word);
    if (parseTreeContainsParses(parseTree)) {
      minimal.push([op, word]);
    } else {
      remaining.push([op, word]);
    }
  });
  return [minimal, remaining];
}

export function generateOperationsForWord(
  word: Word,
  correction: Correction,
  alphabet: Alphabet,
  canonical = false
): EditOperation[] {
  if (canonical) {
    const {
      consumedIndices,
      transitionIndex,
      operations: previousOperations,
    } = correction;

    const transitionToReplacementsOcccured =
      transitionIndex !== Correction.TR_INDEX_DEFAULT;

    return generateOperationsForWordCanonical(
      word,
      consumedIndices,
      alphabet,
      previousOperations,
      transitionToReplacementsOcccured
    );
  } else {
    const {consumedIndices} = correction;
    return generateOperationsForWordGeneral(word, consumedIndices, alphabet);
  }
}

export function generateFullCorrections(
  remainingCorrections: Correction[],
  alphabet: string[],
  inputWord: Word,
  lexicon: Map<string, string>,
  cache: Cache<EditOperation[], boolean>,
  exprGrammar: any,
  iterations = 1
) {
  const allRemaining: Correction[] = [];

  /* Also consider corrections without prior deletions or replacements. Only add them once! */
  const newCorrection = new Correction();
  newCorrection.resultingWord = inputWord;
  remainingCorrections.push(newCorrection);

  //TODO optimization possible: unpack these from all prefixes of minimal corrections
  let correctionsForNextIteration: Correction[] = remainingCorrections;
  for (let i = 0; i < iterations; i++) {
    const correctionsForNextIterationBuffer: Correction[] = [];
    for (const corr of correctionsForNextIteration) {
      const insertionCandidates = generateInsertionsForWord(corr, alphabet);

      const wordsWithOperation: [EditOperation, Word][] =
        insertionCandidates.map(ins => [ins, ins.apply(corr.resultingWord)]);

      const [
        wordsWithOperationMatchingGrammar,
        wordsWithOperationNotMatchingGrammar,
      ]: [true: [EditOperation, Word][], false: [EditOperation, Word][]] =
        checkWordProblemForWords(wordsWithOperation, exprGrammar, lexicon);

      const extendedMatchingCorrections = wordsWithOperationMatchingGrammar.map(
        ([ins, word]: [EditOperation, Word]) => {
          const resultingWord = ins.apply(corr.resultingWord);
          return corr.extendByOperation(ins, resultingWord);
        }
      );
      const extendedNotMatchingCorrections =
        wordsWithOperationNotMatchingGrammar.map(
          ([ins, word]: [EditOperation, Word]) => {
            const resultingWord = ins.apply(corr.resultingWord);
            return corr.extendByOperation(ins, resultingWord);
          }
        );
      correctionsForNextIterationBuffer.push(...extendedNotMatchingCorrections);
      allRemaining.push(...extendedMatchingCorrections);
    }
    correctionsForNextIteration = correctionsForNextIterationBuffer;
  }

  return validateCorrections(
    allRemaining,
    inputWord,
    exprGrammar,
    lexicon,
    cache
  );
}

/**
 * @returns a list of insertions for every index of the word that the correction leads to and for every alphabet symbol
 */
export function generateInsertionsForWord(
  correction: Correction,
  alphabet: Alphabet
) {
  const {resultingWord}: Correction = correction;
  const insertions: Insertion[] = [];
  for (let index = 0; index <= resultingWord.length; index++) {
    for (const alphSymbol of alphabet) {
      insertions.push(new Insertion(alphSymbol, index));
    }
  }
  return insertions;
}

/**
 *  Generate deletion and replacement operations on non-interfering indices of the given word, such that the requirements of the normal form are met:
 * - all deletions first, then all replacements
 * - indices of deletions are non-descending
 * - indices of replacements are ascending
 */
export function generateOperationsForWordCanonical(
  word: Word,
  consumedIndices: boolean[],
  alphabet: Alphabet,
  previousOperations: EditOperation[],
  transitionToReplacementsOcccured: boolean
) {
  const indexOfPrevOperation: number = previousOperations.length - 1;
  const prevOperation: EditOperation = previousOperations[indexOfPrevOperation];

  const determinePreviousOperationIndex = (
    prevOperation: EditOperation
  ): number => {
    return prevOperation !== undefined
      ? prevOperation.index
      : Correction.TR_INDEX_DEFAULT;
  };
  const indexNotDescending = (i: number) => previousOperationIndex <= i;
  /* When tansitioning from Deletion to Replacement, the Ascending condition is ignored */
  const indexAscending = (i: number): boolean => {
    if (prevOperation === undefined) return true;
    return prevOperation === undefined || prevOperation.isDeletion()
      ? true
      : previousOperationIndex < i;
  };

  const symbolDiffersFrom = (symbol: string, currentSymbol: string) =>
    symbol !== currentSymbol;
  const indexConsumed = (i: number) => consumedIndices[i];

  const previousOperationIndex = determinePreviousOperationIndex(prevOperation);
  const potentialOperations: EditOperation[] = [];

  for (let index = 0; index < word.length; index++) {
    const currentSymbolInWord = word[index];
    if (indexConsumed(index)) continue;
    if (!transitionToReplacementsOcccured && indexNotDescending(index)) {
      potentialOperations.push(new Deletion(currentSymbolInWord, index));
    }
    if (!indexAscending(index)) continue;
    for (const alphSymbol of alphabet) {
      if (symbolDiffersFrom(currentSymbolInWord, alphSymbol)) {
        potentialOperations.push(
          new Replacement(currentSymbolInWord, alphSymbol, index)
        );
      }
    }
  }
  return potentialOperations;
}

/**
 * Generate deletion and replacement operations on all non-interfering indices of the given word
 * @param word
 * @param alphabet
 * @param transitionIndex of the correction leading to the word
 * @param canonical
 * @returns
 */
export function generateOperationsForWordGeneral(
  word: Word,
  consumedIndices: boolean[],
  alphabet: Alphabet
): EditOperation[] {
  const operations: EditOperation[] = [];

  for (let index = 0; index < word.length; index++) {
    if (consumedIndices[index]) continue;
    const currentSymbol = word[index];
    operations.push(new Deletion(currentSymbol, index));

    for (const symb of alphabet) {
      // operations.push(new Insertion(symb, index));
      if (symb !== currentSymbol) {
        operations.push(new Replacement(currentSymbol, symb, index));
      }
    }
  }
  return operations;
}

/**
 * Generate
 * @returns a pair of the operation and the result of its application on the word
 */
export function applyOperationsToWord(
  operations: EditOperation[],
  word: Word
): [EditOperation, Word][] {
  return operations.map(op => [op, op.apply(word)]);
}

export function sortOperationsByType(
  operations: EditOperation[]
): EditOperation[] {
  const insertions = operations.filter(op => op instanceof Insertion);
  const replacements = operations.filter(op => op instanceof Replacement);
  const deletions = operations.filter(op => op instanceof Deletion);
  return [...insertions, ...replacements, ...deletions];
}
