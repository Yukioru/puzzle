'use client';
import { usePathname } from "next/navigation";
import {
  createContext,
  createRef,
  HTMLProps,
  PropsWithChildren,
  RefObject,
  useCallback,
  useMemo,
  useRef,
  useState
} from "react";
import { LoadingScreen } from "~/components/LoadingScreen";

interface GlobalContextValue {
  rootRef: RefObject<HTMLElement | null>;
  loadingScreen: {
    isEnabled: boolean;
    seed: string;
    toggle: (enabled: boolean, seed?: string) => void;
  };
}

const defaultLoadingScreenEnabled = true;

export const GlobalContext = createContext<GlobalContextValue>({
  rootRef: createRef(),
  loadingScreen: {
    isEnabled: defaultLoadingScreenEnabled,
    seed: '',
    toggle: () => {},
  },
});

export function GlobalContextProvider({ children, ...props }: PropsWithChildren<HTMLProps<HTMLElement>>) {
  const pathname = usePathname();
  const rootRef = useRef<HTMLElement | null>(null);

  const resetLoadingScreenState = useCallback(() => {
    return {
      isEnabled: defaultLoadingScreenEnabled,
      seed: pathname,
    };
  }, [pathname]);

  const [loadingScreenState, setLoadingScreenState] = useState(() => resetLoadingScreenState());

  const toggleLoadingScreen = useCallback((enabled: boolean, seed?: string) => {
    setLoadingScreenState(state => {
      const newState = {
        ...state,
        isEnabled: enabled,
      };

      if (seed) {
        newState.seed = seed;
      }

      return newState;
    });
  }, []);

  const ctx = useMemo(() => ({
    rootRef,
    loadingScreen: {
      isEnabled: loadingScreenState.isEnabled,
      seed: loadingScreenState.seed,
      toggle: toggleLoadingScreen,
    }
  }), [
    loadingScreenState.isEnabled,
    loadingScreenState.seed,
    toggleLoadingScreen
  ]);

  return (
    <GlobalContext.Provider
      value={ctx}
    >
      <main ref={rootRef} {...props}>
        {loadingScreenState.isEnabled && (
          <LoadingScreen
            seed={loadingScreenState.seed}
            style={{ position: 'absolute', inset: 0, zIndex: 10 }}
          />
        )}
        {children}
      </main>
    </GlobalContext.Provider>
  );
}
