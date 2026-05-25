import { createContext, useContext } from 'react';

export const SpeedContext = createContext<number>(1.5);

export function useSpeed(): number {
  return useContext(SpeedContext);
}
