// Небольшой хук для асинхронных запросов репозитория с состояниями
// loading / error / ready. Работает и с локальным JSON.

import { useEffect, useRef, useState } from 'react';

export type QueryStatus = 'loading' | 'ready' | 'error';

export interface QueryResult<T> {
  data: T | null;
  status: QueryStatus;
  error: Error | null;
}

export function useQuery<T>(fn: () => Promise<T>, deps: unknown[]): QueryResult<T> {
  const [state, setState] = useState<QueryResult<T>>({
    data: null,
    status: 'loading',
    error: null,
  });
  const fnRef = useRef(fn);
  fnRef.current = fn;

  useEffect(() => {
    let cancelled = false;
    setState((s) => ({ ...s, status: 'loading' }));
    fnRef
      .current()
      .then((data) => {
        if (!cancelled) setState({ data, status: 'ready', error: null });
      })
      .catch((error: Error) => {
        if (!cancelled) setState({ data: null, status: 'error', error });
      });
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);

  return state;
}
