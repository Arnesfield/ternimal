// NOTE: see https://github.com/nodejs/node lib/internal/util/colors.js
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-expect-error use NodeJS.WriteStream
export function colorize(
  stream: NodeJS.WritableStream,
  stdout: NodeJS.WritableStream
): void;
export function colorize(
  stream: NodeJS.WriteStream,
  stdout: NodeJS.WriteStream
): void {
  // set this to trick node to add colors
  stream.isTTY =
    stdout.isTTY &&
    (typeof stdout.getColorDepth !== 'function' || stdout.getColorDepth() > 2);
}
