import {Word} from './model';
import {Alphabet} from './model/Alphabet';
import {Deletion, Insertion, Replacement} from './model/EditOperation';
import {Correction} from './model/EditOperation/Correction';
import {EditOperation} from './model/EditOperation/EditOperation';
import {Grammar} from './model/Grammar';
import {parseAndEncode, translateGrammar} from './translateGrammar';

export function generateMinimalCorrectionsForOneWord(
  word: Word,
  correctionLeadingToWord: Correction,
  exprGrammar: any,
  lexicon: Map<string, string>,
  terminals: string[],
  minimalCorrections: Correction[]
): [Correction[], Correction[]] {
  const operations: EditOperation[] = generateOperationsForWord(
    word,
    terminals
  );
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
    correctionLeadingToWord.extend(eop, word)
  );
  const resultRemain = remainingCorrections.map(([eop, word]) =>
    correctionLeadingToWord.extend(eop, word)
  );
  return [resultRemain, resultMin];
}

export function generateAllMinimalCorrections(
  word: Word,
  grammar: Grammar
): Correction[] {
  const lexicon = new Map<string, string>();
  const exprGrammar = translateGrammar(grammar, lexicon);
  let minimalCorrections: Correction[] = [];
  const correctionLeadingToWord = new Correction();
  correctionLeadingToWord.resultingWord = word;
  let remainingCorrections: Correction[] = [correctionLeadingToWord];
  let currentCorrectionsAccumulated: Correction[] = [];
  const iterations = 2;

  for (let i = 0; i < iterations; i++) {
    for (const corr of remainingCorrections) {
      const [currentRemainCorrections, currentMinCorrections] =
        generateMinimalCorrectionsForOneWord(
          corr.resultingWord,
          corr,
          exprGrammar,
          lexicon,
          grammar.terminals,
          minimalCorrections
        );
      // console.log(currentCorrections);
      currentCorrectionsAccumulated = [
        ...currentCorrectionsAccumulated,
        ...currentRemainCorrections,
      ];
      minimalCorrections = [...currentMinCorrections, ...minimalCorrections];
    }
    remainingCorrections = currentCorrectionsAccumulated;
    currentCorrectionsAccumulated = [];
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

export function generateOperationsForWord(
  word: Word,
  alphabet: Alphabet
): EditOperation[] {
  const operations: EditOperation[] = [];

  for (let index = 0; index < word.length; index++) {
    const currentToken = word[index];
    operations.push(new Deletion(currentToken, index));
    for (const symb of alphabet) {
      // operations.push(new Insertion(symb, index));
      if (symb !== currentToken) {
        operations.push(new Replacement(currentToken, symb, index));
      }
    }
  }
  return operations;
}

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
