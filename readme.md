
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

2. Setup auth provider (optional if you use `{withoutAuth: true}` on `useAsync`)
```tsx
import {api} from "../api/API";
import {AuthProvider, useAsyncAction} from "nate-react-api-helpers/Auth"; import {useAuthenticated} from "./Auth";

function App() {
    return (<AuthProvider>
        <LoginModal />
</AuthProvider>)
}

function LoginModal() {
    const auth = useAuthenticated();
    const login = useAsyncAction(async (input) => {
        if(await api.login(input)) {
            auth.setAuthenticated(true);
        }
        // ...
    }, []);
    

    return (
        <Dialog>
            {/* .. inputs .. */}
            <Button onClick={() => login.callback({username, password})}>
        </Dialog>
    );
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

    // will show as loading while we aren't authenticated
    // after useAuthenticated().setAuthenticated(true), this will 
    // automatically re-fetch and resolve normally
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

## FAQ

crypto.getRandomValues() not supported...
- Ensure you've imported `react-native-get-random-values` prior to importing any API-related 
files from this package