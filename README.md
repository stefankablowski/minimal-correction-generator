# minimal-correction-generator

Tool to generate automatic sentence corrections that are minimal. Corrections transform a word so that it matches the given (context-free) grammar.

Used in teaching of biology to assist pupils find their mistakes when writing hypotheses for biological experiments. Formulating hypotheses is part of the scientific method.

## Installation

**Requirements**

- NodeJS v16+ (recommended installation via Node Version Manager)

  > In project root, run:

  > `npm install`

**Run Tests**

> `npm run test`

> See scripts in `package.json` for all commands

**Used Libraries**

- [Johnson-Steinhaus-Trotter Algorithm by nodash](https://github.com/nodash/steinhaus-johnson-trotter)
  > Generates all permutations of a sequence swapping element pairs
- [TSlog](https://tslog.js.org/#/)
  > Simple Typescript Logger
- [CFGrammar-Tool](https://github.com/bakkot/cfgrammar-tool)
  > Solves word problem for context-free languages in O(n³)

### Recommended Setup:

- Visual Studio Code

  - Prettier Extension
  - Jest Extension
  - ESLint

  This project is formatted using Google Typescript Style (GTS) and Prettier VSCode extension

> Format contributions with GTS

> `npm run fix`
