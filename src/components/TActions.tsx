import React from 'react';
import { Button, Grid } from '@mui/material';

export function TActions(props: { loadingOrError: JSX.Element | null; onCancel?: () => void; confirmText?: string }) {
  return (
    <Grid container justifyContent="flex-end" spacing={2}>
      {props.loadingOrError && <Grid item>{props.loadingOrError}</Grid>}
      {props.onCancel && (
        <Grid item>
          <Button variant="contained" onClick={props.onCancel}>
            Cancel
          </Button>
        </Grid>
      )}
      <Grid item>
        <Button variant="contained" color="primary" type="submit">
          {props.confirmText || 'Save'}
        </Button>
      </Grid>
    </Grid>
  );
}
