import {
  createContext,
  useState,
  useContext,
  Dispatch,
  SetStateAction,
  ReactNode,
} from "react";
import { PlayerTracker } from "./player";

type State = {
  title: string;
  playerTracker?: PlayerTracker;
};

const initialState = {
  title: "学習コンテンツ管理",
};

export const StateContext = createContext<State>(initialState);
export const DispatchContext = createContext<Dispatch<SetStateAction<State>>>(
  () => {}
);

export const useAppState = () => useContext(StateContext);

export const useDispatch = () => useContext(DispatchContext);

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
    function dispatch(state: SetStateAction<State[T]>) {
      appDispatch((prev) => ({
        ...prev,
        [key]: state instanceof Function ? state(prev[key]) : state,
      }));
    }
    return dispatch;
  }
  return hook;
}
export const useAppTitle = makeDispatch("title");
export const useAppPlayerTracker = makeDispatch("playerTracker");
