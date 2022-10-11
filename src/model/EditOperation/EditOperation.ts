import {Deletion, Insertion, Replacement} from '.';
import {Word} from '../Word';

export abstract class EditOperation implements Comparable<EditOperation> {
  constructor(deleteSymbol = '', insertSymbol = '', index: number) {
    this.deleteSymbol = deleteSymbol;
    this.insertSymbol = insertSymbol;
    this.index = index;
  }
  deleteSymbol: string;
  insertSymbol: string;
  index: number;
  abstract apply(word: Word): Word;

  equals(value: EditOperation): boolean {
    return (
      typeof this === typeof value &&
      this.deleteSymbol === value.deleteSymbol &&
      this.insertSymbol === value.insertSymbol &&
      this.index === value.index
    );
  }

  static simplifyPair(op1: EditOperation, op2: EditOperation): EditOperation[] {
    /* Simplify according to standard table */
    // a)
    if (
      op1.index === op2.index &&
      ((op1.isInsertion() &&
        op2.isDeletion() &&
        op1.insertSymbol === op2.deleteSymbol) ||
        (op1.isDeletion() &&
          op2.isInsertion() &&
          op1.deleteSymbol === op2.insertSymbol))
    ) {
      return [];
    }
    // b)
    if (
      op1.index === op2.index &&
      op1.isReplacement() &&
      op2.isDeletion() &&
      op1.insertSymbol === op2.insertSymbol
    ) {
      return [new Deletion(op1.deleteSymbol, op1.index)];
    }
    // c)
    if (
      op1.index === op2.index &&
      op1.isInsertion() &&
      op2.isReplacement() &&
      op1.insertSymbol === op2.deleteSymbol
    ) {
      return [new Insertion(op2.insertSymbol, op2.index)];
    }
    // d
    if (
      op1.index === op2.index &&
      op1.isReplacement() &&
      op2.isReplacement() &&
      op1.insertSymbol === op2.deleteSymbol
    ) {
      return [new Insertion(op2.insertSymbol, op2.index)];
    }
    /* Extended Simplifying */

    return [op1, op2];
  }

  isInsertion() {
    return this instanceof Insertion;
  }

  isDeletion() {
    return this instanceof Deletion;
  }

  isReplacement() {
    return this instanceof Replacement;
  }
}
