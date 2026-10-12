import { useCallback, useEffect, useRef, useState, type Dispatch, type SetStateAction } from 'react';

/** Validated, shareable tabs with browser Back/Forward support. */
export function useUrlTab<T extends string>(tabs: readonly T[], fallback: T, parameter = 'tab', aliases: Record<string, T> = {}): [T, Dispatch<SetStateAction<T>>] {
  const [active, setActive] = useState<T>(tabs.includes(fallback) ? fallback : tabs[0]);
  const latest = useRef(active);
  latest.current = active;
  const key = tabs.join('|');
  const aliasKey = JSON.stringify(aliases);
  useEffect(() => {
    const restore = () => {
      const value = new URLSearchParams(window.location.search).get(parameter) || fallback;
      const canonical = aliases[value] || value as T;
      const next = tabs.includes(canonical) ? canonical : (tabs.includes(fallback) ? fallback : tabs[0]);
      latest.current = next;
      setActive(next);
    };
    restore();
    window.addEventListener('popstate', restore);
    return () => window.removeEventListener('popstate', restore);
  }, [key, fallback, parameter, aliasKey]);

  const change = useCallback<Dispatch<SetStateAction<T>>>(value => {
    const next = typeof value === 'function' ? value(latest.current) : value;
    if (!tabs.includes(next)) return;
    latest.current = next;
    setActive(next);
    const url = new URL(window.location.href);
    if ((url.searchParams.get(parameter) || fallback) === next) return;
    url.searchParams.set(parameter, next);
    window.history.pushState(window.history.state, '', url);
  }, [key, fallback, parameter]);
  return [active, change];
}
