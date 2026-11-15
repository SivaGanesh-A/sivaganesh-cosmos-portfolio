import { useSyncExternalStore } from 'react';

// Tiny shared store so DOM content can talk to the 3D scene (e.g. hovering a skill group).
let state = { activeSkill: null, chatOpen: false };
const listeners = new Set();

export const store = {
  get: () => state,
  set(patch) {
    state = { ...state, ...patch };
    listeners.forEach((l) => l());
  },
  subscribe(l) {
    listeners.add(l);
    return () => listeners.delete(l);
  },
};

export function useStore(selector) {
  return useSyncExternalStore(store.subscribe, () => selector(state));
}

// Scroll state shared with the camera rig without re-rendering React.
export const scrollState = { y: 0 };
