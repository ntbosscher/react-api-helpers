export function reverse<T>(list: T[]): T[] {
  const newList: T[] = [];

  for (let i = list.length - 1; i >= 0; i--) {
    newList.push(list[i]);
  }

  return newList;
}

export function sum<T>(list: number[]) {
  return list.reduce((acc, v) => acc + v, 0);
}

export function iter<T>(iterable: { length: number; [i: number]: T }): T[] {
  let list: T[] = [];

  for (let i = 0; i < iterable.length; i++) {
    list.push(iterable[i]);
  }

  return list;
}

export function flatten<T>(input: T[][]): T[] {
  return input.reduce((list, item) => {
    return [...list, ...item];
  }, [] as T[]);
}

type Selector<T, U> = (v: T) => U;

export function distinct<T, U = null>(
  input: T[],
  selector?: Selector<T, U extends null ? T : U>
): (U extends null ? T : U)[] {
  if (!selector) selector = (v) => v as any;
  return input
    .map(selector)
    .filter((value, index, array) => array.indexOf(value) === index);
}

export function betweenIncl(test: number, boundA: number, boundB: number) {
  const min = Math.min(boundA, boundB);
  const max = Math.max(boundA, boundB);
  return test >= min && test <= max;
}

export function intersection<T>(a: T[], b: T[]): T[] {
  return a.filter((el) => b.indexOf(el) !== -1);
}

export function selectMany<T, U>(input: T[], selector: Selector<T, U[]>): U[] {
  return flatten(input.map(selector));
}

export function range(a: number, b: number | null = null): number[] {
  let start = a;
  let end: number;

  if (b === null) {
    start = 0;
    end = a;
  } else {
    end = b;
  }

  const out: number[] = [];
  for (let i = start; i < end; i++) {
    out.push(i);
  }

  return out;
}

export function aggregate<T, K extends string>(
  list: T[],
  keySelector: (arg: T) => K,
  aggregate: (current: T, accumulator: number) => number
): {
  [k: string]: number;
} {
  return list.reduce(
    (acc, value) => {
      const key = keySelector(value);
      const oldValue = acc[key] || 0;
      acc[key] = aggregate(value, oldValue);
      return acc;
    },
    {} as {
      [k: string]: number;
    }
  );
}

export function aggCount<T, K extends string>(
  list: T[],
  keySelector: (arg: T) => K
) {
  return aggregate(list, keySelector, (current, acc) => 1 + acc);
}

export function contains<T>(arr: T[], search: T): boolean {
  return arr.indexOf(search) !== -1;
}

interface GroupByResult<T> {
  [k: string]: T[];
  [k: number]: T[];
}

export function groupBy<T, K extends string | number>(
  list: T[],
  keySelector: (item: T) => K
): GroupByResult<T> {
  return list.reduce((accumulator, value) => {
    const key = keySelector(value);
    const arr = accumulator[key] ?? [];
    return Object.assign(accumulator, {
      [key]: [...arr, value],
    });
  }, {} as GroupByResult<T>);
}

interface GroupByArrResult<T, K> {
  key: K;
  values: T[];
}

export function groupByArr<T, K>(
  list: T[],
  keySelector: (item: T) => K,
  compareKeyByReference: boolean = false
): GroupByArrResult<T, K>[] {
  const keys: any[] = [];

  return list.reduce((accumulator, value) => {
    const keyValue = keySelector(value);
    let lookupKey = keyValue as K | string;
    if (!compareKeyByReference) lookupKey = JSON.stringify(keyValue);

    const index = keys.indexOf(lookupKey);
    if (index === -1) {
      accumulator.push({ key: keyValue, values: [value] });
      keys.push(lookupKey);
      return accumulator;
    }

    accumulator[index].values.push(value);
    return accumulator;
  }, [] as GroupByArrResult<T, K>[]);
}

export function orderByAscending<T>(
  list: T[],
  selector: (item: T) => number
): void {
  list.sort((a, b) => selector(a) - selector(b));
}

export function orderByDescending<T>(
  list: T[],
  selector: (item: T) => number
): void {
  list.sort((a, b) => selector(b) - selector(a));
}

export function last<T>(items: T[], selector: (item: T) => boolean): T | null {
  for (let i = items.length - 1; i >= 0; i--) {
    if (selector(items[i])) return items[i];
  }

  return null;
}

export function first<T>(items: T[], selector: (item: T) => boolean): T | null {
  for (let i = 0; i < items.length; i++) {
    if (selector(items[i])) return items[i];
  }

  return null;
}

export function min<T>(items: T[], selector: (item: T) => number): T {
  if (items.length === 0) throw new Error("no items in list");

  let minIndex = 0;
  let minValue = Infinity;

  items
    .map((item) => selector(item))
    .map((value, i) => {
      if (value < minValue) {
        minIndex = i;
        minValue = value;
      }

      return null;
    });

  return items[minIndex];
}

export function any<T>(items: T[], selector: (item: T) => boolean): boolean {
  for (let i = 0; i < items.length; i++) {
    if (selector(items[i])) return true;
  }

  return false;
}

export function all<T>(items: T[], selector: (item: T) => boolean): boolean {
  return items.filter(selector).length === items.length;
}

export function max<T>(items: T[], selector: (item: T) => number): T {
  if (items.length === 0) throw new Error("no items in list");

  let maxIndex = 0;
  let maxValue = -Infinity;

  items
    .map((item) => selector(item))
    .map((value, i) => {
      if (value > maxValue) {
        maxIndex = i;
        maxValue = value;
      }

      return null;
    });

  return items[maxIndex];
}

export function splitNWays<T>(elements: T[], n: number): T[][] {
  if (elements.length < n) {
    throw new Error(
      "can't split a list of " + elements.length + " elements " + n + " ways"
    );
  }

  let position = 0;

  return range(n).map((index) => {
    const howMany = Math.floor((elements.length - position) / (n - index));
    const result = elements.slice(position, position + howMany);
    position = position + howMany;
    return result;
  });
}

export function overlapBetween<T>(a: T[], b: T[]) {
  return a.filter((v) => contains(b, v));
}

export function dedupe<T>(list: T[]): T[] {
  return list.filter((item, index) => {
    for (let i = index + 1; i < list.length; i++) {
      if (list[i] === item) return false;
    }

    return true;
  });
}
