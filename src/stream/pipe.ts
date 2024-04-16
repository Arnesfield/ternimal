import { Transform } from 'stream';

// @ts-expect-error use NodeJS.WriteStream internally
export function pipe(from: Transform, to: NodeJS.WritableStream): void;
export function pipe(from: NodeJS.WriteStream, to: NodeJS.WriteStream): void {
  // NOTE: see https://github.com/nodejs/node lib/internal/util/colors.js
  // colorize transform stream if stream (stdout/stderr) does so
  // set this to trick node to add colors
  from.isTTY =
    to.isTTY &&
    (typeof to.getColorDepth !== 'function' || to.getColorDepth() > 2);
  // pipe stream
  from.pipe(to);
}
