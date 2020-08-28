import * as React from "react";
import {createContext, PropsWithChildren, useContext, useEffect, useMemo, useState} from "react";
import {notAuthorizedResponse} from "./APIBase";

interface Auth {
    authenticated: boolean;
    setAuthenticated(tf: boolean): void;
}

const AuthContext = createContext<Auth>({
    authenticated: false,
    setAuthenticated(tf: boolean) {
        console.error("auth context not configured");
    }
})

export function AuthProvider(props: PropsWithChildren<{}>) {

    const [authenticated, setAuthenticated] = useState(true);
    const ctx = useMemo(() => ({authenticated, setAuthenticated}), [authenticated, setAuthenticated]);

    useEffect(() => {
        const sub = notAuthorizedResponse.subscribe(() => {
            setAuthenticated(false);
        });

        return () => sub.cancel();
    }, []);

    return (
        <AuthContext.Provider value={ctx}>
            {props.children}
        </AuthContext.Provider>
    )
}

export function useAuthenticated() {
    return useContext(AuthContext);
}