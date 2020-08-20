import {
  createContext,
  useState,
  useContext,
  Dispatch,
  SetStateAction,
  ReactNode,
} from "react";

type State = {
  title: string;
  player?: videojs.VideoJsPlayer;
};
const initialState = {
  title: "学習コンテンツ管理",
};

export const StateContext = createContext<State>(initialState);
export const DispatchContext = createContext<Dispatch<SetStateAction<State>>>(
  () => {}
);

export const useAppState = () => {
  return useContext(StateContext);
};

export const useDispatch = () => {
  return useContext(DispatchContext);
};

export const StateProvider = (props: { children: ReactNode }) => {
  const [state, dispatch] = useState<State>(initialState);

  return (
    <StateContext.Provider value={state}>
      <DispatchContext.Provider value={dispatch}>
        {props.children}
      </DispatchContext.Provider>
    </StateContext.Provider>
  );
};

function makeDispatch<T extends keyof State>(key: T) {
  function hook() {
    const appDispatch = useDispatch();
    function dispatch(value: State[T]) {
      appDispatch((s) => (s[key] === value ? s : { ...s, [key]: value }));
    }
    return dispatch;
  }
  return hook;
}
export const useAppTitle = makeDispatch("title");
export const useAppPlayer = makeDispatch("player");
