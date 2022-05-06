import React, { useState, useRef } from 'react';
import { useDebounce } from 'use-debounce';
import { useAsync2 } from '../AsyncUtils2';
import { Autocomplete, TextField } from '@mui/material';

interface UElement {
  id: number;
  name: string;
}

function newOption(value: string): UElement {
  return {
    id: -1,
    name: value,
  };
}

export function UAutoComplete(props: {
  fetcher: (opt: { search: string }) => Promise<UElement[]>;
  fetcherDeps?: any[];
  initialValue?: UElement;
  label: string;
  required?: boolean;
  type?: 'outlined' | 'standard';
  autoFocus?: boolean;
  className?: string;
  noBottomPadding?: boolean;
  shrinkLabel?: boolean;
  freeSolo?: boolean;
  disabled?: boolean;
  clearOnFocus?: boolean;
  onCancel?(): void;
  onKeyDown?(e: KeyboardEvent): void;
  onChange(value: UElement): void;
}) {
  const [search, setSearch] = useState('');
  const [debounced] = useDebounce(search, 500, { leading: true });

  const fetcherSearchDeps = [debounced];
  if (props.fetcherDeps) {
    fetcherSearchDeps.push(...props.fetcherDeps);
  }
  const fetcher = useAsync2((opt) => props.fetcher(opt), { search: debounced }, fetcherSearchDeps);

  const [value, setValue] = useState(
    props.initialValue ||
      ({
        id: -1,
        name: '',
      } as UElement),
  );

  const valueRef = useRef(value);
  const searchRef = useRef('');

  return (
    <>
      <Autocomplete
        value={value}
        loading={fetcher.loading}
        defaultValue={props.initialValue}
        disabled={props.disabled}
        options={fetcher.asList}
        className={props.className}
        onBlur={() => {
          if (props.freeSolo && valueRef.current.name !== searchRef.current) {
            const srcList = fetcher.asList.filter((l) => l.name === search);
            if (srcList.length >= 1) {
              setValue(srcList[0]);
              props.onChange(srcList[0]);
              return;
            }

            const v = newOption(search);
            setValue(v);
            props.onChange(v);
          }

          if (props.onCancel) props.onCancel();
        }}
        onInputChange={(event, newInputValue) => {
          setSearch(newInputValue);
          searchRef.current = newInputValue;
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

          searchRef.current = newValue.name;

          if (newValue.id === -1) {
            const v = newOption((newValue as any).inputValue as string);
            valueRef.current = v;
            setValue(v);
            props.onChange(v);
            return;
          }

          valueRef.current = newValue;
          setValue(newValue);
          props.onChange(newValue);
        }}
        renderOption={(props, opt) => (typeof opt === 'string' ? opt : opt.name)}
        getOptionLabel={(opt) => (typeof opt === 'string' ? opt : opt.name)}
        freeSolo={props.freeSolo}
        blurOnSelect
        renderInput={(params) => {
          const { InputProps, inputProps, InputLabelProps, ...others } = params;

          return (
            <TextField
              {...others}
              inputProps={Object.assign({}, inputProps, {
                onKeyDown: props.onKeyDown as any,
                onFocus: (e: any) => {
                  // @ts-ignore
                  inputProps.onFocus(e);

                  if (props.clearOnFocus === undefined || props.clearOnFocus === true) {
                    e.target.value = '';
                    // @ts-ignore
                    inputProps.onChange(e);
                  }
                },
              })}
              InputProps={Object.assign({}, InputProps, {
                disableUnderline: true,
              })}
              InputLabelProps={Object.assign({}, InputLabelProps, {
                shrink: props.shrinkLabel,
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
