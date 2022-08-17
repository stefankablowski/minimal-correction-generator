# minimal-correction-generator

**Setup**
This project is formatted using Google Typescript Style and Prettier VSCode extension

**Example**

_Possible libraries:_

## Earley-Parser-JS

- could not integrate into typescript project
- https://github.com/lagodiuk/earley-parser-js#

## Chart-parsers

- only generates the parsing charts, you still need to find the parses
- https://www.npmjs.com/package/chart-parsers

## CFGrammar-Tool

- https://www.npmjs.com/package/cfgrammar-tool <
  Supports multi-character Nonterminals
  Does not support multi-character Terminals

## Nearley.js

- need to define Grammar at compiletime(custom format)
- https://nearley.js.org/docs/tokenizers
  Custom .ne file format

Encode Terminals so that
[{Terminal: Code}]
Translate Grammar, put Lexicon[Terminal]

Encode Input [Terminal, Terminal...] so that [Code, Code]
