import { PauseOptions } from '../types/pause.types.js';
import { Terminal } from '../types/terminal.types.js';

type Status = Terminal<any, any, any, any>['status'];

export function getStatus(
  value: PauseOptions['stdin']
): ReturnType<Status['stdin']>;
export function getStatus(
  value: PauseOptions['stdout']
): ReturnType<Status['stdout']>;
export function getStatus(
  value: PauseOptions['stdout']
): ReturnType<Status['stdout']> {
  // handle possible null value
  return typeof value === 'object' && value?.mute
    ? 'muted'
    : value
      ? 'paused'
      : 'resumed';
}
