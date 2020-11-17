import {useEffect} from "react";

export function useDebugValue(value: any, label?: string) {
  useEffect(() => {
    console.log("useDebugValue", label || "", value);
  }, [value]);
}