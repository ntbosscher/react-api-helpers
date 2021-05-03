import * as React from "react";
import { FormControl, InputLabel, Select } from "@material-ui/core";
import { makeStyles } from "@material-ui/core/styles";
import { TFormValue } from './TFormValue';

const useStyles = makeStyles((theme) => ({
    wrapper: {
        marginBottom: 4,
    },
}));

export function TSelect<T>(props: {
    style?: React.CSSProperties;
    label: string;
    obj: T
    objKey: keyof T;
    children: JSX.Element[];
    variant?: "filled" | "outlined"
    required?: boolean;
    onChange(value: string): void;
}) {
    const styles = useStyles();

    return (
      <TFormValue objKey={props.objKey} label={props.label}>
          {p => <FormControl
            className={styles.wrapper}
            style={props.style}
            variant={props.variant || "filled"}
            fullWidth
          >
              <InputLabel style={props.variant === "outlined" ? {backgroundColor: "white"} : undefined} variant={props.variant || "filled"} required={props.required} shrink={true}>{props.label}</InputLabel>
              <Select
                required={props.required}
                defaultValue={p.initialValue}
                onChange={(event) => {
                    p.onChange(event.target.value as any);
                }}
              >
                  {props.children}
              </Select>
          </FormControl>}
      </TFormValue>
    );
}
