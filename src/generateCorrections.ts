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
  grammar: Grammar,
  globalMinimal: Correction[]
) {
  if (word.length > 6) {
    return;
  }
  const operations: EditOperation[] = generateOperationsForWord(
    word,
    grammar.terminals
  );
  const wordsWithOperation: [EditOperation, Word][] = applyOperationsToWord(
    operations,
    word
  );
  const [minimal, remaining] = checkWordProblemForWords(
    wordsWithOperation,
    grammar
  );
  globalMinimal.concat(
    minimal.map(([eop]) => {
      const operations = [...correctionLeadingToWord.operations];
      operations.push(eop);
      return new Correction(operations);
    })
  );
  remaining.forEach(([eop, word]) => {
    const operations = [...correctionLeadingToWord.operations];
    operations.push(eop);
    const corr = new Correction(operations);

    generateMinimalCorrectionsForOneWord(word, corr, grammar, globalMinimal);
  });
}

export function generateAllMinimalCorrections(word: Word, grammar: Grammar) {
  const globalMinimal: Correction[] = [];
  const correctionLeadingToWord = new Correction();
  generateMinimalCorrectionsForOneWord(
    word,
    correctionLeadingToWord,
    grammar,
    globalMinimal
  );
  console.log(globalMinimal);
}

export function checkWordProblemForWords(
  wordsWithOperation: [EditOperation, Word][],
  grammar: Grammar
): [minimal: [EditOperation, Word][], remaining: [EditOperation, Word][]] {
  const minimal: [EditOperation, Word][] = [];
  const remaining: [EditOperation, Word][] = [];
  const lexicon = new Map<string, string>();
  const exprGrammar = translateGrammar(grammar, lexicon);
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
