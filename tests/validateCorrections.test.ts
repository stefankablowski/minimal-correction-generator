import {EditOperation, Deletion, Correction} from '../src/model/EditOperation';

describe('validateCorrections', () => {
  test('Print all prefixes', () => {
    const operations: EditOperation[] = [
      new Deletion('n', 0),
      new Deletion('e', 0),
      new Deletion('w', 0),
    ];
    const correction: Correction = new Correction(operations);
  });
});
