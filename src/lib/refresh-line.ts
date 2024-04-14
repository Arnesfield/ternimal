import { Interface } from 'readline';
import { RlInterface } from './internal.types.js';

export function refreshLine(
  rl: Interface,
  stream: NodeJS.WritableStream
): void {
  if (!rl.terminal) {
    // do nothing
  } else if (typeof (rl as RlInterface)._refreshLine === 'function') {
    (rl as RlInterface)._refreshLine();
  } else {
    // NOTE: emitting resize event triggers refresh
    // see https://github.com/nodejs/node lib/internal/readline/interface.js
    // include data to differentiate
    // original resize (undefined) from workaround (refreshLine)
    stream.emit('resize', { reason: 'refreshLine' });
  }
}
