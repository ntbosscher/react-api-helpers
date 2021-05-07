import React, { useState } from 'react';
import Autocomplete from '@material-ui/lab/Autocomplete';
import { TextField } from '@material-ui/core';
import { useDebounce } from 'use-debounce';
import { useAsync2 } from '../AsyncUtils2';

interface UElement {
  id: number;
  name: string;
}

export function UAutoComplete(props: {
  fetcher: (opt: { search: string }) => Promise<UElement[]>;
  initialValue?: UElement;
  label: string;
  required?: boolean;
  type?: 'outlined' | 'standard';
  autoFocus?: boolean;
  className?: string;
  noBottomPadding?: boolean;
  freeSolo?: boolean;
  disabled?: boolean;
  onCancel?(): void;
  onKeyDown?(e: KeyboardEvent): void;
  onChange(value: UElement): void;
}) {
  const [search, setSearch] = useState('');
  const [debounced] = useDebounce(search, 500, { leading: true });
  const fetcher = useAsync2((opt) => props.fetcher(opt), { search: debounced }, [debounced]);
  const [value, setValue] = useState(
    props.initialValue ||
      ({
        id: -1,
        name: '',
      } as UElement),
  );

  return (
    <>
      <Autocomplete
        value={value}
        loading={fetcher.loading}
        defaultValue={props.initialValue}
        disabled={props.disabled}
        options={fetcher.asList}
        className={props.className}
        onBlur={props.onCancel}
        onInputChange={(event, newInputValue) => {
          setSearch(newInputValue);
        }}
        filterOptions={(options, params) => {
          const filtered = options.slice(0);

          // Suggest the creation of a new value
          if (props.freeSolo && params.inputValue !== '') {
            filtered.push({
              inputValue: params.inputValue,
              id: -1,
              name: `Add "${params.inputValue}"`,
            } as any);
          }

          return filtered;
        }}
        selectOnFocus
        onChange={(e, newValue) => {
          if (newValue === null || newValue === undefined) return;
          if (typeof newValue === 'string') {
            return;
          }

          if (newValue.id === -1) {
            const v = {
              id: -1,
              name: (newValue as any).inputValue as string,
            };

            setValue(v);
            props.onChange(v);
            return;
          }

          setValue(newValue);
          props.onChange(newValue);
        }}
        renderOption={(opt) => opt.name}
        getOptionLabel={(opt) => opt.name}
        getOptionSelected={(opt, value) => opt.id === value.id}
        freeSolo={props.freeSolo}
        blurOnSelect
        renderInput={(params) => {
          const { InputProps, inputProps, ...others } = params;

          return (
            <TextField
              {...others}
              inputProps={Object.assign({}, inputProps, {
                onKeyDown: props.onKeyDown as any,
                onFocus: (e: any) => {
                  // @ts-ignore
                  inputProps.onFocus(e);

                  e.target.value = '';
                  // @ts-ignore
                  inputProps.onChange(e);
                },
              })}
              InputProps={Object.assign({}, InputProps, {
                disableUnderline: true,
              })}
              autoFocus={props.autoFocus}
              required={props.required}
              label={props.label}
              variant={props.type || 'outlined'}
            />
          );
        }}
      />
      {props.noBottomPadding ? null : <div style={{ height: 16 }} />}
    </>
  );
}
