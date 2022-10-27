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

Implement 2-stage Corrections as alternative to normal corrections
Every correction has a border, at which deletions transition into replacements

[Del, ..., Del | Repl, ..., Repl]
Del1
Del2
Del3
Repl1
Repl2
Repl3

---

Del1 Del2
Del1 Del3
Del1 Repl2
Del1 Repl3
Del2 Repl1
Del2 Repl3
Del3 Repl1
Del3 Repl2
Repl1 Repl2
Repl1 Repl3
Repl2 Repl1
Repl2 Repl3
Repl3 Repl1
Repl3 Repl2

...

When generating possible edit operations:

- Border not passed:
  - Append Deletion
- Border passed:
  - Append Insertion

TODO: ✅

Store every correction in a dict with the result of the word problem

Check for every reordering c' of correction c

- try all prefixes of c'
- try to simplify c'

=> (optimization 1) save reorderings and whether they are minimal and simplifiable

=> (optimization 2) if the current reordering contains a prefix that was found to be not minimal, then c also is not minimal

Minimal = not simplifiable, no prefix matches language, no similar not minimal correction exists

not p-minimal: prefix matches language or simplifiable

- Correction: IsEqual, IsPrefix(empty correction is prefix of every correction?), GenerateSimilar, Simplify
- Test: Generated with standard equals generated in normal form
- Intersection of REG and CFL

- [ ] Generate corrections in super normal form

  - deletions: non-descending
  - replacements: ascending

- Transition index schöner organisieren im code (konsistent halten?)
