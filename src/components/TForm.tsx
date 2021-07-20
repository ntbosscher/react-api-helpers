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
  subscribeToExternalChanges(k: string, callback: (value: any) => void): CancelFunc {
    return () => {};
  },
  subscribeToAllChanges(k: string, callback: (value: any) => void): CancelFunc {
    return () => {};
  },
  subscribeToChanges(k: string, callback: (value: any) => void, externalOnly: boolean = true): CancelFunc {
    // legacy
    return () => {};
  },
  editing: false,
});

export type FormObj = { [k: string]: any };
const blankCallback = () => {};

export function TForm<T extends FormObj>(
  props: PropsWithChildren<{
    onSubmit: (value: T) => void;
    onChange?: (value: T) => void;
    value: T;
    editing: boolean;
  }>,
) {
  const obj = useRef(props.value);

  // pass change events to targeted child elements
  const events = useRef(new EventEmitter<{ key?: string; external: boolean; value: any }>());

  // trigger refresh when props.value changes
  const [refresh, setRefresh] = useState(props.value);

  useEffect(() => {
    obj.current = props.value;
    setRefresh(props.value);
    events.current.emit({ value: null, external: true });
  }, [props.value]);

  const onChangeRef = useRef(props.onChange || blankCallback);
  onChangeRef.current = props.onChange || blankCallback;

  const ctx = useMemo(
    () => ({
      value: obj.current,
      // the input responsible for this key triggered an update
      inputUpdated: (key: keyof T, newValue) => {
        obj.current[key] = newValue;
        events.current.emit({
          external: false,
          key: key as string,
          value: newValue,
        });
        onChangeRef.current(obj.current);
      },
      // someone else triggered an update
      triggerUpdate: (key: keyof T, value) => {
        obj.current[key] = value;
        events.current.emit({
          external: true,
          key: key as string,
          value: value,
        });
        onChangeRef.current(obj.current);
      },
      subscribeToExternalChanges(k: string, callback: (value: any) => void): CancelFunc {
        const sub = events.current.subscribe((input) => {
          if (!input.external) return;

          // global update
          if (input.key === undefined) {
            callback(obj.current[k]);
            return;
          }

          // scoped change to this input
          if (input.key === k) {
            callback(obj.current[k]);
          }
        });

        return sub.cancel as CancelFunc;
      },
      subscribeToChanges(k: string, callback: (value: any) => void, externalOnly: boolean = true): CancelFunc {
        const sub = events.current.subscribe((input) => {
          if (externalOnly && !input.external) return;

          // global update
          if (input.key === undefined) {
            callback(obj.current[k]);
            return;
          }

          // scoped change to this input
          if (input.key === k) {
            callback(obj.current[k]);
          }
        });

        return sub.cancel as CancelFunc;
      },
      subscribeToAllChanges(k: string, callback: (value: any) => void): CancelFunc {
        const sub = events.current.subscribe((input) => {
          // global update
          if (input.key === undefined) {
            callback(obj.current[k]);
            return;
          }

          // scoped change to this input
          if (input.key === k) {
            callback(obj.current[k]);
          }
        });

        return sub.cancel as CancelFunc;
      },
      editing: props.editing,
    }),
    [props.editing, obj.current, refresh, props.onChange],
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
