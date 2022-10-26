import {Deletion, Insertion, Replacement, EmptyOperation} from '.';
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
  abstract toString(): string;

  static print(
    firstSymbol: string,
    icon: string,
    index: number,
    secondSymbol = ''
  ): string {
    return `${icon}${firstSymbol}(${index})${secondSymbol}`;
  }

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
    // (ii)
    if (
      op1.index === op2.index &&
      op1.isDeletion() &&
      op2.isReplacement() &&
      op1.deleteSymbol === op2.insertSymbol
    ) {
      return [new Deletion(op2.deleteSymbol, op1.index + 1)];
    }
    // (iv)
    if (
      op1.index - 1 === op2.index &&
      op1.isDeletion() &&
      op2.isReplacement() &&
      op1.deleteSymbol === op2.insertSymbol
    ) {
      return [new Deletion(op2.deleteSymbol, op2.index)];
    }

    return [op1, op2];
  }

  static swapPair(
    op1: EditOperation,
    op2: EditOperation
  ): [EditOperation, EditOperation] | undefined {
    if (op1.isReplacement() && op2.isReplacement() && op1.index !== op2.index) {
      return [op2, op1];
    }
    if (op1.isDeletion() && op2.isDeletion()) {
      if (op1.index > op2.index) {
        return [op2, new Deletion(op1.deleteSymbol, op1.index - 1)];
      } else {
        return [new Deletion(op2.deleteSymbol, op2.index + 1), op1];
      }
    }
    if (op1.isDeletion() && op2.isReplacement()) {
      if (op1.index <= op2.index) {
        return [
          new Replacement(op2.deleteSymbol, op2.insertSymbol, op1.index + 1),
          op1,
        ];
      } else {
        return [op2, op1];
      }
    }

    if (op1.isReplacement() && op2.isDeletion()) {
      if (op1.index < op2.index) {
        return [op2, op1];
      } else if (op1.index > op2.index) {
        return [
          op2,
          new Replacement(op1.deleteSymbol, op1.insertSymbol, op1.index - 1),
        ];
      }
    }
    return undefined;
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

  isEmpty() {
    return this instanceof EmptyOperation;
  }
}
