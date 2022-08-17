type RuleMap = Map<string, string[][]>;

export class Grammar {
  rules: RuleMap = new Map<string, string[][]>();
  terminals: Array<string> = [];
  rootRule = '';
}

const cfgtool = require('cfgrammar-tool');
const types = cfgtool.types;

const Rule = types.Rule;
const T = types.T;
const NT = types.NT;

let id = 0;
function makeid() {
  const characters =
    'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  return characters[id++];
}

/**
 *
 * @param lexicon Every nonterminal from the grammar gets encoded into a 1-character long token
 * @param parsedString
 */
function parseAndEncode(
  lexicon: Map<string, string>,
  grammar: any,
  stringToParse: string[]
) {
  const parser = cfgtool.parser;
  const encodedString = encodeStringArray(stringToParse, lexicon);
  console.log(encodedString);
  console.dir(JSON.stringify(grammar));
  return parser.parse(grammar, encodedString);
}

function encodeTerminals(terminals: string[], lexicon: Map<string, string>) {
  terminals.forEach(terminal => {
    lexicon.set(terminal, makeid());
  });
}

function translateGrammar(grammar: Grammar, lexicon: Map<string, string>) {
  const earleyGrammar: any = [];

  encodeTerminals(grammar.terminals, lexicon);

  grammar.rules.forEach((rhs: string[][], key: string, map: RuleMap) => {
    rhs.forEach((value: string[]) => {
      const appliedTerminals = value.map(
        (symbol: string, i: number, arr: string[]) => {
          const symbolIsTerminal = grammar.terminals.includes(symbol);
          if (symbolIsTerminal) {
            const encodedSymbol = lexicon.get(symbol);
            return T(encodedSymbol);
          } else {
            return NT(symbol);
          }
        }
      );

      earleyGrammar.push(Rule(key, appliedTerminals));
    });
  });
  const Grammar = types.Grammar;
  return Grammar(earleyGrammar);
}

/**
 * Takes an array of strings and translates every entry into a 1-character long token
 * @param stringToParse
 * @param lexicon
 */
function encodeStringArray(
  stringToParse: string[],
  lexicon: Map<string, string>
): string {
  let result = '';
  stringToParse.forEach((token: string) => {
    result = result + lexicon.get(token);
  });
  return result;
}

describe('Context-Free Grammar', () => {
  test('1(+1)*', () => {
    const grammar = {
      rules: new Map([
        ['S', [['E']]],
        ['E', [['E', '+', 'E'], ['1']]],
      ]),
      terminals: ['1', '+'],
      rootRule: 'S',
    };
    const lexicon = new Map<string, string>();
    const exprGrammar = translateGrammar(grammar, lexicon);
    const parser = cfgtool.parser;

    expect(
      parseAndEncode(lexicon, exprGrammar, [...'1+1+1+1+1+1+1']).length > 0
    ).toBeTruthy();
    expect(
      parseAndEncode(lexicon, exprGrammar, [...'1+']).length > 0
    ).toBeFalsy();
  });
  test('(Banana|Apple)(+Banana|Apple)*', () => {
    const grammar = {
      rules: new Map([
        ['S', [['E']]],
        ['E', [['E', '+', 'E'], ['A'], ['B']]],
      ]),
      terminals: ['B', 'A', '+'],
      rootRule: 'S',
    };
    const lexicon = new Map<string, string>();
    const exprGrammar = translateGrammar(grammar, lexicon);

    const generatorFactory = cfgtool.generator;
    const generator = generatorFactory(exprGrammar);
    // console.log(generator(21));

    const parser = cfgtool.parser;
    expect(
      parseAndEncode(lexicon, exprGrammar, [...'B+A+B']).length > 0
    ).toBeTruthy();
    expect(
      parseAndEncode(lexicon, exprGrammar, ['Banana+Pear']).length > 0
    ).toBeFalsy();
  });
  test('Bio Grammar', () => {
    const grammar = {
      rules: new Map([
        ['S', [['EE']]],
        ['EE', [['EE', '+', 'EE'], ['AA'], ['BB']]],
      ]),
      terminals: ['BB', 'AA', '+'],
      rootRule: 'S',
    };
    const lexicon = new Map<string, string>();
    const exprGrammar = translateGrammar(grammar, lexicon);

    const generatorFactory = cfgtool.generator;
    const generator = generatorFactory(exprGrammar);
    // console.log(generator(21));

    const parser = cfgtool.parser;
    expect(
      parseAndEncode(lexicon, exprGrammar, ['BB', '+', 'AA']).length > 0
    ).toBeTruthy();
  });
});
