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
    progress?: number;
    toggle: (enabled: boolean, options?: { seed?: string; progress?: number }) => void;
    setProgress: (progress: number) => void;
  };
}

const defaultLoadingScreenEnabled = true;

export const GlobalContext = createContext<GlobalContextValue>({
  rootRef: createRef(),
  loadingScreen: {
    isEnabled: defaultLoadingScreenEnabled,
    seed: '',
    progress: 0,
    toggle: () => {},
    setProgress: () => {},
  },
});

export function GlobalContextProvider({ children, ...props }: PropsWithChildren<HTMLProps<HTMLElement>>) {
  const pathname = usePathname();
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const rootRef = useRef<HTMLElement | null>(null);

  const resetLoadingScreenState = useCallback(() => {
    return {
      isEnabled: defaultLoadingScreenEnabled,
      seed: pathname,
      progress: 0,
    };
  }, [pathname]);

  const [loadingScreenState, setLoadingScreenState] = useState(() => resetLoadingScreenState());

  const toggleLoadingScreen = useCallback((enabled: boolean, { seed, progress }: { seed?: string; progress?: number } = {}) => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    if (typeof progress !== 'undefined') {
      setLoadingScreenState(prevState => ({
        ...prevState,
        progress: progress || (enabled ? 0 : 100),
      }));
    }

    const delay = (progress === 100 || !enabled) ? 300 : 0;
    
    timeoutRef.current = setTimeout(() => {
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
    }, delay);

  }, []);

  const setLoadingProgress = useCallback((progress: number) => {
    setLoadingScreenState(state => ({
      ...state,
      progress,
    }));
  }, []);

  const ctx = useMemo(() => ({
    rootRef,
    loadingScreen: {
      isEnabled: loadingScreenState.isEnabled,
      seed: loadingScreenState.seed,
      progress: loadingScreenState.progress,
      toggle: toggleLoadingScreen,
      setProgress: setLoadingProgress,
    }
  }), [
    loadingScreenState.isEnabled,
    loadingScreenState.seed,
    loadingScreenState.progress,
    toggleLoadingScreen,
    setLoadingProgress,
  ]);

  return (
    <GlobalContext.Provider
      value={ctx}
    >
      <main ref={rootRef} {...props}>
        {loadingScreenState.isEnabled && (
          <LoadingScreen
            continuous={loadingScreenState.progress !== 100}
            seed={loadingScreenState.seed}
            progress={loadingScreenState.progress}
            style={{ position: 'absolute', inset: 0, zIndex: 10 }}
          />
        )}
        {children}
      </main>
    </GlobalContext.Provider>
  );
}
