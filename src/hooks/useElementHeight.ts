import { useCallback, useEffect, useState } from "react";

export function useElementHeight<T extends HTMLElement>(initialHeight = 0) {
  const [element, setElement] = useState<T | null>(null);
  const [height, setHeight] = useState(initialHeight);

  const ref = useCallback((node: T | null) => {
    setElement(node);
  }, []);

  useEffect(() => {
    if (!element) {
      setHeight(initialHeight);
      return;
    }

    const updateHeight = () => {
      setHeight(Math.ceil(element.getBoundingClientRect().height));
    };

    updateHeight();

    const resizeObserver = new ResizeObserver(updateHeight);
    resizeObserver.observe(element);

    window.addEventListener("resize", updateHeight);

    return () => {
      resizeObserver.disconnect();
      window.removeEventListener("resize", updateHeight);
    };
  }, [element, initialHeight]);

  return [ref, height] as const;
}
