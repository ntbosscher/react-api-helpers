import { useEffect, useState } from 'react';

export function useRefreshOnInterval(ms: number) {
  const [value, setValue] = useState(false);

  useEffect(() => {
    const interval = setInterval(() => setValue((old) => !old), ms);
    return () => clearInterval(interval);
  }, [ms]);
}
