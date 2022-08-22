import {Grammar} from './model/Grammar';

const cfgtool = require('cfgrammar-tool');
const types = cfgtool.types;
const Rule = types.Rule;
const T = types.T;
const NT = types.NT;

export {cfgtool};

/**
 *
 * @param lexicon Every nonterminal from the grammar gets encoded into a 1-character long token
 * @param parsedString
 */
export function parseAndEncode(
  lexicon: Map<string, string>,
  grammar: any,
  stringToParse: string[]
) {
  const parser = cfgtool.parser;
  const encodedString = encodeStringArray(stringToParse, lexicon);
  return parser.parse(grammar, encodedString);
}

/**
 * Takes an array of strings and translates every entry into a 1-character long token
 * @param stringToParse
 * @param lexicon
 */
export function encodeStringArray(
  stringToParse: string[],
  lexicon: Map<string, string>
): string {
  let result = '';
  stringToParse.forEach((token: string) => {
    result = result + lexicon.get(token);
  });
  return result;
}

export function translateGrammar(
  grammar: Grammar,
  lexicon: Map<string, string>
) {
  const earleyGrammar: any = [];

  encodeTerminals(grammar.terminals, lexicon);

  grammar.rules.forEach((rhs: string[][], key: string) => {
    rhs.forEach((value: string[]) => {
      const appliedTerminals = value.map((symbol: string) => {
        const symbolIsTerminal = grammar.terminals.includes(symbol);
        if (symbolIsTerminal) {
          const encodedSymbol = lexicon.get(symbol);
          if (encodedSymbol === undefined)
            throw Error(`No ID for symbol ${symbol} found in lexicon`);
          return T(encodedSymbol);
        } else {
          return NT(symbol);
        }
      });

      earleyGrammar.push(Rule(key, appliedTerminals));
    });
  });
  const Grammar = types.Grammar;
  return Grammar(earleyGrammar);
}

/**
 * Generate a key for every alphabet symbol and make and create an entry in the given lexicon
 * @param terminals Alphabet
 * @param lexicon Empty lexicon
 */
export function encodeTerminals(
  terminals: string[],
  lexicon: Map<string, string>
) {
  terminals.forEach(terminal => {
    lexicon.set(terminal, makeid());
  });
}

let id = 0;
export function makeid() {
  if (id > 63) {
    throw new RangeError('Cannot Encode more than 63 Terminals');
  }
  const characters =
    'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  return characters[id++];
}

/**
 * Transforms an encoded string into an array of tokens
 * @param encodedString
 * @param lexicon
 * @returns
 */
export function decodeString(
  encodedString: string,
  lexicon: Map<string, string>
): (string | undefined)[] {
  const reverseLexicon = new Map<string, string>();
  lexicon.forEach((id: string, token: string) => {
    reverseLexicon.set(id, token);
  });
  return [...encodedString].map((id: string) => {
    return reverseLexicon.get(id);
  });
}
