import {Word} from './model';
import {Alphabet} from './model/Alphabet';
import {Deletion, Insertion, Replacement} from './model/EditOperation';
import {Correction} from './model/EditOperation/Correction';
import {EditOperation} from './model/EditOperation/EditOperation';
import {EmptyOperation} from './model/EditOperation/EmptyOperation';
import {Grammar} from './model/Grammar';
import {parseAndEncode, translateGrammar} from './translateGrammar';

export function generateMinimalCorrectionsForOneWord(
  correctionLeadingToWord: Correction,
  exprGrammar: any,
  lexicon: Map<string, string>,
  terminals: string[],
  checkEmptyEditOperation: boolean,
  canonical: boolean
): [Correction[], Correction[]] {
  const {resultingWord: word, consumedIndices} = correctionLeadingToWord;

  const operations: EditOperation[] = generateOperationsForWord(
    word,
    consumedIndices,
    terminals,
    canonical,
    correctionLeadingToWord.transitionIndex
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
  const resultRemain = remainingCorrections.map(([eop, word]) =>
    correctionLeadingToWord.extendByOperation(eop, word, canonical)
  );
  return [resultRemain, resultMin];
}

export function generateAllMinimalCorrections(
  word: Word,
  grammar: Grammar,
  canonical = false
): Correction[] {
  const lexicon = new Map<string, string>();
  const exprGrammar = translateGrammar(grammar, lexicon);
  let minimalCorrections: Correction[] = [];
  const correctionLeadingToWord = new Correction();
  correctionLeadingToWord.resultingWord = word;
  correctionLeadingToWord.consumedIndices = Array.from(
    {length: word.length},
    () => false
  );
  let remainingCorrections: Correction[] = [correctionLeadingToWord];
  let remainingCorrectionsForNextIteration: Correction[] = [];
  const iterations = 5;
  let checkEmptyEditOperation = true;

  //TODO: Better termination condition (no new corrections to be found)
  for (let i = 0; i < iterations; i++) {
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
    remainingCorrections = remainingCorrectionsForNextIteration;
    remainingCorrectionsForNextIteration = [];
  }

  return minimalCorrections;
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

/**
 * Generate deletion and replacement operations on all possible indices of the given word
 * @param word
 * @param alphabet
 * @returns
 */
export function generateOperationsForWord(
  word: Word,
  consumedIndices: boolean[],
  alphabet: Alphabet,
  canonical = false,
  transitionIndex = Correction.T_INDEX_DEFAULT
): EditOperation[] {
  const operations: EditOperation[] = [];

  for (let index = 0; index < word.length; index++) {
    if (!consumedIndices[index]) {
      const currentSymbol = word[index];
      if (transitionIndex < 0) {
        operations.push(new Deletion(currentSymbol, index));
      }
      for (const symb of alphabet) {
        // operations.push(new Insertion(symb, index));
        if (symb !== currentSymbol) {
          operations.push(new Replacement(currentSymbol, symb, index));
        }
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

function parseTreeContainsParses(parseTree: any[]) {
  return parseTree.length > 0;
}
