import { useEffect, useState } from 'react';

type Callback<T> = (input: T) => void;

interface Listener<T> {
  callback: Callback<T>;
  removed: boolean;
}

export type CancelFunc = () => void;

const debug = false;

export class EventEmitter2<T> {
  listeners: Listener<T>[] = [];
  current: T;
  debugName: string;

  static counter = 0;

  constructor(initial: T, opts?: {
    debugName: string;
  }) {
    this.current = initial;
    this.debugName = opts?.debugName ?? (EventEmitter2.counter++).toString();
  }

  log(message: string, opts?: any) {
    if (!debug) return;
    console.log('Emitter', this.debugName, message, opts);
  }

  warn(message: string) {
    if (!debug) return;
    console.warn('Emitter', this.debugName, message);
  }

  subscribe(callback: Callback<T>): CancelFunc {
    const obj = { callback: callback, removed: false };
    this.listeners.push(obj);

    let self = this;

    return () => {
      const preLength = self.listeners.length;

      obj.removed = true; // mark as removed in case emit() is being called
      self.listeners = self.listeners.filter((l) => l !== obj);

      if (self.listeners.length === preLength) {
        self.warn('listener already removed');
        return;
      }
    }
  }

  subscribeAndFireLast(callback: Callback<T>) {
    const sub = this.subscribe(callback);

    if (this.current !== undefined) {
      callback(this.current);
    }

    return sub;
  }

  emit(value: T) {
    this.current = value;

    this.listeners.map((item) => {
      if (item.removed) return null;

      item.callback(value);
      return null;
    });
  }
}

export function useEventEmitter2<T>(value: EventEmitter2<T>) {
  const [state, setState] = useState(value.current);

  useEffect(() => {
    return value.subscribe(setState);
  }, [value]);

  return state;
}
