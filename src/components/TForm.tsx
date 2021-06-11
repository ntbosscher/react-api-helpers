import React, { PropsWithChildren, useState, useEffect, useMemo, createContext, useRef } from 'react';
import { EventEmitter } from '../EventEmitter';

type CancelFunc = () => void;

export const TFormContext = createContext({
  value: undefined as any,
  inputUpdated: (k: string, value: any) => {
    console.error('missing <TForm>');
  },
  triggerUpdate: (k: string, value: any) => {
    console.error('missing <TForm>');
  },
  subscribeToChanges(k: string, callback: (value: any) => void): CancelFunc {
    return () => {};
  },
  editing: false,
});

export type FormObj = { [k: string]: any };

export function TForm<T extends FormObj>(
  props: PropsWithChildren<{
    onSubmit: (value: T) => void;
    value: T;
    editing: boolean;
  }>,
) {
  const obj = useRef(props.value);

  // pass change events to targeted child elements
  const events = useRef(new EventEmitter<{ key?: string; value: any }>());

  // trigger refresh when props.value changes
  const [refresh, setRefresh] = useState(props.value);

  useEffect(() => {
    obj.current = props.value;
    setRefresh(props.value);
    events.current.emit({ value: null });
  }, [props.value]);

  const ctx = useMemo(
    () => ({
      value: obj.current,
      // the input responsible for this key triggered an update
      inputUpdated: (key: keyof T, newValue) => {
        obj.current[key] = newValue;
      },
      // someone else triggered an update
      triggerUpdate: (key: keyof T, value) => {
        obj.current[key] = value;
        events.current.emit({
          key: key as string,
          value: value,
        });
      },
      subscribeToChanges(k: string, callback: (value: any) => void): CancelFunc {
        const sub = events.current.subscribe((input) => {
          // global update
          if (input.key === undefined) {
            callback(obj[k]);
            return;
          }

          // scoped change to this input
          if (input.key === k) {
            callback(obj[k]);
          }
        });

        return sub.cancel as CancelFunc;
      },
      editing: props.editing,
    }),
    [props.editing, obj.current, refresh],
  );

  return (
    <TFormContext.Provider value={ctx}>
      <form
        onSubmit={(e) => {
          e.preventDefault();
          if (!obj) {
            console.warn('missing .value');
            return;
          }

          props.onSubmit(obj.current);
        }}
      >
        {props.children}
      </form>
    </TFormContext.Provider>
  );
}
