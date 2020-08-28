
# Nate's React API Helpers

## Installation
```
npm install nate-react-api-helpers
// or
yarn add nate-react-api-helpers
```

## Usage

1. Setup your API endpoints
```ts
import {APIBase} from "nate-react-api-helpers/APIBase";

class API extends APIBase {
    getCustomers(input: {limit?: number}) {
        return this.fetcher.get<Customer[]>("/api/customers", input);
    }
}

interface Customer {
    id: number;
}

export const api = new API();
```

2. Setup auth provider
```tsx
import {AuthProvider} from "nate-react-api-helpers/Auth";

function App() {
    return (<AuthProvider>...rest of your app</AuthProvider>)
}
```

3. Use api endpoints
```tsx
import {useAsync} from "nate-react-api-helpers/AsyncUtils";
import {api} from "../api/API";
import React from "react";
import {Grid} from "@material-ui/core";

export function Customers() {
    const customers = useAsync(() => api.getCustomers());
    if(customers.loadingOrError) {
        return customers.LoadingOrErrorElement;
    }
    
    return (
        <Grid container direction="row" spacing={2}>
            {(customers.result || []).map(p => <Grid item key={p.id}>
                {p.name}
            </Grid>)}
        </Grid>
    )
}

export function PublicProducts() {
    const products = useAsync(() => api.getProducts(), {withoutAuth: true});
    if(products.loadingOrError) {
        return products.LoadingOrErrorElement;
    }

    return (
        <Grid container direction="row" spacing={2}>
            {(products.result || []).map(p => <Grid item key={p.id}>
                {p.name}
            </Grid>)}
        </Grid>
    )
}
```