import { useCallback, useState } from 'react';

export interface ElementSize {
  width: number;
  height: number;
}

/**
 * Track an element's rendered size so a chart can be given explicit pixel
 * dimensions. This uses a callback ref rather than a `useRef` + effect pair,
 * because the measured element usually mounts later than the component does
 * (behind a "no molecule yet" placeholder), and an effect with an empty
 * dependency list would then observe nothing.
 * @returns A ref callback to attach to the element, and its current size.
 */
export function useElementSize(): [
  (node: HTMLElement | null) => void,
  ElementSize,
] {
  const [size, setSize] = useState<ElementSize>({ width: 0, height: 0 });

  const ref = useCallback((node: HTMLElement | null) => {
    if (node === null) {
      setSize({ width: 0, height: 0 });
      return undefined;
    }
    const observer = new ResizeObserver((entries) => {
      const entry = entries[0];
      if (entry === undefined) return;
      const { width, height } = entry.contentRect;
      setSize((previous) =>
        previous.width === width && previous.height === height
          ? previous
          : { width, height },
      );
    });
    observer.observe(node);
    // React 19 treats a ref callback's return value as its cleanup and then
    // stops calling the ref with null, so the observer is disconnected here
    // rather than tracked in a ref and torn down on the next call.
    return () => {
      observer.disconnect();
      setSize({ width: 0, height: 0 });
    };
  }, []);

  return [ref, size];
}
