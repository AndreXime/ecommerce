import { useCallback } from "preact/hooks";
import { useSyncExternalStore } from "preact/compat";
import type { ReadableAtom } from "nanostores";

/**
 * useStore compatível com Preact/Astro.
 * Evita o bug do @nanostores/preact que agenda re-render via setTimeout
 * e perde o update quando o effect faz cleanup (loading infinito).
 */
export function useStore<T>(store: ReadableAtom<T>): T {
	const subscribe = useCallback((onChange: () => void) => store.listen(onChange), [store]);
	const getSnapshot = useCallback(() => store.get(), [store]);
	return useSyncExternalStore(subscribe, getSnapshot);
}
