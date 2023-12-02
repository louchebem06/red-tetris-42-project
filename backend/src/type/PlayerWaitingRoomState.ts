import { State as CoState } from './PlayerConnectionState';
export type State = CoState | 'ready' | 'idle' | 'active' | 'left' | undefined | null;
