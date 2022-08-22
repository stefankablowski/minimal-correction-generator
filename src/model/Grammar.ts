export type RuleMap = Map<string, string[][]>;

export class Grammar {
  rules: RuleMap = new Map<string, string[][]>();
  terminals: string[] = [];
  rootRule = '';
}
