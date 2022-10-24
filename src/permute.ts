function permute(
  arr: any[],
  swapFunction:
    | ((index1: any, index2: any, oldArray: any[]) => any)
    | undefined = undefined
) {
  const N = arr.length;
  const directions: number[] = [];
  const indices: number[] = [];
  let swapIndex1: any;
  let swapIndex2: any;

  directions.push(0);
  indices.push(0);
  for (let i = 1; i < N; i += 1) {
    directions.push(-1);
    indices.push(i);
  }

  function swap(i: number, j: number) {
    swapIndex1 = i;
    swapIndex2 = j;
    let tmp = indices[i];
    indices[i] = indices[j];
    indices[j] = tmp;

    tmp = directions[i];
    directions[i] = directions[j];
    directions[j] = tmp;
  }

  function result() {
    if (swapFunction !== undefined) {
      const newArr = swapFunction(swapIndex1, swapIndex2, arr);
      arr = newArr;
      return newArr;
    }
    const res = [];
    for (let i = 0; i < N; i += 1) {
      res.push(arr[indices[i]]);
    }
    return res;
  }

  const makeResult =
    typeof arr !== 'string'
      ? result
      : function () {
          return result().join('');
        };

  return function () {
    let i: number;
    let maxIndex: number | undefined = undefined;
    for (i = 0; i < N; i += 1) {
      if (directions[i] !== 0) {
        maxIndex = i;
        break;
      }
    }
    if (maxIndex === undefined) {
      return undefined;
    }
    for (i = maxIndex + 1; i < N; i += 1) {
      if (directions[i] !== 0 && indices[i] > indices[maxIndex]) {
        maxIndex = i;
      }
    }
    const moveTo = maxIndex + directions[maxIndex];
    swap(maxIndex, moveTo);
    if (
      moveTo === 0 ||
      moveTo === N - 1 ||
      indices[moveTo + directions[moveTo]] > indices[moveTo]
    ) {
      directions[moveTo] = 0;
    }
    for (i = 0; i < N; i += 1) {
      if (indices[i] > indices[moveTo]) {
        if (i < moveTo) {
          directions[i] = 1;
        } else {
          directions[i] = -1;
        }
      }
    }
    return makeResult();
  };
}

permute.all = function (array: any[]) {
  const generator = permute(array);
  let next: string | any[] | undefined = array;
  const result = [];
  while (next !== undefined) {
    result.push(next);
    next = generator();
  }
  return result;
};

export = permute;
