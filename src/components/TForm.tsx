import React, { PropsWithChildren, useState, useEffect, useMemo, createContext } from 'react';

export const TFormContext = createContext({
  initialValue: undefined as any,
  update: (k: string, value: any) => {
    console.error('missing <TForm>');
  },
  editing: false,
});

export function TForm<T>(
  props: PropsWithChildren<{
    onSubmit: (value: T) => void;
    value?: T;
    editing: boolean;
  }>,
) {
  const [value, setValue] = useState<T>();

  useEffect(() => {
    setValue(props.value);
  }, [props.value]);

  const ctx = useMemo(
    () => ({
      initialValue: props.value,
      update: (key, value) => {
        setValue((obj) =>
          Object.assign({}, obj, {
            [key]: value,
          }),
        );
      },
      editing: props.editing,
    }),
    [props.editing, props.value],
  );

  return (
    <TFormContext.Provider value={ctx}>
      <form
        onSubmit={(e) => {
          e.preventDefault();
          if (!value) {
            console.warn('missing .value');
            return;
          }

          props.onSubmit(value);
        }}
      >
        {props.children}
      </form>
    </TFormContext.Provider>
  );
}
