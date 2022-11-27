export type RuleMap = Map<string, string[][]>;

export class Grammar {
  rules: RuleMap = new Map<string, string[][]>();
  terminals: string[] = [];
  rootRule = '';
  static toTex(grammar: Grammar) {
    const result = `\\SetTblrInner{hspan=minimal, rowsep=1.5pt,colsep=1.5pt}
    \\begin{tblr}{rcX[l]}`
      .concat(
        Array.from(grammar.rules)
          .map(([LHS, RHS]) => {
            return `\\textit{${LHS}} & $\\rightarrow$ & \\textit{${printRule(
              RHS,
              grammar.terminals
            )}} \\\\ \n`;
          })
          .join('')
      )
      .concat('\\end{tblr}');

    return result;
  }
}

function printRule(RHSarray: string[][], terminals: string[]) {
  const innerRulesFormatted = RHSarray.map(RHSsingle =>
    RHSsingle.map(variable => {
      return terminals.includes(variable)
        ? `\\bsq{${variable}}`
        : `\\textlangle ${variable}\\textrangle`;
    }).join('\\ ')
  );
  return innerRulesFormatted.join('\\ $\\vert$\\ ');
}
