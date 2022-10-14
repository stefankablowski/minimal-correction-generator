import {minimizable, minimize, propagateFromTo} from '../src/minimize';
import {createWord, Word} from '../src/model';
import {Deletion, Replacement} from '../src/model/EditOperation';
import {Correction} from '../src/model/EditOperation/Correction';

describe('Minimize', () => {
  test('Pairwise Simplification for Propagation', () => {
    const c1 = new Correction([
      new Deletion('b', 2),
      new Replacement('a', 'b', 1),
    ]);

    expect(c1.simplify()).toEqual(new Correction([new Deletion('a', 1)]));
  });

  test('Propagation', () => {
    const c1 = new Correction([
      new Deletion('a', 0),
      new Deletion('b', 0),
      new Deletion('c', 0),
      new Replacement('b', 'a', 1),
    ]);

    const c2 = new Correction([
      new Deletion('b', 1),
      new Deletion('c', 1),
      new Deletion('a', 0),
      new Replacement('b', 'a', 1),
    ]);
    const propagatedRight = propagateFromTo(0, 2, c1);
    if (propagatedRight === undefined) {
      throw new Error('');
    }
    expect(propagatedRight.equals(c2)).toBe(true);
    const propagatedLeft = propagateFromTo(2, 0, c2);
    if (propagatedLeft === undefined) {
      throw new Error('');
    }
    expect(propagatedLeft.equals(c1)).toBe(true);
  });

  test('Minimization', () => {
    /**
     * Example: cba -> cb
     */

    // (ii)
    const c1 = new Correction([
      new Deletion('b', 1),
      new Replacement('a', 'b', 1),
    ]);
    expect(c1.simplify()).toEqual(new Correction([new Deletion('a', 2)]));

    // (iv)
    const c2 = new Correction([
      new Deletion('b', 2),
      new Replacement('a', 'b', 1),
    ]);

    expect(c2.simplify()).toEqual(new Correction([new Deletion('a', 1)]));
  });

  const w: Word = createWord('cba');
  // cba -> ba -> a -> b is equal to
  // cba -> ba -> a and
  // cba -> cb -> b and
  // cba -> ca -> a -> b
  const c3 = new Correction(
    [new Deletion('b', 1), new Deletion('c', 0), new Replacement('a', 'b', 0)],
    2
  );
  const c3min = minimize(c3);
  expect(minimizable(c3)).toBe(true);
  expect(c3min?.apply(w)).toEqual(c3.apply(w));

  const c4 = new Correction(
    [new Deletion('c', 0), new Deletion('b', 0), new Replacement('a', 'b', 0)],
    2
  );
  expect(minimizable(c4)).toBe(true);
  const c4min = minimize(c4);
  expect(c4min?.apply(w)).toEqual(c4.apply(w));

  const c5 = new Correction(
    [new Deletion('c', 0), new Deletion('b', 0), new Replacement('a', 'b', 1)],
    2
  );
  expect(minimizable(c5)).toBe(false);
});
