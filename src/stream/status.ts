import { PauseOptions } from '../types/pause.types.js';
import { Status } from '../types/status.types.js';

export function getStatus(value: PauseOptions['stdin']): Status['stdin'];
export function getStatus(value: PauseOptions['stdout']): Status['stdout'];
export function getStatus(value: PauseOptions['stdout']): Status['stdout'] {
  // handle possible null value
  return typeof value === 'object' && value?.mute
    ? 'muted'
    : value
      ? 'paused'
      : 'resumed';
}
