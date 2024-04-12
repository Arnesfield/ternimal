import { Interface } from 'readline';
import { RlInterface } from './internal.types.js';

export function refreshLine(rl: Interface): void {
  if (rl.terminal && typeof (rl as RlInterface)._refreshLine === 'function') {
    (rl as RlInterface)._refreshLine();
  }
}
