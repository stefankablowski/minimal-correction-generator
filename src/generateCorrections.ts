import {Word} from './model';
import {Alphabet} from './model/Alphabet';
import {Deletion, Insertion, Replacement} from './model/EditOperation';
import {Correction} from './model/EditOperation/Correction';
import {EditOperation} from './model/EditOperation/EditOperation';
import {Grammar} from './model/Grammar';
import {parseAndEncode, translateGrammar} from './translateGrammar';

export function generateAllMinimalCorrections(word: Word, grammar: Grammar) {
  // compute all corrections of length 1
  const operations: EditOperation[] = generateOperationsForWord(
    word,
    grammar.terminals
  );
  // apply these corrections to the word
  const words: Word[] = applyOperationsToWord(operations, word);
  // remove all corrections where w e L and save them in minimal correction set
  const [minimal, remaining] = checkWordProblemForWords(words, grammar);

  // extend remaining corrections by all possible edit operations each
  let previousRemainingFixPoint = 0;
  let currentRemainingFixPoint = remaining.length;
  while (previousRemainingFixPoint < currentRemainingFixPoint) {
    previousRemainingFixPoint = currentRemainingFixPoint;
    currentRemainingFixPoint = remaining.length;
  }
}

export function checkWordProblemForWords(
  words: Word[],
  grammar: Grammar
): [minimal: Word[], remaining: Word[]] {
  const minimal: Word[] = [];
  const remaining: Word[] = [];
  const lexicon = new Map<string, string>();
  const exprGrammar = translateGrammar(grammar, lexicon);
  words.forEach(word => {
    const parseTree = parseAndEncode(lexicon, exprGrammar, word);
    if (parseTreeContainsParses(parseTree)) {
      minimal.push(word);
    } else {
      remaining.push(word);
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
): Word[] {
  return operations.map(op => op.apply(word));
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
