import {
  OptionsObject,
  SnackbarKey,
  SnackbarProvider,
  useSnackbar,
} from "notistack";
import React, { PropsWithChildren } from "react";

export function showSuccessSnack(msg: string): SnackbarKey {
  return showSnack(msg, {
    variant: "success",
  });
}

export function showSnack(msg: string, options?: OptionsObject): SnackbarKey {
  if (!show) throw new Error("missing TSnackbarProvider");
  return show(msg, options);
}

export function hideSnack(key: SnackbarKey) {
  if (!hide) throw new Error("missing TSnackbarProvider");
  return hide(key);
}

export function TSnackbarProvider(props: PropsWithChildren<{}>) {
  return (
    <SnackbarProvider maxSnack={3} autoHideDuration={5 * 1000}>
      <TSnackbar />
      {props.children}
    </SnackbarProvider>
  );
}

let show: ((msg: string, options?: OptionsObject) => SnackbarKey) | null = null;
let hide: ((key: SnackbarKey) => void) | null = null;

function TSnackbar() {
  const { enqueueSnackbar, closeSnackbar } = useSnackbar();
  show = enqueueSnackbar;
  hide = closeSnackbar;

  return null;
}
