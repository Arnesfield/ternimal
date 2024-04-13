import { Interface } from 'readline';
import { RlInterface } from './internal.types.js';

// use RlInterface for this function
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-expect-error
export function refreshLine(rl: Interface, stream: NodeJS.WritableStream): void;
export function refreshLine(
  rl: RlInterface,
  stream: NodeJS.WritableStream
): void {
  if (!rl.terminal) {
    // do nothing
  } else if (typeof rl._refreshLine === 'function') {
    rl._refreshLine();
  } else {
    // NOTE: emitting resize event triggers refresh
    // see https://github.com/nodejs/node lib/internal/readline/interface.js
    // include data to differentiate
    // original resize (undefined) from workaround (refreshLine)
    stream.emit('resize', { reason: 'refreshLine' });
  }
}
