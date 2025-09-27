'use client';
import { createContext, createRef, HTMLProps, PropsWithChildren, useRef } from "react";

export const GlobalContext = createContext({
  rootRef: createRef()
});

export function GlobalContextProvider({ children, ...props }: PropsWithChildren<HTMLProps<HTMLElement>>) {
  const rootRef = useRef<HTMLElement>(null);
  return (
    <GlobalContext.Provider value={{ rootRef }}>
      <main ref={rootRef} {...props}>
        {children}
      </main>
    </GlobalContext.Provider>
  );
}
