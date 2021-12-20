import { AsyncResult } from './AsyncUtils';
import React, { useState, useEffect } from 'react';
import { Card, Fab, Grid, List, ListItem, ListItemText, TextField, Typography } from '@mui/material';
import { Add } from '@mui/icons-material';

export function ListAndDetailViewEditor<T>(props: {
  list: AsyncResult<T[]>;
  idExtractor: (item: T) => any;
  displayName: (item: T) => string;
  searchFields: (item: T) => string[];
  detail: (props: { item: T; onReload: () => void }) => JSX.Element | null;
  create: (props: { onCancel: () => void; onComplete: (id: any) => void }) => JSX.Element | null;
}) {
  const [selectedId, setSelectedId] = useState<any>();
  const [createNew, setCreateNew] = useState(false);

  const noResult = props.list.NoResultElement;
  const result = props.list.result || [];
  const idExtractor = props.idExtractor;

  useEffect(() => {
    if (noResult !== null) {
      setCreateNew(true);
    }

    if (result && result.length > 0 && result.map(idExtractor).indexOf(selectedId as any) === -1) {
      setSelectedId(idExtractor(result[0]));
    }
  }, [noResult, result, selectedId, idExtractor]);

  let list: T[] = result || [];
  const selected = (result || []).filter((r) => props.idExtractor(r) === selectedId)[0];
  const [search, setSearch] = useState('');

  if (search !== '') {
    list = list.filter((o) => props.searchFields(o).filter((v) => v.indexOf(search) !== -1).length > 0);
  }

  return (
    <Grid container spacing={2} style={{ height: '100%', width: '100%' }}>
      <Grid item xs={3}>
        <Card style={{ height: '100%', overflow: 'visible' }}>
          <Grid container direction="column" style={{ height: '100%' }}>
            <Grid item>
              <div style={{ padding: 5 }}>
                <TextField
                  autoComplete="off"
                  fullWidth
                  label="Search"
                  name="search"
                  variant="outlined"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                />
              </div>
            </Grid>
            <Grid item xs>
              <List>
                {props.list.LoadingOrErrorElement}
                {list.map((c) => (
                  <ListItem
                    key={props.idExtractor(c)}
                    button
                    onClick={() => setSelectedId(props.idExtractor(c))}
                    selected={selected === c && !createNew}
                  >
                    <ListItemText>{props.displayName(c)}</ListItemText>
                  </ListItem>
                ))}
                {props.list.NoResultElement === null && props.list.result && list.length === 0 && (
                  <Typography variant="body2" color="textSecondary" style={{ textAlign: 'center' }}>
                    Nothing matches that search
                  </Typography>
                )}
                {props.list.NoResultElement}
              </List>
            </Grid>
            <Grid item style={{ textAlign: 'right' }}>
              <div style={{ padding: 16 }}>
                <Fab color="primary" aria-label="add" onClick={() => setCreateNew(true)}>
                  <Add />
                </Fab>
              </div>
            </Grid>
          </Grid>
        </Card>
      </Grid>
      <Grid item xs={9}>
        <Card style={{ display: 'inline-block', padding: 16 }}>
          {createNew
            ? props.create({
                onCancel: () => {
                  setCreateNew(false);
                },
                onComplete: async (id: any) => {
                  await props.list.reload();
                  setSelectedId(id);
                  setCreateNew(false);
                },
              })
            : props.detail({
                onReload: () => props.list.reload(),
                item: selected,
              })}
        </Card>
      </Grid>
    </Grid>
  );
}
