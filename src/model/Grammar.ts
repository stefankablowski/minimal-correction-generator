export type RuleMap = Map<string, string[][]>;

export class Grammar {
  rules: RuleMap = new Map<string, string[][]>();
  terminals: string[] = [];
  rootRule = '';
  static toTex(grammar: Grammar) {
    const result = Array.from(grammar.rules)
      .map(([LHS, RHS]) => {
        return `\\textit{${LHS}}\\; &\\rightarrow \\; ${printRule(
          RHS
        )} \\\\ \n`;
      })
      .join('');
    return result;
  }
}

function printRule(RHSarray: string[][]) {
  const innerRulesFormatted = RHSarray.map(RHSsingle =>
    RHSsingle.map(variable => `\\textit{${variable}}`).join('~')
  );
  return innerRulesFormatted.join('\\ \\vert \\ ');
}
